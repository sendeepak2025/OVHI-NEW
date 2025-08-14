import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Brain, Heart, Activity, Plus, Target } from 'lucide-react';
import { toast } from 'sonner';

interface SessionPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanComplete: (plan: SessionPlan) => void;
  patientData?: any;
  providerSpecialty?: string;
}

interface SessionPlan {
  chiefComplaint: string;
  urgency: 'routine' | 'urgent' | 'emergent';
  focusAreas: string[];
  requiredExams: string[];
  suggestedTests: string[];
  customItems: string[];
  timeEstimate: number;
  specialConsiderations: string;
}

const SessionPlannerModal: React.FC<SessionPlannerModalProps> = ({
  isOpen,
  onClose,
  onPlanComplete,
  patientData,
  providerSpecialty = 'primary-care'
}) => {
  const [plan, setPlan] = useState<SessionPlan>({
    chiefComplaint: '',
    urgency: 'routine',
    focusAreas: [],
    requiredExams: [],
    suggestedTests: [],
    customItems: [],
    timeEstimate: 30,
    specialConsiderations: ''
  });

  const [customItem, setCustomItem] = useState('');
  const [suggestions, setSuggestions] = useState<any>({});

  // Specialty-specific focus areas
  const specialtyFocusAreas = {
    'primary-care': ['Vital Signs', 'General Exam', 'Health Maintenance', 'Chronic Disease Management'],
    'cardiology': ['Cardiovascular Exam', 'ECG Review', 'Echo Assessment', 'Risk Stratification'],
    'mental-health': ['Mental Status Exam', 'Safety Assessment', 'Medication Review', 'Therapy Planning'],
    'endocrinology': ['Diabetes Management', 'Thyroid Assessment', 'Hormone Evaluation', 'Metabolic Review']
  };

  // Chief complaint analysis
  useEffect(() => {
    if (plan.chiefComplaint) {
      analyzeChiefComplaint(plan.chiefComplaint);
    }
  }, [plan.chiefComplaint]);

  const analyzeChiefComplaint = (complaint: string) => {
    const lowerComplaint = complaint.toLowerCase();
    let newSuggestions: any = {
      focusAreas: [],
      exams: [],
      tests: [],
      timeEstimate: 30
    };

    // Chest pain protocol
    if (lowerComplaint.includes('chest pain') || lowerComplaint.includes('chest discomfort')) {
      newSuggestions = {
        focusAreas: ['Cardiovascular Exam', 'Respiratory Exam', 'Pain Assessment'],
        exams: ['Heart Sounds', 'Lung Sounds', 'Chest Palpation', 'Vital Signs'],
        tests: ['ECG', 'Chest X-ray', 'Cardiac Enzymes'],
        timeEstimate: 45
      };
    }
    // Headache protocol
    else if (lowerComplaint.includes('headache') || lowerComplaint.includes('head pain')) {
      newSuggestions = {
        focusAreas: ['Neurological Exam', 'Head/Neck Exam', 'Visual Assessment'],
        exams: ['Cranial Nerves', 'Fundoscopy', 'Neck Stiffness', 'Blood Pressure'],
        tests: ['Blood Pressure Monitoring', 'Consider CT if red flags'],
        timeEstimate: 35
      };
    }
    // Mental health complaints
    else if (lowerComplaint.includes('depression') || lowerComplaint.includes('anxiety')) {
      newSuggestions = {
        focusAreas: ['Mental Status Exam', 'Safety Assessment', 'Medication Review'],
        exams: ['PHQ-9', 'GAD-7', 'Suicide Risk Assessment'],
        tests: ['Consider TSH', 'Vitamin D', 'B12'],
        timeEstimate: 40
      };
    }
    // Diabetes follow-up
    else if (lowerComplaint.includes('diabetes') || lowerComplaint.includes('blood sugar')) {
      newSuggestions = {
        focusAreas: ['Diabetic Exam', 'Foot Exam', 'Eye Exam', 'Medication Review'],
        exams: ['Foot Sensation', 'Monofilament Test', 'Blood Pressure', 'Weight'],
        tests: ['HbA1c', 'Lipid Panel', 'Microalbumin', 'Eye Exam Referral'],
        timeEstimate: 35
      };
    }

    setSuggestions(newSuggestions);
    setPlan(prev => ({
      ...prev,
      timeEstimate: newSuggestions.timeEstimate
    }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setPlan(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(f => f !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleExamToggle = (exam: string) => {
    setPlan(prev => ({
      ...prev,
      requiredExams: prev.requiredExams.includes(exam)
        ? prev.requiredExams.filter(e => e !== exam)
        : [...prev.requiredExams, exam]
    }));
  };

  const handleTestToggle = (test: string) => {
    setPlan(prev => ({
      ...prev,
      suggestedTests: prev.suggestedTests.includes(test)
        ? prev.suggestedTests.filter(t => t !== test)
        : [...prev.suggestedTests, test]
    }));
  };

  const addCustomItem = () => {
    if (customItem.trim()) {
      setPlan(prev => ({
        ...prev,
        customItems: [...prev.customItems, customItem.trim()]
      }));
      setCustomItem('');
    }
  };

  const removeCustomItem = (index: number) => {
    setPlan(prev => ({
      ...prev,
      customItems: prev.customItems.filter((_, i) => i !== index)
    }));
  };

  const handleStartSession = () => {
    if (!plan.chiefComplaint.trim()) {
      toast.error('Please enter the chief complaint');
      return;
    }

    onPlanComplete(plan);
    toast.success('Session plan created successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Smart Session Planner
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Section */}
          <div className="space-y-4">
            {/* Chief Complaint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chief Complaint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="complaint">What brings the patient in today?</Label>
                  <Textarea
                    id="complaint"
                    placeholder="e.g., Chest pain for 2 hours, Routine diabetes follow-up..."
                    value={plan.chiefComplaint}
                    onChange={(e) => setPlan(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="urgency">Visit Urgency</Label>
                  <Select value={plan.urgency} onValueChange={(value: any) => setPlan(prev => ({ ...prev, urgency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergent">Emergent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time">Estimated Time (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={plan.timeEstimate}
                    onChange={(e) => setPlan(prev => ({ ...prev, timeEstimate: parseInt(e.target.value) || 30 }))}
                    min="15"
                    max="120"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Custom Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom item to check..."
                    value={customItem}
                    onChange={(e) => setCustomItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                  />
                  <Button onClick={addCustomItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {plan.customItems.length > 0 && (
                  <div className="space-y-2">
                    {plan.customItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm">{item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomItem(index)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <Label htmlFor="considerations">Special Considerations</Label>
                  <Textarea
                    id="considerations"
                    placeholder="Any special considerations for this patient..."
                    value={plan.specialConsiderations}
                    onChange={(e) => setPlan(prev => ({ ...prev, specialConsiderations: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Suggestions Section */}
          <div className="space-y-4">
            {/* AI Suggestions */}
            {suggestions.focusAreas?.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Suggested Focus Areas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestions.focusAreas.map((area: string) => (
                        <Badge
                          key={area}
                          variant={plan.focusAreas.includes(area) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleFocusAreaToggle(area)}
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Recommended Exams</Label>
                    <div className="space-y-2 mt-2">
                      {suggestions.exams?.map((exam: string) => (
                        <div key={exam} className="flex items-center space-x-2">
                          <Checkbox
                            id={exam}
                            checked={plan.requiredExams.includes(exam)}
                            onCheckedChange={() => handleExamToggle(exam)}
                          />
                          <Label htmlFor={exam} className="text-sm">{exam}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Suggested Tests</Label>
                    <div className="space-y-2 mt-2">
                      {suggestions.tests?.map((test: string) => (
                        <div key={test} className="flex items-center space-x-2">
                          <Checkbox
                            id={test}
                            checked={plan.suggestedTests.includes(test)}
                            onCheckedChange={() => handleTestToggle(test)}
                          />
                          <Label htmlFor={test} className="text-sm">{test}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialty Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  {providerSpecialty.charAt(0).toUpperCase() + providerSpecialty.slice(1)} Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {specialtyFocusAreas[providerSpecialty as keyof typeof specialtyFocusAreas]?.map((area) => (
                    <Badge
                      key={area}
                      variant={plan.focusAreas.includes(area) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFocusAreaToggle(area)}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>Focus Areas:</strong> {plan.focusAreas.length} selected
                </div>
                <div className="text-sm">
                  <strong>Required Exams:</strong> {plan.requiredExams.length} items
                </div>
                <div className="text-sm">
                  <strong>Suggested Tests:</strong> {plan.suggestedTests.length} items
                </div>
                <div className="text-sm">
                  <strong>Custom Items:</strong> {plan.customItems.length} items
                </div>
                <div className="text-sm">
                  <strong>Estimated Time:</strong> {plan.timeEstimate} minutes
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStartSession} className="flex-1">
            Start Smart Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionPlannerModal;