
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BillingDetails, Diagnosis, ProcedureCode, calculateBillingTotal, formatCurrency } from '@/utils/billingUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DiagnosisSelector from './DiagnosisSelector';
import ProcedureSelector from './ProcedureSelector';
import { CalendarIcon, FileText, Save, Send } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BillingFormProps {
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  onSave?: (billingDetails: BillingDetails) => void;
  onCancel?: () => void;
  initialData?: Partial<BillingDetails>;
}

const BillingForm: React.FC<BillingFormProps> = ({ 
  appointmentId, 
  patientId, 
  patientName,
  onSave,
  onCancel,
  initialData 
}) => {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(initialData?.diagnoses || []);
  const [procedures, setProcedures] = useState<ProcedureCode[]>(initialData?.procedures || []);
  const [totalFee, setTotalFee] = useState(initialData?.totalFee || 0);
  const [dateOfService, setDateOfService] = useState<Date>(initialData?.dateOfService || new Date());
  
  const form = useForm({
    defaultValues: {
      providerId: initialData?.providerId || 'dr-smith',
      providerName: 'Dr. Sarah Johnson',
      insuranceId: initialData?.insuranceId || '',
      insuranceName: initialData?.insuranceName || '',
      policyNumber: '',
      copay: initialData?.copay?.toString() || '',
      notes: initialData?.notes || '',
      status: initialData?.status || 'draft'
    }
  });

  // Update total fee when procedures change
  useEffect(() => {
    setTotalFee(calculateBillingTotal(procedures));
  }, [procedures]);

  const handleSave = (formData: any) => {
    if (diagnoses.length === 0) {
      toast.error('At least one diagnosis code is required');
      return;
    }

    if (procedures.length === 0) {
      toast.error('At least one procedure code is required');
      return;
    }

    const billingData: BillingDetails = {
      id: initialData?.id || `bill-${Math.random().toString(36).substr(2, 9)}`,
      appointmentId: appointmentId || 'unknown',
      patientId: patientId || 'unknown',
      providerId: formData.providerId,
      dateOfService,
      diagnoses,
      procedures,
      totalFee,
      insuranceId: formData.insuranceId,
      insuranceName: formData.insuranceName,
      copay: formData.copay ? parseFloat(formData.copay) : undefined,
      status: formData.status,
      notes: formData.notes,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave?.(billingData);
    toast.success('Billing information saved successfully');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Encounter & Billing Information</CardTitle>
            <CardDescription>
              Create billing record for patient encounter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient & Provider Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Patient Information</h3>
                <div className="p-3 border rounded-md">
                  <p className="font-medium">{patientName || 'Unknown Patient'}</p>
                  <p className="text-sm text-muted-foreground">Patient ID: {patientId || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">Appointment ID: {appointmentId || 'Unknown'}</p>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dr-smith">Dr. Sarah Johnson</SelectItem>
                        <SelectItem value="dr-patel">Dr. Raj Patel</SelectItem>
                        <SelectItem value="dr-chen">Dr. Lisa Chen</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date of Service */}
            <div>
              <FormLabel>Date of Service</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfService ? format(dateOfService, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateOfService}
                    onSelect={(date) => date && setDateOfService(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Diagnosis */}
            <div>
              <FormLabel>Diagnosis Codes (ICD-10)</FormLabel>
              <DiagnosisSelector 
                selectedDiagnoses={diagnoses}
                onDiagnosisChange={setDiagnoses}
              />
            </div>

            {/* Procedures */}
            <div>
              <FormLabel>Procedure Codes (CPT)</FormLabel>
              <ProcedureSelector 
                selectedProcedures={procedures}
                onProcedureChange={setProcedures}
              />
            </div>

            {/* Insurance Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insuranceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('insuranceId', value === 'Blue Cross Blue Shield' ? 'ins-12345' : 'ins-67890');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select insurance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Blue Cross Blue Shield">Blue Cross Blue Shield</SelectItem>
                        <SelectItem value="Aetna">Aetna</SelectItem>
                        <SelectItem value="UnitedHealthcare">UnitedHealthcare</SelectItem>
                        <SelectItem value="Cigna">Cigna</SelectItem>
                        <SelectItem value="Medicare">Medicare</SelectItem>
                        <SelectItem value="Medicaid">Medicaid</SelectItem>
                        <SelectItem value="None">Self-Pay (No Insurance)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Co-Pay Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Billing Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted to Insurance</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                      <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes for the billing department"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Calculated Fee</p>
              <p className="text-2xl font-bold">{formatCurrency(totalFee)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="outline" type="button" onClick={() => form.handleSubmit(handleSave)()}>
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Submit Billing
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default BillingForm;
