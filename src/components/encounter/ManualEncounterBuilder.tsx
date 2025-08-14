import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Clock, CheckCircle2, User, FileText, Stethoscope, Brain, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SessionPlannerModal from './SessionPlannerModal';
import ClinicalDecisionSupport from './ClinicalDecisionSupport';

interface ManualEncounterBuilderProps {
  patientId: string;
  providerId: string;
  specialty: string;
  appointmentType: string;
  patientData?: any;
  onEncounterComplete: (encounterData: any) => void;
}

interface SessionPlan {
  chiefComplaint: string;
  urgency: string;
  focusAreas: string[];
  requiredExams: string[];
  suggestedTests: string[];
  customItems: string[];
  timeEstimate: number;
  specialConsiderations: string;
}

interface SOAPNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'focus' | 'exam' | 'test' | 'custom';
  priority: 'high' | 'medium' | 'low';
  timeRequired: number;
}

const ManualEncounterBuilder: React.FC<ManualEncounterBuilderProps> = ({
  patientId,
  providerId,
  specialty,
  appointmentType,
  patientData,
  onEncounterComplete
}) => {
  const { toast } = useToast();
  const [showPlanner, setShowPlanner] = useState(true);
  const [sessionPlan, setSessionPlan] = useState<SessionPlan | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [soapNotes, setSoapNotes] = useState<SOAPNotes>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });
  const [encounterData, setEncounterData] = useState({
    visitType: appointmentType,
    chiefComplaint: '',
    duration: 0,
    vitals: {
      bp: '',
      hr: '',
      temp: '',
      resp: '',
      o2sat: '',
      weight: '',
      height: ''
    },
    clinicalNotes: '',
    diagnoses: [] as string[],
    procedures: [] as string[],
    prescriptions: [] as any[],
    followUp: '',
    patientInstructions: ''
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionStartTime] = useState(new Date());
  const [aiAssistanceEnabled, setAiAssistanceEnabled] = useState(true);

  const steps = [
    { id: 'planning', title: 'Session Planning', icon: Brain },
    { id: 'checklist', title: 'Clinical Checklist', icon: CheckCircle2 },
    { id: 'vitals', title: 'Vitals & Exam', icon: Stethoscope },
    { id: 'documentation', title: 'Documentation', icon: FileText },
    { id: 'review', title: 'Review & Complete', icon: Save }
  ];

  useEffect(() => {
    if (sessionPlan && !checklist.length) {
      initializeChecklist();
    }
  }, [sessionPlan]);

  const initializeChecklist = () => {
    if (!sessionPlan) return;

    const items: ChecklistItem[] = [
      ...sessionPlan.focusAreas.map((area, index) => ({
        id: `focus-${index}`,
        text: area,
        completed: false,
        category: 'focus' as const,
        priority: 'high' as const,
        timeRequired: 5
      })),
      ...sessionPlan.requiredExams.map((exam, index) => ({
        id: `exam-${index}`,
        text: exam,
        completed: false,
        category: 'exam' as const,
        priority: 'medium' as const,
        timeRequired: 10
      })),
      ...sessionPlan.suggestedTests.map((test, index) => ({
        id: `test-${index}`,
        text: test,
        completed: false,
        category: 'test' as const,
        priority: 'medium' as const,
        timeRequired: 5
      })),
      ...sessionPlan.customItems.map((item, index) => ({
        id: `custom-${index}`,
        text: item,
        completed: false,
        category: 'custom' as const,
        priority: 'low' as const,
        timeRequired: 3
      }))
    ];

    setChecklist(items);
  };

  const handlePlanComplete = (plan: SessionPlan) => {
    setSessionPlan(plan);
    setEncounterData(prev => ({
      ...prev,
      chiefComplaint: plan.chiefComplaint
    }));
    setShowPlanner(false);
    setCurrentStep(1);
    toast({
      title: "Session Plan Created",
      description: `Smart checklist with ${plan.focusAreas.length + plan.requiredExams.length} items generated.`
    });
  };

  const handleChecklistToggle = (itemId: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const addCustomChecklistItem = (text: string) => {
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text,
      completed: false,
      category: 'custom',
      priority: 'low',
      timeRequired: 5
    };
    setChecklist(prev => [...prev, newItem]);
  };

  const getCompletionPercentage = () => {
    if (!checklist.length) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Starting Session Planning</h3>
            <p className="text-muted-foreground">Configure your encounter based on chief complaint and specialty</p>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Clinical Checklist</h3>
              <div className="flex items-center gap-2">
                <Progress value={getCompletionPercentage()} className="w-32" />
                <span className="text-sm text-muted-foreground">{getCompletionPercentage()}%</span>
              </div>
            </div>

            <div className="grid gap-4">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => handleChecklistToggle(item.id)}
                  />
                  <div className="flex-1">
                    <p className={`${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">{item.timeRequired} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input placeholder="Add custom checklist item..." className="flex-1" />
              <Button onClick={() => addCustomChecklistItem("Custom item")}>Add</Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vitals & Physical Examination</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vital Signs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bp">Blood Pressure</Label>
                    <Input
                      id="bp"
                      placeholder="120/80"
                      value={encounterData.vitals.bp}
                      onChange={(e) => setEncounterData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, bp: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hr">Heart Rate</Label>
                    <Input
                      id="hr"
                      placeholder="72"
                      value={encounterData.vitals.hr}
                      onChange={(e) => setEncounterData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, hr: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="temp">Temperature</Label>
                    <Input
                      id="temp"
                      placeholder="98.6°F"
                      value={encounterData.vitals.temp}
                      onChange={(e) => setEncounterData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, temp: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="o2sat">O2 Saturation</Label>
                    <Input
                      id="o2sat"
                      placeholder="98%"
                      value={encounterData.vitals.o2sat}
                      onChange={(e) => setEncounterData(prev => ({
                        ...prev,
                        vitals: { ...prev.vitals, o2sat: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clinical Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Record your clinical observations, physical exam findings, and patient interaction notes..."
                  value={encounterData.clinicalNotes}
                  onChange={(e) => setEncounterData(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                  className="min-h-32"
                />
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">SOAP Documentation</h3>
            
            <Tabs defaultValue="subjective" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="subjective">Subjective</TabsTrigger>
                <TabsTrigger value="objective">Objective</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="plan">Plan</TabsTrigger>
              </TabsList>
              
              <TabsContent value="subjective" className="space-y-4">
                <Textarea
                  placeholder="Patient's chief complaint, history of present illness, review of systems..."
                  value={soapNotes.subjective}
                  onChange={(e) => setSoapNotes(prev => ({ ...prev, subjective: e.target.value }))}
                  className="min-h-32"
                />
                {aiAssistanceEnabled && (
                  <ClinicalDecisionSupport
                    patientData={patientData}
                    encounterData={encounterData}
                    sessionPlan={sessionPlan}
                    soapNotes={soapNotes}
                    onSuggestionApply={(section, content) => {
                      setSoapNotes(prev => ({ ...prev, [section]: content }));
                    }}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="objective" className="space-y-4">
                <Textarea
                  placeholder="Physical examination findings, vital signs, diagnostic test results..."
                  value={soapNotes.objective}
                  onChange={(e) => setSoapNotes(prev => ({ ...prev, objective: e.target.value }))}
                  className="min-h-32"
                />
              </TabsContent>
              
              <TabsContent value="assessment" className="space-y-4">
                <Textarea
                  placeholder="Clinical impression, differential diagnosis, assessment of condition..."
                  value={soapNotes.assessment}
                  onChange={(e) => setSoapNotes(prev => ({ ...prev, assessment: e.target.value }))}
                  className="min-h-32"
                />
              </TabsContent>
              
              <TabsContent value="plan" className="space-y-4">
                <Textarea
                  placeholder="Treatment plan, medications, follow-up instructions, patient education..."
                  value={soapNotes.plan}
                  onChange={(e) => setSoapNotes(prev => ({ ...prev, plan: e.target.value }))}
                  className="min-h-32"
                />
              </TabsContent>
            </Tabs>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Complete Encounter</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Chief Complaint:</span>
                    <span className="font-medium">{encounterData.chiefComplaint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Checklist Completion:</span>
                    <span className="font-medium">{getCompletionPercentage()}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Duration:</span>
                    <span className="font-medium">
                      {Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000)} min
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documentation Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {soapNotes.subjective ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    <span>Subjective Notes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {soapNotes.objective ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    <span>Objective Findings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {soapNotes.assessment ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    <span>Assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {soapNotes.plan ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    <span>Treatment Plan</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={handleCompleteEncounter} 
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Complete Manual Encounter
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const handleCompleteEncounter = () => {
    const completeEncounterData = {
      type: 'manual',
      sessionPlan,
      checklist,
      soapNotes,
      encounterData,
      completionPercentage: getCompletionPercentage(),
      sessionDuration: Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000),
      timestamp: new Date().toISOString()
    };

    onEncounterComplete(completeEncounterData);
    
    toast({
      title: "Manual Encounter Completed",
      description: `Documentation saved with ${getCompletionPercentage()}% checklist completion.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Session Planner Modal */}
      <SessionPlannerModal
        isOpen={showPlanner}
        onClose={() => setShowPlanner(false)}
        onPlanComplete={handlePlanComplete}
        patientData={patientData}
        providerSpecialty={specialty}
      />

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <div className={`flex flex-col items-center ${isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}>
                <div className={`rounded-full p-2 mb-2 ${isActive ? 'bg-primary text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-center">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <Separator className="flex-1 mx-2" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardContent className="pt-6">
          {getCurrentStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep > 0 && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          >
            Previous
          </Button>
          {currentStep < steps.length - 1 && (
            <Button 
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualEncounterBuilder;