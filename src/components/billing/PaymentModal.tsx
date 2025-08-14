
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Calendar, KeyRound, CircleCheck, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/billingUtils";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoiceDetails: {
    id: string;
    amount: number;
    description: string;
    dueDate?: Date;
  };
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, invoiceDetails }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };
  
  const handlePayment = () => {
    // Basic validation
    if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc) {
      toast.error("Please fill in all card details");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Notify of success
      toast.success("Payment processed successfully", {
        description: `Payment of ${formatCurrency(invoiceDetails.amount)} for invoice #${invoiceDetails.id} was successful.`,
        duration: 5000,
      });
      
      // Close modal after a moment
      setTimeout(() => {
        onClose();
        setPaymentSuccess(false);
      }, 2000);
    }, 2000);
  };
  
  if (paymentSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CircleCheck className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-center">Payment Successful!</h2>
            <p className="text-center text-muted-foreground mt-2">
              Your payment of {formatCurrency(invoiceDetails.amount)} has been processed successfully.
            </p>
            <p className="text-sm text-center mt-4">
              A receipt has been sent to your email address.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            Pay invoice #{invoiceDetails.id} with a credit or debit card.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex justify-between my-1">
                <span className="text-muted-foreground">Amount Due:</span>
                <span className="font-medium">{formatCurrency(invoiceDetails.amount)}</span>
              </div>
              <div className="flex justify-between my-1">
                <span className="text-muted-foreground">Invoice ID:</span>
                <span>{invoiceDetails.id}</span>
              </div>
              {invoiceDetails.dueDate && (
                <div className="flex justify-between my-1">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{invoiceDetails.dueDate.toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div>
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
            
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input 
                id="cardName" 
                name="name"
                placeholder="John Doe" 
                value={cardDetails.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiration Date</Label>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year.slice(2)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
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
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${formatCurrency(invoiceDetails.amount)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
