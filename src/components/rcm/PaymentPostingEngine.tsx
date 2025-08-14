import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  DollarSign,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  FileText,
  Bot,
  TrendingUp,
  Calculator,
  CreditCard
} from 'lucide-react';

interface PaymentPosting {
  id: string;
  eraNumber: string;
  payerName: string;
  checkNumber: string;
  checkDate: string;
  totalAmount: number;
  claimsCount: number;
  status: 'pending' | 'processing' | 'posted' | 'exception';
  autoPosted: boolean;
  exceptions?: string[];
}

interface PaymentDetail {
  claimId: string;
  patientName: string;
  serviceDate: string;
  chargedAmount: number;
  paidAmount: number;
  adjustmentAmount: number;
  status: 'posted' | 'exception' | 'pending';
  adjustmentReason?: string;
}

const PaymentPostingEngine: React.FC = () => {
  const [payments, setPayments] = useState<PaymentPosting[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  // Mock payment data
  useEffect(() => {
    const mockPayments: PaymentPosting[] = [
      {
        id: 'ERA001',
        eraNumber: '124567890',
        payerName: 'Blue Cross Blue Shield',
        checkNumber: 'CHK001234',
        checkDate: '2024-01-15',
        totalAmount: 15420.50,
        claimsCount: 25,
        status: 'posted',
        autoPosted: true
      },
      {
        id: 'ERA002',
        eraNumber: '124567891',
        payerName: 'Medicare',
        checkNumber: 'CHK001235',
        checkDate: '2024-01-14',
        totalAmount: 8750.00,
        claimsCount: 18,
        status: 'processing',
        autoPosted: false
      },
      {
        id: 'ERA003',
        eraNumber: '124567892',
        payerName: 'Aetna',
        checkNumber: 'CHK001236',
        checkDate: '2024-01-13',
        totalAmount: 3200.00,
        claimsCount: 8,
        status: 'exception',
        autoPosted: false,
        exceptions: ['Unmatched claim reference', 'Invalid adjustment code']
      }
    ];
    setPayments(mockPayments);

    const mockDetails: PaymentDetail[] = [
      {
        claimId: 'CLM001',
        patientName: 'John Smith',
        serviceDate: '2024-01-10',
        chargedAmount: 250.00,
        paidAmount: 200.00,
        adjustmentAmount: 50.00,
        status: 'posted',
        adjustmentReason: 'Contractual adjustment'
      },
      {
        claimId: 'CLM002',
        patientName: 'Sarah Johnson',
        serviceDate: '2024-01-09',
        chargedAmount: 180.00,
        paidAmount: 180.00,
        adjustmentAmount: 0.00,
        status: 'posted'
      }
    ];
    setPaymentDetails(mockDetails);
  }, []);

  const handleAutoPost = async (paymentId: string) => {
    setProcessing(true);
    try {
      // Simulate auto-posting process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: 'posted' as const, autoPosted: true }
            : payment
        )
      );
      
      toast.success('Payment posted automatically');
    } catch (error) {
      toast.error('Auto-posting failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualPost = async (paymentId: string) => {
    setProcessing(true);
    try {
      // Simulate manual posting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: 'posted' as const, autoPosted: false }
            : payment
        )
      );
      
      toast.success('Payment posted manually');
    } catch (error) {
      toast.error('Manual posting failed');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'exception': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const paymentStats = {
    totalPosted: payments.filter(p => p.status === 'posted').reduce((sum, p) => sum + p.totalAmount, 0),
    autoPostedCount: payments.filter(p => p.autoPosted).length,
    exceptionsCount: payments.filter(p => p.status === 'exception').length,
    processingCount: payments.filter(p => p.status === 'processing').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posted</p>
                <p className="text-2xl font-bold">${paymentStats.totalPosted.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto-Posted</p>
                <p className="text-2xl font-bold">{paymentStats.autoPostedCount}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exceptions</p>
                <p className="text-2xl font-bold">{paymentStats.exceptionsCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{paymentStats.processingCount}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Posting Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Automated Payment Posting Engine
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload ERA Files
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Posting Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">ERA: {payment.eraNumber}</Badge>
                    <span className="font-medium">{payment.payerName}</span>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                    {payment.autoPosted && (
                      <Badge variant="secondary">
                        <Bot className="h-3 w-3 mr-1" />
                        Auto-Posted
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${payment.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{payment.claimsCount} claims</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check Number:</span>
                    <p className="font-medium">{payment.checkNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check Date:</span>
                    <p className="font-medium">{payment.checkDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Claims:</span>
                    <p className="font-medium">{payment.claimsCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium capitalize">{payment.status}</p>
                  </div>
                </div>

                {payment.exceptions && payment.exceptions.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-md border-l-4 border-red-500">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Exceptions Require Attention</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {payment.exceptions.map((exception, index) => (
                        <li key={index}>• {exception}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {payment.status === 'processing' && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="font-medium text-blue-800">Processing Payment</span>
                    </div>
                    <Progress value={65} className="w-full" />
                    <p className="text-sm text-blue-700 mt-2">Matching claims and calculating adjustments...</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {payment.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleAutoPost(payment.id)}
                        disabled={processing}
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Auto-Post
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleManualPost(payment.id)}
                        disabled={processing}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Manual Post
                      </Button>
                    </>
                  )}
                  {payment.status === 'exception' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleManualPost(payment.id)}
                      disabled={processing}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Resolve Exceptions
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <FileText className="h-4 w-4 mr-2" />
                    View ERA Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPostingEngine;