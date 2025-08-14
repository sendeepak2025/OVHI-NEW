import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock,
  User,
  FileText,
  Stethoscope,
  Brain,
  Clipboard,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import StreamlinedSoapInterface from './StreamlinedSoapInterface';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit?: string;
  conditions?: string[];
  allergies?: string[];
  medications?: string[];
}

interface Template {
  id: string;
  name: string;
  specialty: string;
  type: string;
  estimatedTime: number;
}

interface EncounterWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any;
  onEncounterComplete?: (data: any) => void;
}

const ENCOUNTER_TYPES = [
  { value: 'routine', label: 'Routine Follow-up', time: 15, icon: Calendar },
  { value: 'annual', label: 'Annual Physical', time: 30, icon: Clipboard },
  { value: 'acute', label: 'Acute Visit', time: 20, icon: Stethoscope },
  { value: 'consultation', label: 'Consultation', time: 45, icon: Brain },
  { value: 'procedure', label: 'Procedure', time: 60, icon: Settings }
];

const WORKFLOW_STAGES = [
  { id: 'setup', title: 'Encounter Setup', icon: Settings },
  { id: 'documentation', title: 'SOAP Documentation', icon: FileText },
  { id: 'review', title: 'Review & Complete', icon: CheckCircle }
];

export const SmartEncounterWorkflow: React.FC<EncounterWorkflowProps> = ({
  isOpen,
  onClose,
  appointment,
  onEncounterComplete
}) => {
  const [currentStage, setCurrentStage] = useState('setup');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [encounterType, setEncounterType] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soapData, setSoapData] = useState(null);

  // Mock data - replace with actual API calls
  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      lastVisit: '2024-01-15',
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      allergies: ['Penicillin'],
      medications: ['Metformin', 'Lisinopril']
    }
  ];

  const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'Primary Care Follow-up',
      specialty: 'Family Medicine',
      type: 'routine',
      estimatedTime: 15
    },
    {
      id: '2',
      name: 'Annual Physical Exam',
      specialty: 'Family Medicine',
      type: 'annual',
      estimatedTime: 30
    }
  ];

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, sessionStartTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartEncounter = useCallback(() => {
    if (!selectedPatient || !encounterType) {
      toast.error("Please select a patient and encounter type");
      return;
    }

    setSessionStartTime(new Date());
    setIsTimerRunning(true);
    setCurrentStage('documentation');
    toast.success("Encounter started");
  }, [selectedPatient, encounterType]);

  const handlePauseTimer = useCallback(() => {
    setIsTimerRunning(!isTimerRunning);
    toast.info(isTimerRunning ? "Timer paused" : "Timer resumed");
  }, [isTimerRunning]);

  const handleResetTimer = useCallback(() => {
    setSessionStartTime(new Date());
    setElapsedTime(0);
    setIsTimerRunning(true);
    toast.info("Timer reset");
  }, []);

  const handleSoapSave = useCallback((data: any) => {
    setSoapData(data);
    toast.success("SOAP notes auto-saved");
  }, []);

  const handleEncounterComplete = useCallback((data: any) => {
    setIsTimerRunning(false);
    setCurrentStage('review');
    
    const encounterData = {
      patient: selectedPatient,
      type: encounterType,
      template: selectedTemplate,
      duration: elapsedTime,
      soapNotes: data,
      completedAt: new Date().toISOString()
    };

    onEncounterComplete?.(encounterData);
    toast.success("Encounter completed successfully");
  }, [selectedPatient, encounterType, selectedTemplate, elapsedTime, onEncounterComplete]);

  const getEstimatedTime = (): number => {
    const type = ENCOUNTER_TYPES.find(t => t.value === encounterType);
    return type?.time || 15;
  };

  const isSetupComplete = selectedPatient && encounterType;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Smart Encounter Workflow</span>
            
            {/* Timer Display */}
            {sessionStartTime && (
              <div className="flex items-center gap-3">
                <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                  {formatTime(elapsedTime)}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePauseTimer}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetTimer}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto">
          {/* Stage Progress */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            {WORKFLOW_STAGES.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                  currentStage === stage.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : WORKFLOW_STAGES.findIndex(s => s.id === currentStage) > index
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <stage.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{stage.title}</span>
                </div>
                {index < WORKFLOW_STAGES.length - 1 && (
                  <div className="mx-4 h-px w-8 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>

          {/* Stage Content */}
          {currentStage === 'setup' && (
            <div className="space-y-6">
              {/* Patient Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Patient Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient ? (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{selectedPatient.name}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedPatient.age}y • {selectedPatient.gender} • Last visit: {selectedPatient.lastVisit}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {selectedPatient.conditions?.map((condition) => (
                            <Badge key={condition} variant="secondary" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPatient(null)}
                      >
                        Change Patient
                      </Button>
                    </div>
                  ) : (
                    <Select onValueChange={(value) => {
                      const patient = mockPatients.find(p => p.id === value);
                      setSelectedPatient(patient || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.age}y {patient.gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>

              {/* Encounter Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Encounter Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ENCOUNTER_TYPES.map((type) => (
                      <div
                        key={type.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          encounterType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setEncounterType(type.value)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <type.icon className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium">{type.label}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>~{type.time} minutes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documentation Template (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={(value) => {
                    const template = mockTemplates.find(t => t.id === value);
                    setSelectedTemplate(template || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or start blank" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {template.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Start Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleStartEncounter}
                  disabled={!isSetupComplete}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Encounter ({getEstimatedTime()} min)
                </Button>
              </div>
            </div>
          )}

          {currentStage === 'documentation' && selectedPatient && (
            <StreamlinedSoapInterface
              appointment={appointment}
              patientContext={{
                name: selectedPatient.name,
                age: selectedPatient.age,
                gender: selectedPatient.gender,
                chiefComplaint: appointment?.reason || 'Follow-up visit',
                vitals: {},
                allergies: selectedPatient.allergies || [],
                medications: selectedPatient.medications || [],
                medicalHistory: selectedPatient.conditions || [],
                conditions: selectedPatient.conditions || []
              }}
              onSave={handleSoapSave}
              onComplete={handleEncounterComplete}
            />
          )}

          {currentStage === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Encounter Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Encounter Successfully Completed</h3>
                  <p className="text-gray-600 mb-4">
                    Total time: {formatTime(elapsedTime)} | Patient: {selectedPatient?.name}
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setCurrentStage('setup')}>
                      Start New Encounter
                    </Button>
                    <Button onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartEncounterWorkflow;