
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, Calendar, KeyRound, User, Shield, Loader2, CheckCircle, LockKeyhole } from "lucide-react";
import { formatCurrency, mockBillingData } from "@/utils/billingUtils";

const Payment = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  
  // Card form state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expMonth: '',
    expYear: '',
    cvc: '',
  });
  
  // Generate month and year options
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());
  
  useEffect(() => {
    // Simulate API call to fetch invoice
    setTimeout(() => {
      // For demo purposes, find in mock data
      const foundInvoice = mockBillingData.find(bill => bill.id === invoiceId);
      
      if (foundInvoice) {
        setInvoice({
          id: foundInvoice.id,
          amount: foundInvoice.totalFee,
          description: `Medical services - ${foundInvoice.procedures.map(p => p.description).join(', ')}`,
          patientName: "Patient Name", // Would be fetched from patient data
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30))
        });
      } else {
        toast.error("Invoice not found", {
          description: "The requested invoice could not be found."
        });
      }
      
      setLoading(false);
    }, 1000);
  }, [invoiceId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardDetails.number || !cardDetails.name || 
        !cardDetails.expMonth || !cardDetails.expYear || !cardDetails.cvc) {
      toast.error("Please fill in all card details");
      return;
    }
    
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
      
      toast.success("Payment successful!", {
        description: `Your payment of ${invoice ? formatCurrency(invoice.amount) : "$0.00"} has been processed.`,
      });
      
      // Would update the invoice status on the server in real implementation
      
      // Redirect after a moment
      setTimeout(() => {
        navigate('/billing');
      }, 3000);
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }
  
  if (!invoice) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Not Found</CardTitle>
            <CardDescription>
              We couldn't find the invoice you're looking for.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/billing')} className="w-full">
              Return to Billing
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (paymentSuccess) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment of {formatCurrency(invoice.amount)} for invoice #{invoice.id} has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              A receipt has been sent to your email address.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/billing')} className="w-full">
              Return to Billing
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-xl py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Payment Portal</CardTitle>
          <CardDescription>
            Make a secure payment for your medical bill.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Invoice #</span>
              <span className="font-medium">{invoice.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Amount Due</span>
              <span className="font-medium text-lg">{formatCurrency(invoice.amount)}</span>
            </div>
            {invoice.description && (
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Description</span>
                <span className="font-medium">{invoice.description}</span>
              </div>
            )}
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">{invoice.dueDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <div className="relative">
                <Input
                  id="cardName"
                  name="name"
                  placeholder="John Doe"
                  className="pl-10"
                  value={cardDetails.name}
                  onChange={handleInputChange}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  name="number"
                  placeholder="1234 5678 9012 3456"
                  className="pl-10"
                  value={cardDetails.number}
                  onChange={handleInputChange}
                />
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <div className="flex gap-2">
                  <Select 
                    onValueChange={(value) => handleSelectChange('expMonth', value)}
                    value={cardDetails.expMonth}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    onValueChange={(value) => handleSelectChange('expYear', value)}
                    value={cardDetails.expYear}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <div className="relative">
                  <Input
                    id="cvc"
                    name="cvc"
                    placeholder="123"
                    className="pl-10"
                    maxLength={4}
                    value={cardDetails.cvc}
                    onChange={handleInputChange}
                  />
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${invoice ? formatCurrency(invoice.amount) : ""}`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center">
        <div className="flex justify-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <Shield className="h-5 w-5 text-muted-foreground" />
          <LockKeyhole className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          All payments are secure and encrypted. Your card information is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default Payment;
