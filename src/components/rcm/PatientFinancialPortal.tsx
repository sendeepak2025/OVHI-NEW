import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  FileText,
  Calculator,
  Phone,
  Mail,
  AlertCircle,
  Heart
} from 'lucide-react';

interface PatientBalance {
  id: string;
  patientName: string;
  totalBalance: number;
  insuranceBalance: number;
  patientBalance: number;
  lastStatement: string;
  paymentPlan?: {
    monthlyAmount: number;
    remainingPayments: number;
    nextDueDate: string;
  };
  financialAssistance?: {
    status: 'eligible' | 'applied' | 'approved' | 'denied';
    discount: number;
  };
}

interface PaymentPlan {
  duration: number;
  monthlyPayment: number;
  totalInterest: number;
  setup: boolean;
}

const PatientFinancialPortal: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);

  // Mock patient financial data
  const patientBalances: PatientBalance[] = [
    {
      id: 'P001',
      patientName: 'John Smith',
      totalBalance: 1250.00,
      insuranceBalance: 850.00,
      patientBalance: 400.00,
      lastStatement: '2024-01-10',
      paymentPlan: {
        monthlyAmount: 100.00,
        remainingPayments: 4,
        nextDueDate: '2024-02-01'
      }
    },
    {
      id: 'P002',
      patientName: 'Sarah Johnson',
      totalBalance: 850.00,
      insuranceBalance: 0.00,
      patientBalance: 850.00,
      lastStatement: '2024-01-08',
      financialAssistance: {
        status: 'eligible',
        discount: 50
      }
    },
    {
      id: 'P003',
      patientName: 'Michael Brown',
      totalBalance: 2100.00,
      insuranceBalance: 1200.00,
      patientBalance: 900.00,
      lastStatement: '2024-01-05'
    }
  ];

  const calculatePaymentPlan = (balance: number): PaymentPlan[] => {
    const plans = [
      { duration: 6, interestRate: 0 },
      { duration: 12, interestRate: 3.9 },
      { duration: 24, interestRate: 5.9 }
    ];

    return plans.map(plan => {
      const monthlyInterest = plan.interestRate / 100 / 12;
      const monthlyPayment = plan.interestRate === 0 
        ? balance / plan.duration
        : (balance * monthlyInterest * Math.pow(1 + monthlyInterest, plan.duration)) / 
          (Math.pow(1 + monthlyInterest, plan.duration) - 1);
      
      return {
        duration: plan.duration,
        monthlyPayment: monthlyPayment,
        totalInterest: (monthlyPayment * plan.duration) - balance,
        setup: plan.interestRate === 0
      };
    });
  };

  const handlePayment = async () => {
    if (!selectedPatient || !paymentAmount) {
      toast.error('Please select patient and enter payment amount');
      return;
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payment processed successfully');
      setPaymentAmount('');
    } catch (error) {
      toast.error('Payment processing failed');
    }
  };

  const handleSetupPaymentPlan = async (patientId: string, planDetails: PaymentPlan) => {
    try {
      // Simulate payment plan setup
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Payment plan setup successfully');
      setShowPaymentPlan(false);
    } catch (error) {
      toast.error('Failed to setup payment plan');
    }
  };

  const handleFinancialAssistance = async (patientId: string) => {
    try {
      // Simulate financial assistance application
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Financial assistance application submitted');
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const getAssistanceStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-blue-500';
      case 'applied': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'denied': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Financial Services Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Patient Financial Services Portal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Self-service portal for patient payments, payment plans, and financial assistance
          </p>
        </CardHeader>
        <CardContent>
          {/* Quick Payment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Payment</h3>
              <div className="space-y-3">
                <select 
                  value={selectedPatient} 
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select Patient</option>
                  {patientBalances.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patientName} - ${patient.patientBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
                
                <Input
                  type="number"
                  placeholder="Payment Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                
                <Button onClick={handlePayment} className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payment
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Options</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <CreditCard className="h-6 w-6" />
                  <span className="text-sm">Credit Card</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm">Bank Transfer</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Payment Plan</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Heart className="h-6 w-6" />
                  <span className="text-sm">Financial Aid</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientBalances.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{patient.patientName}</span>
                    <Badge variant="outline">ID: {patient.id}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${patient.totalBalance.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Insurance Balance:</span>
                    <p className="font-medium">${patient.insuranceBalance.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Patient Balance:</span>
                    <p className="font-medium">${patient.patientBalance.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Statement:</span>
                    <p className="font-medium">{patient.lastStatement}</p>
                  </div>
                </div>

                {/* Payment Plan Status */}
                {patient.paymentPlan && (
                  <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Active Payment Plan</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                      <div>
                        <span>Monthly Payment:</span>
                        <p className="font-medium">${patient.paymentPlan.monthlyAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span>Remaining Payments:</span>
                        <p className="font-medium">{patient.paymentPlan.remainingPayments}</p>
                      </div>
                      <div>
                        <span>Next Due Date:</span>
                        <p className="font-medium">{patient.paymentPlan.nextDueDate}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Assistance Status */}
                {patient.financialAssistance && (
                  <div className="bg-green-50 p-3 rounded-md border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Financial Assistance</span>
                      <Badge className={getAssistanceStatusColor(patient.financialAssistance.status)}>
                        {patient.financialAssistance.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700">
                      {patient.financialAssistance.discount}% discount available
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Make Payment
                  </Button>
                  {!patient.paymentPlan && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowPaymentPlan(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Setup Payment Plan
                    </Button>
                  )}
                  {patient.financialAssistance?.status === 'eligible' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleFinancialAssistance(patient.id)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Apply for Aid
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <FileText className="h-4 w-4 mr-2" />
                    View Statement
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Plan Options Modal-like display */}
      {showPaymentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Payment Plan Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {calculatePaymentPlan(900).map((plan, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{plan.duration} Months</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.setup ? 'No Interest' : `${plan.totalInterest > 0 ? 'Low Interest' : 'Interest-Free'}`}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-medium">${plan.monthlyPayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-medium">${plan.totalInterest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Setup Fee:</span>
                      <span className="font-medium">{plan.setup ? '$0' : '$25'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant={index === 0 ? 'default' : 'outline'}
                    onClick={() => handleSetupPaymentPlan('', plan)}
                  >
                    {index === 0 && <CheckCircle className="h-4 w-4 mr-2" />}
                    Select Plan
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => setShowPaymentPlan(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientFinancialPortal;