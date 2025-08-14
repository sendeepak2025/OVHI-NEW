import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, RefreshCw, Eye, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface ClaimStatus {
  id: string;
  claimNumber: string;
  claimMDTrackingId: string;
  patientName: string;
  patientId: string;
  serviceDate: string;
  submissionDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'submitted' | 'accepted' | 'processing' | 'paid' | 'denied' | 'appealed' | 'rejected';
  payerId: string;
  payerName: string;
  procedureCodes: string[];
  denialReason?: string;
  remittanceDate?: string;
  checkNumber?: string;
  lastUpdated: string;
  processingDays: number;
  priority: 'normal' | 'urgent' | 'stat';
}

interface ClaimDetails {
  claimStatus: ClaimStatus;
  statusHistory: StatusHistoryEntry[];
  paymentDetails?: PaymentDetails;
  denialDetails?: DenialDetails;
}

interface StatusHistoryEntry {
  status: string;
  date: string;
  description: string;
  source: 'system' | 'claimmd' | 'manual';
}

interface PaymentDetails {
  paymentDate: string;
  checkNumber: string;
  paymentAmount: number;
  adjustmentAmount: number;
  contractualAdjustment: number;
  patientResponsibility: number;
  remittanceAdvice: string;
}

interface DenialDetails {
  denialCode: string;
  denialReason: string;
  appealDeadline: string;
  appealStatus?: 'not_filed' | 'filed' | 'under_review' | 'approved' | 'denied';
  correctionRequired: boolean;
  suggestedActions: string[];
}

const ClaimsStatusTracker: React.FC = () => {
  const [claims, setClaims] = useState<ClaimStatus[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<ClaimStatus[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for demonstration
  const mockClaims: ClaimStatus[] = [
    {
      id: 'CLM001',
      claimNumber: 'CLM-2024-001',
      claimMDTrackingId: 'CMD123456789',
      patientName: 'John Doe',
      patientId: 'PAT001',
      serviceDate: '2024-01-15',
      submissionDate: '2024-01-16',
      totalAmount: 350.00,
      paidAmount: 280.00,
      status: 'paid',
      payerId: 'PAY001',
      payerName: 'Blue Cross Blue Shield',
      procedureCodes: ['99213', '90834'],
      remittanceDate: '2024-01-25',
      checkNumber: 'CHK789123',
      lastUpdated: '2024-01-25T10:30:00Z',
      processingDays: 9,
      priority: 'normal'
    },
    {
      id: 'CLM002',
      claimNumber: 'CLM-2024-002',
      claimMDTrackingId: 'CMD123456790',
      patientName: 'Jane Smith',
      patientId: 'PAT002',
      serviceDate: '2024-01-16',
      submissionDate: '2024-01-17',
      totalAmount: 125.00,
      paidAmount: 0,
      status: 'denied',
      payerId: 'PAY002',
      payerName: 'Aetna',
      procedureCodes: ['99214'],
      denialReason: 'Insufficient documentation',
      lastUpdated: '2024-01-22T14:15:00Z',
      processingDays: 5,
      priority: 'urgent'
    },
    {
      id: 'CLM003',
      claimNumber: 'CLM-2024-003',
      claimMDTrackingId: 'CMD123456791',
      patientName: 'Robert Johnson',
      patientId: 'PAT003',
      serviceDate: '2024-01-18',
      submissionDate: '2024-01-19',
      totalAmount: 450.00,
      paidAmount: 0,
      status: 'processing',
      payerId: 'PAY003',
      payerName: 'United Healthcare',
      procedureCodes: ['99215', '90837'],
      lastUpdated: '2024-01-20T09:00:00Z',
      processingDays: 1,
      priority: 'normal'
    }
  ];

  // Fetch claims from Claim.MD
  const fetchClaimsStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual Claim.MD API integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClaims(mockClaims);
      toast.success('Claims status updated');
    } catch (error) {
      toast.error('Failed to fetch claims status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real-time status updates from Claim.MD
  const checkStatusUpdates = useCallback(async (trackingId: string) => {
    try {
      // This would integrate with Claim.MD API for real-time updates
      const response = await fetch(`/api/claimmd/status/${trackingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const statusUpdate = await response.json();
        return statusUpdate;
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
    return null;
  }, []);

  // Bulk status refresh for all pending claims
  const refreshAllPendingClaims = useCallback(async () => {
    setIsLoading(true);
    try {
      const pendingClaims = claims.filter(c => 
        c.status === 'submitted' || c.status === 'processing'
      );
      
      const updatePromises = pendingClaims.map(claim => 
        checkStatusUpdates(claim.claimMDTrackingId)
      );
      
      await Promise.all(updatePromises);
      await fetchClaimsStatus();
      toast.success(`Updated status for ${pendingClaims.length} pending claims`);
    } catch (error) {
      toast.error('Failed to refresh pending claims');
    } finally {
      setIsLoading(false);
    }
  }, [claims, checkStatusUpdates, fetchClaimsStatus]);

  // Filter claims based on search and status
  useEffect(() => {
    let filtered = claims;
    
    if (searchTerm) {
      filtered = filtered.filter(claim =>
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimMDTrackingId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }
    
    setFilteredClaims(filtered);
  }, [claims, searchTerm, statusFilter]);

  // Auto-refresh pending claims every 5 minutes
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshAllPendingClaims, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshAllPendingClaims]);

  // Load initial data
  useEffect(() => {
    fetchClaimsStatus();
  }, [fetchClaimsStatus]);

  // Get claim details with history
  const getClaimDetails = (claim: ClaimStatus): ClaimDetails => {
    const mockStatusHistory: StatusHistoryEntry[] = [
      {
        status: 'submitted',
        date: claim.submissionDate,
        description: 'Claim submitted to Claim.MD',
        source: 'system'
      },
      {
        status: 'accepted',
        date: '2024-01-17T08:00:00Z',
        description: 'Claim accepted by clearinghouse',
        source: 'claimmd'
      }
    ];

    if (claim.status === 'paid') {
      mockStatusHistory.push({
        status: 'paid',
        date: claim.remittanceDate || '',
        description: `Payment received - Check #${claim.checkNumber}`,
        source: 'claimmd'
      });
    } else if (claim.status === 'denied') {
      mockStatusHistory.push({
        status: 'denied',
        date: claim.lastUpdated,
        description: claim.denialReason || 'Claim denied',
        source: 'claimmd'
      });
    }

    return {
      claimStatus: claim,
      statusHistory: mockStatusHistory,
      paymentDetails: claim.status === 'paid' ? {
        paymentDate: claim.remittanceDate || '',
        checkNumber: claim.checkNumber || '',
        paymentAmount: claim.paidAmount,
        adjustmentAmount: claim.totalAmount - claim.paidAmount,
        contractualAdjustment: 50.00,
        patientResponsibility: 20.00,
        remittanceAdvice: 'ERA_835_' + claim.claimMDTrackingId
      } : undefined,
      denialDetails: claim.status === 'denied' ? {
        denialCode: 'CO-97',
        denialReason: claim.denialReason || '',
        appealDeadline: '2024-03-01',
        appealStatus: 'not_filed',
        correctionRequired: true,
        suggestedActions: [
          'Provide additional documentation',
          'Verify patient eligibility',
          'Check coding accuracy'
        ]
      } : undefined
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'denied':
      case 'rejected':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      case 'submitted':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProcessingProgress = (days: number, status: string) => {
    if (status === 'paid' || status === 'denied') return 100;
    const maxDays = 30; // Typical processing time
    return Math.min((days / maxDays) * 100, 90);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Claims Status Tracker</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={autoRefresh ? 'bg-green-100' : 'bg-gray-100'}>
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
              </Button>
              <Button onClick={refreshAllPendingClaims} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh All'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{claims.length}</div>
              <div className="text-sm text-muted-foreground">Total Claims</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {claims.filter(c => c.status === 'paid').length}
              </div>
              <div className="text-sm text-muted-foreground">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {claims.filter(c => c.status === 'processing').length}
              </div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {claims.filter(c => c.status === 'submitted').length}
              </div>
              <div className="text-sm text-muted-foreground">Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {claims.filter(c => c.status === 'denied').length}
              </div>
              <div className="text-sm text-muted-foreground">Denied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${claims.reduce((sum, c) => sum + c.paidAmount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Collected</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by claim number, patient name, or tracking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="denied">Denied</option>
            </select>
          </div>

          {/* Claims Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processing</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{claim.claimNumber}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {claim.claimMDTrackingId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{claim.patientName}</div>
                      <div className="text-xs text-muted-foreground">{claim.patientId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{claim.payerName}</TableCell>
                  <TableCell>{new Date(claim.serviceDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${claim.totalAmount.toFixed(2)}</div>
                      {claim.paidAmount > 0 && (
                        <div className="text-xs text-green-600">
                          Paid: ${claim.paidAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(claim.status)}
                      <Badge variant="secondary" className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {claim.processingDays} days
                      </div>
                      <Progress 
                        value={getProcessingProgress(claim.processingDays, claim.status)}
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {claim.priority !== 'normal' && (
                      <Badge variant="outline" className={getPriorityColor(claim.priority)}>
                        {claim.priority}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(getClaimDetails(claim));
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Claim Details - {selectedClaim?.claimStatus.claimNumber}
                          </DialogTitle>
                        </DialogHeader>
                        {selectedClaim && (
                          <div className="space-y-6">
                            {/* Claim Overview */}
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Claim Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div>Tracking ID: {selectedClaim.claimStatus.claimMDTrackingId}</div>
                                  <div>Patient: {selectedClaim.claimStatus.patientName}</div>
                                  <div>Service Date: {new Date(selectedClaim.claimStatus.serviceDate).toLocaleDateString()}</div>
                                  <div>Procedures: {selectedClaim.claimStatus.procedureCodes.join(', ')}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Financial Summary</h4>
                                <div className="space-y-2 text-sm">
                                  <div>Total Charges: ${selectedClaim.claimStatus.totalAmount.toFixed(2)}</div>
                                  <div>Paid Amount: ${selectedClaim.claimStatus.paidAmount.toFixed(2)}</div>
                                  <div>Outstanding: ${(selectedClaim.claimStatus.totalAmount - selectedClaim.claimStatus.paidAmount).toFixed(2)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Status History */}
                            <div>
                              <h4 className="font-medium mb-2">Status History</h4>
                              <div className="space-y-2">
                                {selectedClaim.statusHistory.map((entry, index) => (
                                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(entry.date).toLocaleString()}
                                    </div>
                                    <Badge variant="outline">{entry.status}</Badge>
                                    <div className="text-sm">{entry.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Payment Details */}
                            {selectedClaim.paymentDetails && (
                              <div>
                                <h4 className="font-medium mb-2">Payment Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>Payment Date: {new Date(selectedClaim.paymentDetails.paymentDate).toLocaleDateString()}</div>
                                  <div>Check Number: {selectedClaim.paymentDetails.checkNumber}</div>
                                  <div>Payment Amount: ${selectedClaim.paymentDetails.paymentAmount.toFixed(2)}</div>
                                  <div>Adjustment: ${selectedClaim.paymentDetails.adjustmentAmount.toFixed(2)}</div>
                                </div>
                              </div>
                            )}

                            {/* Denial Details */}
                            {selectedClaim.denialDetails && (
                              <div>
                                <h4 className="font-medium mb-2 text-red-600">Denial Information</h4>
                                <div className="space-y-2">
                                  <div>Denial Code: {selectedClaim.denialDetails.denialCode}</div>
                                  <div>Reason: {selectedClaim.denialDetails.denialReason}</div>
                                  <div>Appeal Deadline: {new Date(selectedClaim.denialDetails.appealDeadline).toLocaleDateString()}</div>
                                  <div>
                                    <div className="font-medium">Suggested Actions:</div>
                                    <ul className="list-disc list-inside">
                                      {selectedClaim.denialDetails.suggestedActions.map((action, index) => (
                                        <li key={index}>{action}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimsStatusTracker;