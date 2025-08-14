import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, User, Calendar, Clock, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManualVisitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (visitData: any) => void;
}

const ManualVisitDialog: React.FC<ManualVisitDialogProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { toast } = useToast();
  const [visitData, setVisitData] = useState({
    patientName: '',
    patientId: '',
    visitType: '',
    chiefComplaint: '',
    visitDate: new Date().toISOString().split('T')[0],
    provider: '',
    notes: ''
  });

  const handleSubmit = () => {
    if (!visitData.patientName || !visitData.visitType || !visitData.chiefComplaint) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(visitData);
    setVisitData({
      patientName: '',
      patientId: '',
      visitType: '',
      chiefComplaint: '',
      visitDate: new Date().toISOString().split('T')[0],
      provider: '',
      notes: ''
    });
    onClose();
    
    toast({
      title: "Manual Visit Created",
      description: "Manual visit has been started successfully."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Start Manual Visit
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={visitData.patientName}
                    onChange={(e) => setVisitData({ ...visitData, patientName: e.target.value })}
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    value={visitData.patientId}
                    onChange={(e) => setVisitData({ ...visitData, patientId: e.target.value })}
                    placeholder="Optional patient ID"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Visit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visitType">Visit Type *</Label>
                  <Select value={visitData.visitType} onValueChange={(value) => setVisitData({ ...visitData, visitType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="routine-checkup">Routine Checkup</SelectItem>
                      <SelectItem value="specialist-referral">Specialist Referral</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="visitDate">Visit Date</Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={visitData.visitDate}
                    onChange={(e) => setVisitData({ ...visitData, visitDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={visitData.provider} onValueChange={(value) => setVisitData({ ...visitData, provider: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-smith">Dr. Smith (Primary Care)</SelectItem>
                    <SelectItem value="dr-johnson">Dr. Johnson (Cardiology)</SelectItem>
                    <SelectItem value="dr-brown">Dr. Brown (Neurology)</SelectItem>
                    <SelectItem value="dr-davis">Dr. Davis (Mental Health)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Clinical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                <Textarea
                  id="chiefComplaint"
                  value={visitData.chiefComplaint}
                  onChange={(e) => setVisitData({ ...visitData, chiefComplaint: e.target.value })}
                  placeholder="Describe the main reason for the visit"
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={visitData.notes}
                  onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
                  placeholder="Any additional notes or observations"
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              <Clock className="h-4 w-4 mr-2" />
              Start Manual Visit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualVisitDialog;