import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Send, Mail, AlertTriangle, Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { PatientEncounterData, Patient } from '@/types/dataTypes';

interface EncounterFaxDialogProps {
  encounter: PatientEncounterData | null;
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EncounterFaxDialog: React.FC<EncounterFaxDialogProps> = ({
  encounter,
  patient,
  open,
  onOpenChange
}) => {
  const [faxData, setFaxData] = useState({
    recipientName: '',
    recipientFax: '',
    recipientPhone: '',
    recipientEmail: '',
    urgency: 'routine' as 'routine' | 'urgent' | 'stat',
    coverLetter: '',
    hipaaCompliant: false,
    includeEncounterNotes: true,
    includeDiagnosisCodes: true,
    includeProcedureCodes: true,
    includeFollowUpPlan: true
  });
  
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (encounter && patient) {
      generateEncounterCoverLetter();
    }
  }, [encounter, patient]);

  const generateEncounterCoverLetter = () => {
    if (!encounter || !patient) return;

    const coverLetter = `
CONFIDENTIAL MEDICAL ENCOUNTER TRANSMISSION

TO: [Recipient Name]
FAX: [Recipient Fax]
FROM: [Practice Name]
DATE: ${new Date().toLocaleDateString()}

PATIENT: ${patient.firstName} ${patient.lastName}
DOB: ${patient.birthDate}
PATIENT ID: ${patient.patientId}

ENCOUNTER DETAILS:
Date: ${new Date(encounter.created).toLocaleDateString()}
Type: ${encounter.encounter_type}
Reason: ${encounter.reason_for_visit}
Status: ${encounter.status}

${encounter.diagnosis_codes ? `DIAGNOSIS CODES: ${encounter.diagnosis_codes}` : ''}
${encounter.procedure_codes ? `PROCEDURE CODES: ${encounter.procedure_codes}` : ''}

Dear Healthcare Provider,

Please find attached the encounter details for the above-named patient. This transmission is being sent in accordance with HIPAA regulations and with appropriate patient authorization.

${encounter.notes ? `\nENCOUNTER NOTES:\n${encounter.notes}` : ''}

${encounter.follow_up_plan ? `\nFOLLOW-UP PLAN:\n${encounter.follow_up_plan}` : ''}

If you have any questions regarding this encounter or need additional information, please contact our office at [Practice Phone].

This communication contains confidential patient health information. If you are not the intended recipient, please notify us immediately and destroy this transmission.

Sincerely,
[Provider Name]
[Practice Name]
    `.trim();

    setFaxData(prev => ({
      ...prev,
      coverLetter: coverLetter
        .replace('[Practice Name]', 'Your Practice Name')
        .replace('[Practice Phone]', '(555) 123-4567')
        .replace('[Provider Name]', 'Dr. Provider Name')
    }));
  };

  const handleSendFax = async () => {
    if (!faxData.recipientName || !faxData.recipientFax) {
      toast.error('Please fill in recipient information');
      return;
    }

    if (!faxData.hipaaCompliant) {
      toast.error('HIPAA compliance confirmation is required');
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call to send encounter fax
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`Encounter fax sent successfully to ${faxData.recipientName}`);
      
      // Reset form and close dialog
      setFaxData({
        recipientName: '',
        recipientFax: '',
        recipientPhone: '',
        recipientEmail: '',
        urgency: 'routine',
        coverLetter: '',
        hipaaCompliant: false,
        includeEncounterNotes: true,
        includeDiagnosisCodes: true,
        includeProcedureCodes: true,
        includeFollowUpPlan: true
      });
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to send encounter fax');
    } finally {
      setIsSending(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'stat': return 'destructive';
      case 'urgent': return 'default';
      default: return 'secondary';
    }
  };

  if (!encounter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Fax Encounter - {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Encounter Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Encounter Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(encounter.created).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">{encounter.encounter_type}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Reason for Visit</Label>
                <p className="text-sm text-muted-foreground">{encounter.reason_for_visit}</p>
              </div>
              
              {encounter.diagnosis_codes && (
                <div>
                  <Label className="text-sm font-medium">Diagnosis Codes</Label>
                  <p className="text-sm text-muted-foreground">{encounter.diagnosis_codes}</p>
                </div>
              )}
              
              {encounter.procedure_codes && (
                <div>
                  <Label className="text-sm font-medium">Procedure Codes</Label>
                  <p className="text-sm text-muted-foreground">{encounter.procedure_codes}</p>
                </div>
              )}

              <div className="pt-3 border-t">
                <Label className="text-sm font-medium mb-2 block">Include in Fax:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeNotes"
                      checked={faxData.includeEncounterNotes}
                      onCheckedChange={(checked) => setFaxData(prev => ({
                        ...prev,
                        includeEncounterNotes: checked as boolean
                      }))}
                    />
                    <Label htmlFor="includeNotes" className="text-sm">Encounter Notes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeDiagnosis"
                      checked={faxData.includeDiagnosisCodes}
                      onCheckedChange={(checked) => setFaxData(prev => ({
                        ...prev,
                        includeDiagnosisCodes: checked as boolean
                      }))}
                    />
                    <Label htmlFor="includeDiagnosis" className="text-sm">Diagnosis Codes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeProcedures"
                      checked={faxData.includeProcedureCodes}
                      onCheckedChange={(checked) => setFaxData(prev => ({
                        ...prev,
                        includeProcedureCodes: checked as boolean
                      }))}
                    />
                    <Label htmlFor="includeProcedures" className="text-sm">Procedure Codes</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeFollowUp"
                      checked={faxData.includeFollowUpPlan}
                      onCheckedChange={(checked) => setFaxData(prev => ({
                        ...prev,
                        includeFollowUpPlan: checked as boolean
                      }))}
                    />
                    <Label htmlFor="includeFollowUp" className="text-sm">Follow-up Plan</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Recipient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipientName">Recipient Name *</Label>
                <Input
                  id="recipientName"
                  value={faxData.recipientName}
                  onChange={(e) => setFaxData(prev => ({
                    ...prev,
                    recipientName: e.target.value
                  }))}
                  placeholder="Dr. John Smith"
                />
              </div>
              
              <div>
                <Label htmlFor="recipientFax">Fax Number *</Label>
                <Input
                  id="recipientFax"
                  value={faxData.recipientFax}
                  onChange={(e) => setFaxData(prev => ({
                    ...prev,
                    recipientFax: e.target.value
                  }))}
                  placeholder="555-123-4567"
                />
              </div>
              
              <div>
                <Label htmlFor="recipientPhone">Phone Number</Label>
                <Input
                  id="recipientPhone"
                  value={faxData.recipientPhone}
                  onChange={(e) => setFaxData(prev => ({
                    ...prev,
                    recipientPhone: e.target.value
                  }))}
                  placeholder="555-123-4568"
                />
              </div>
              
              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={faxData.urgency}
                  onValueChange={(value) => setFaxData(prev => ({
                    ...prev,
                    urgency: value as 'routine' | 'urgent' | 'stat'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Badge variant={getUrgencyColor(faxData.urgency)}>
                  {faxData.urgency.toUpperCase()}
                </Badge>
                {faxData.urgency === 'stat' && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cover Letter */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={faxData.coverLetter}
              onChange={(e) => setFaxData(prev => ({
                ...prev,
                coverLetter: e.target.value
              }))}
              rows={12}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* HIPAA Compliance and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hipaa-compliance"
                  checked={faxData.hipaaCompliant}
                  onCheckedChange={(checked) => setFaxData(prev => ({
                    ...prev,
                    hipaaCompliant: checked as boolean
                  }))}
                />
                <Label htmlFor="hipaa-compliance" className="text-sm">
                  I confirm this transmission complies with HIPAA regulations and I have proper authorization to send this patient's encounter information
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendFax}
                disabled={isSending || !faxData.hipaaCompliant}
              >
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Encounter Fax
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};