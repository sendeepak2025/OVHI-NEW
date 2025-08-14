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
  UserPlus, Calendar, Stethoscope, FileText, Plus,
  MapPin, Phone, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { PatientEncounterData, Patient, MedicalRecord } from '@/types/dataTypes';

interface EncounterReferralDialogProps {
  encounter: PatientEncounterData | null;
  patient: Patient;
  medicalRecords: MedicalRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReferralData {
  specialistType: string;
  specialistName: string;
  specialistPhone: string;
  specialistFax: string;
  specialistEmail: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'stat';
  clinicalNotes: string;
  attachedRecords: string[];
  requestedServices: string[];
  appointmentType: 'consultation' | 'treatment' | 'second_opinion';
  expectedDuration: string;
  followUpRequired: boolean;
}

export const EncounterReferralDialog: React.FC<EncounterReferralDialogProps> = ({
  encounter,
  patient,
  medicalRecords,
  open,
  onOpenChange
}) => {
  const [referralData, setReferralData] = useState<ReferralData>({
    specialistType: '',
    specialistName: '',
    specialistPhone: '',
    specialistFax: '',
    specialistEmail: '',
    reason: '',
    urgency: 'routine',
    clinicalNotes: '',
    attachedRecords: [],
    requestedServices: [],
    appointmentType: 'consultation',
    expectedDuration: '30 minutes',
    followUpRequired: true
  });

  const [isCreating, setIsCreating] = useState(false);

  // Common specialist types
  const specialistTypes = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'Hematology/Oncology', 'Nephrology', 'Neurology', 'Orthopedics',
    'Pulmonology', 'Rheumatology', 'Urology', 'Mental Health',
    'Physical Therapy', 'Radiology', 'Surgery', 'Other'
  ];

  // Smart specialist suggestions based on diagnosis codes
  const getSpecialistSuggestions = (diagnosisCodes: string) => {
    if (!diagnosisCodes) return [];
    
    const suggestions = [];
    const codes = diagnosisCodes.toLowerCase();
    
    if (codes.includes('e11') || codes.includes('diabetes')) suggestions.push('Endocrinology');
    if (codes.includes('i10') || codes.includes('hypertension')) suggestions.push('Cardiology');
    if (codes.includes('m79') || codes.includes('joint')) suggestions.push('Rheumatology');
    if (codes.includes('j44') || codes.includes('copd')) suggestions.push('Pulmonology');
    if (codes.includes('l20') || codes.includes('dermatitis')) suggestions.push('Dermatology');
    if (codes.includes('g93') || codes.includes('neurologic')) suggestions.push('Neurology');
    
    return suggestions;
  };

  useEffect(() => {
    if (encounter && patient) {
      initializeReferralData();
    }
  }, [encounter, patient]);

  const initializeReferralData = () => {
    if (!encounter) return;

    // Auto-suggest specialist based on diagnosis codes
    const suggestions = getSpecialistSuggestions(encounter.diagnosis_codes || '');
    const suggestedSpecialist = suggestions[0] || '';

    // Pre-populate reason based on encounter data
    const reason = `Referral for ${encounter.encounter_type} - ${encounter.reason_for_visit}`;
    
    // Generate clinical notes
    const clinicalNotes = `
ENCOUNTER-BASED REFERRAL

Patient: ${patient.firstName} ${patient.lastName}
DOB: ${patient.birthDate}
Encounter Date: ${new Date(encounter.created).toLocaleDateString()}
Encounter Type: ${encounter.encounter_type}

REASON FOR VISIT: ${encounter.reason_for_visit}

${encounter.diagnosis_codes ? `DIAGNOSIS CODES: ${encounter.diagnosis_codes}` : ''}
${encounter.procedure_codes ? `PROCEDURE CODES: ${encounter.procedure_codes}` : ''}

CLINICAL NOTES:
${encounter.notes || 'Please see attached encounter documentation.'}

${encounter.follow_up_plan ? `FOLLOW-UP PLAN: ${encounter.follow_up_plan}` : ''}

Please evaluate and provide recommendations for ongoing care. Thank you for your consultation.
    `.trim();

    setReferralData(prev => ({
      ...prev,
      specialistType: suggestedSpecialist,
      reason: reason,
      clinicalNotes: clinicalNotes
    }));
  };

  const handleRecordSelection = (recordId: string, checked: boolean) => {
    setReferralData(prev => ({
      ...prev,
      attachedRecords: checked 
        ? [...prev.attachedRecords, recordId]
        : prev.attachedRecords.filter(id => id !== recordId)
    }));
  };

  const handleCreateReferral = async () => {
    if (!referralData.specialistType || !referralData.reason) {
      toast.error('Please fill in specialist type and reason for referral');
      return;
    }

    setIsCreating(true);

    try {
      // Simulate API call to create referral
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`Referral created successfully for ${referralData.specialistType}`);
      
      // Reset form and close dialog
      setReferralData({
        specialistType: '',
        specialistName: '',
        specialistPhone: '',
        specialistFax: '',
        specialistEmail: '',
        reason: '',
        urgency: 'routine',
        clinicalNotes: '',
        attachedRecords: [],
        requestedServices: [],
        appointmentType: 'consultation',
        expectedDuration: '30 minutes',
        followUpRequired: true
      });
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create referral');
    } finally {
      setIsCreating(false);
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

  const suggestions = getSpecialistSuggestions(encounter.diagnosis_codes || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Create Referral from Encounter - {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Encounter Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Encounter Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
              
              <div>
                <Label className="text-sm font-medium">Reason</Label>
                <p className="text-sm text-muted-foreground">{encounter.reason_for_visit}</p>
              </div>
              
              {encounter.diagnosis_codes && (
                <div>
                  <Label className="text-sm font-medium">Diagnosis Codes</Label>
                  <p className="text-sm text-muted-foreground">{encounter.diagnosis_codes}</p>
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="pt-3 border-t">
                  <Label className="text-sm font-medium mb-2 block">Suggested Specialists:</Label>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.map((suggestion) => (
                      <Badge 
                        key={suggestion} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setReferralData(prev => ({ ...prev, specialistType: suggestion }))}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specialist Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-4 w-4 mr-2" />
                Specialist Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="specialistType">Specialist Type *</Label>
                <Select
                  value={referralData.specialistType}
                  onValueChange={(value) => setReferralData(prev => ({
                    ...prev,
                    specialistType: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialist type" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialistTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="specialistName">Specialist Name</Label>
                <Input
                  id="specialistName"
                  value={referralData.specialistName}
                  onChange={(e) => setReferralData(prev => ({
                    ...prev,
                    specialistName: e.target.value
                  }))}
                  placeholder="Dr. Jane Smith"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="specialistPhone">Phone</Label>
                  <Input
                    id="specialistPhone"
                    value={referralData.specialistPhone}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      specialistPhone: e.target.value
                    }))}
                    placeholder="555-123-4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialistFax">Fax</Label>
                  <Input
                    id="specialistFax"
                    value={referralData.specialistFax}
                    onChange={(e) => setReferralData(prev => ({
                      ...prev,
                      specialistFax: e.target.value
                    }))}
                    placeholder="555-123-4568"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="appointmentType">Appointment Type</Label>
                  <Select
                    value={referralData.appointmentType}
                    onValueChange={(value) => setReferralData(prev => ({
                      ...prev,
                      appointmentType: value as 'consultation' | 'treatment' | 'second_opinion'
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="second_opinion">Second Opinion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select
                    value={referralData.urgency}
                    onValueChange={(value) => setReferralData(prev => ({
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
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={getUrgencyColor(referralData.urgency)}>
                  {referralData.urgency.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {referralData.appointmentType}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Medical Records Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Attach Medical Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {medicalRecords.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-start space-x-3 p-2 border rounded">
                    <Checkbox
                      id={`record-${record.id}`}
                      checked={referralData.attachedRecords.includes(record.id)}
                      onCheckedChange={(checked) => 
                        handleRecordSelection(record.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={`record-${record.id}`}
                        className="text-xs font-medium cursor-pointer"
                      >
                        {record.type}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {record.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {referralData.attachedRecords.length > 0 && (
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                  {referralData.attachedRecords.length} record(s) selected
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Referral Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reason for Referral</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={referralData.reason}
                onChange={(e) => setReferralData(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
                rows={4}
                placeholder="Brief reason for referral..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={referralData.clinicalNotes}
                onChange={(e) => setReferralData(prev => ({
                  ...prev,
                  clinicalNotes: e.target.value
                }))}
                rows={4}
                className="font-mono text-sm"
                placeholder="Detailed clinical information..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followUpRequired"
                  checked={referralData.followUpRequired}
                  onCheckedChange={(checked) => setReferralData(prev => ({
                    ...prev,
                    followUpRequired: checked as boolean
                  }))}
                />
                <Label htmlFor="followUpRequired" className="text-sm">
                  Follow-up required with referring provider
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateReferral}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Referral
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