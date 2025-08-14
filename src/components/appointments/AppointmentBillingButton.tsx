
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, FileText } from 'lucide-react';
import BillingForm from '@/components/billing/BillingForm';
import { generateMockBilling, BillingDetails } from '@/utils/billingUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import CMS1500Form from '@/components/billing/CMS1500Form';
import { generateCMS1500FormData } from '@/utils/cms1500Utils';

interface AppointmentBillingButtonProps {
  appointmentId: string;
  patientId: string;
  patientName: string;
  onBillingCreated?: (billingData: BillingDetails) => void;
}

const AppointmentBillingButton: React.FC<AppointmentBillingButtonProps> = ({
  appointmentId,
  patientId,
  patientName,
  onBillingCreated
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('billing-form');
  const [currentBilling, setCurrentBilling] = useState<BillingDetails | null>(null);
  
  const handleCreateBilling = () => {
    setIsDialogOpen(true);
    setActiveTab('billing-form');
  };
  
  const handleSaveBilling = (billingData: BillingDetails) => {
    setCurrentBilling(billingData);
    onBillingCreated?.(billingData);
    
    // After saving, enable the CMS-1500 tab
    setActiveTab('cms1500-form');
    toast.success('Billing record created successfully');
  };
  
  const handlePrintCMS1500 = () => {
    toast.info('Printing CMS-1500 form...');
    // In a real app, this would trigger printing
    setTimeout(() => {
      toast.success('CMS-1500 form sent to printer');
    }, 1500);
  };
  
  const handleDownloadCMS1500 = () => {
    toast.success('CMS-1500 form downloaded successfully');
    // In a real app, this would download the PDF
  };
  
  // Mock patient and provider info for demo purposes
  const mockPatientInfo = {
    name: patientName,
    dateOfBirth: '1975-05-15',
    gender: 'Male',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    phone: '555-123-4567',
    employer: 'Acme Corporation',
    insuranceGroup: 'GRP12345'
  };
  
  const mockProviderInfo = {
    name: 'Dr. Sarah Johnson',
    npi: '1234567890',
    taxId: '12-3456789',
    address: '456 Medical Pkwy',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    phone: '555-987-6543'
  };
  
  // Generate CMS1500 form data only if currentBilling exists
  const cms1500FormData = currentBilling 
    ? generateCMS1500FormData(currentBilling, mockPatientInfo, mockProviderInfo)
    : null;
  
  return (
    <>
      {/* <Button
        variant="outline"
        className="flex items-center gap-1"
        onClick={handleCreateBilling}
      >
        <DollarSign className="h-4 w-4" />
        Create Bill
      </Button> */}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Billing for Appointment</DialogTitle>
            <DialogDescription>
              Create a billing record for appointment #{appointmentId} with {patientName}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="billing-form">Billing Form</TabsTrigger>
              <TabsTrigger 
                value="cms1500-form" 
                disabled={!currentBilling}
              >
                CMS-1500 Form
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="billing-form">
              <BillingForm
                appointmentId={appointmentId}
                patientId={patientId}
                patientName={patientName}
                initialData={currentBilling || generateMockBilling(appointmentId, patientId)}
                onSave={handleSaveBilling}
                onCancel={() => setIsDialogOpen(false)}
              />
            </TabsContent>
            
            <TabsContent value="cms1500-form">
              {currentBilling && cms1500FormData && (
                <CMS1500Form 
                  onPrintForm={handlePrintCMS1500}
                  onDownloadForm={handleDownloadCMS1500}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentBillingButton;
