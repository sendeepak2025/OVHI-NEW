import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface ClaimMDConfig {
  apiUrl: string;
  clientId: string;
  environment: 'sandbox' | 'production';
  batchSize: number;
}

interface EligibilityRequest {
  patientId: string;
  memberId: string;
  payerId: string;
  serviceDate: string;
  providerNPI: string;
}

interface EligibilityResponse {
  isEligible: boolean;
  copay: number;
  deductible: number;
  coinsurance: number;
  outOfPocketMax: number;
  planName: string;
  effectiveDate: string;
  terminationDate?: string;
}

interface ClaimsSubmissionRequest {
  claimId: string;
  patientId: string;
  ediContent: string;
  priority: 'normal' | 'urgent';
}

interface ClaimsSubmissionResponse {
  claimMDTrackingId: string;
  status: 'submitted' | 'accepted' | 'rejected';
  confirmationNumber: string;
  submissionDate: string;
  errors?: string[];
}

interface ClaimStatusResponse {
  trackingId: string;
  status: 'pending' | 'processed' | 'paid' | 'denied';
  paymentDate?: string;
  paymentAmount?: number;
  denialReason?: string;
  remittanceAdvice?: string;
}

const ClaimMDConnector: React.FC = () => {
  const [config] = useState<ClaimMDConfig>({
    apiUrl: 'https://api.claim.md/v1',
    clientId:import.meta.env.VITE_CLAIM_MD_CLIENT_ID || '',
    environment: 'sandbox',
    batchSize: 100
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Real-time eligibility verification
  const verifyEligibility = async (request: EligibilityRequest): Promise<EligibilityResponse> => {
    try {
      const response = await fetch(`${config.apiUrl}/eligibility/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.clientId}`,
          'X-Environment': config.environment
        },
        body: JSON.stringify({
          transaction_type: '270',
          subscriber: {
            member_id: request.memberId,
            payer_id: request.payerId
          },
          provider: {
            npi: request.providerNPI
          },
          service_date: request.serviceDate
        })
      });

      if (!response.ok) {
        throw new Error(`Eligibility verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        isEligible: data.eligibility_status === 'active',
        copay: data.copay_amount || 0,
        deductible: data.deductible_remaining || 0,
        coinsurance: data.coinsurance_percentage || 0,
        outOfPocketMax: data.out_of_pocket_maximum || 0,
        planName: data.plan_name || '',
        effectiveDate: data.effective_date,
        terminationDate: data.termination_date
      };
    } catch (error) {
      console.error('Eligibility verification error:', error);
      throw error;
    }
  };

  // Claims submission to Claim.MD
  const submitClaim = async (request: ClaimsSubmissionRequest): Promise<ClaimsSubmissionResponse> => {
    try {
      const response = await fetch(`${config.apiUrl}/claims/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.clientId}`,
          'X-Environment': config.environment
        },
        body: JSON.stringify({
          transaction_type: '837P',
          claim_id: request.claimId,
          edi_content: request.ediContent,
          priority: request.priority,
          submitter_id: config.clientId
        })
      });

      if (!response.ok) {
        throw new Error(`Claims submission failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        claimMDTrackingId: data.tracking_id,
        status: data.submission_status,
        confirmationNumber: data.confirmation_number,
        submissionDate: data.submission_date,
        errors: data.validation_errors
      };
    } catch (error) {
      console.error('Claims submission error:', error);
      throw error;
    }
  };

  // Batch claims submission
  const submitClaimsBatch = async (claims: ClaimsSubmissionRequest[]): Promise<ClaimsSubmissionResponse[]> => {
    const batches = [];
    for (let i = 0; i < claims.length; i += config.batchSize) {
      batches.push(claims.slice(i, i + config.batchSize));
    }

    const results: ClaimsSubmissionResponse[] = [];
    
    for (const batch of batches) {
      try {
        const batchPromises = batch.map(claim => submitClaim(claim));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error('Batch submission error:', error);
        throw error;
      }
    }

    return results;
  };

  // Real-time claims status inquiry
  const getClaimStatus = async (trackingId: string): Promise<ClaimStatusResponse> => {
    try {
      const response = await fetch(`${config.apiUrl}/claims/status/${trackingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.clientId}`,
          'X-Environment': config.environment
        }
      });

      if (!response.ok) {
        throw new Error(`Status inquiry failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        trackingId: data.tracking_id,
        status: data.claim_status,
        paymentDate: data.payment_date,
        paymentAmount: data.payment_amount,
        denialReason: data.denial_reason,
        remittanceAdvice: data.remittance_advice
      };
    } catch (error) {
      console.error('Status inquiry error:', error);
      throw error;
    }
  };

  // Process ERA (835) transactions
  const processERA = async (eraFile: string): Promise<any> => {
    try {
      const response = await fetch(`${config.apiUrl}/payments/era/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.clientId}`,
          'X-Environment': config.environment
        },
        body: JSON.stringify({
          transaction_type: '835',
          era_content: eraFile
        })
      });

      if (!response.ok) {
        throw new Error(`ERA processing failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ERA processing error:', error);
      throw error;
    }
  };

  // Test connection to Claim.MD
  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch(`${config.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.clientId}`,
          'X-Environment': config.environment
        }
      });

      if (response.ok) {
        setConnectionStatus('connected');
        setLastSync(new Date());
        toast.success('Successfully connected to Claim.MD');
      } else {
        setConnectionStatus('disconnected');
        toast.error('Failed to connect to Claim.MD');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      toast.error('Connection test failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'testing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'testing':
        return 'bg-blue-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Claim.MD Integration</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="secondary" className={getStatusColor()}>
              {connectionStatus}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Environment</label>
            <p className="font-medium">{config.environment}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Batch Size</label>
            <p className="font-medium">{config.batchSize} claims</p>
          </div>
        </div>

        {lastSync && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last sync: {lastSync.toLocaleString()}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
            {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button variant="outline" onClick={() => setLastSync(new Date())}>
            Force Sync
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Available Services</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Eligibility Verification (270/271)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Claims Submission (837P)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Claims Status (276/277)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Payment Processing (835)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaimMDConnector;

// Export service functions for use in other components
export {
  type EligibilityRequest,
  type EligibilityResponse,
  type ClaimsSubmissionRequest,
  type ClaimsSubmissionResponse,
  type ClaimStatusResponse
};