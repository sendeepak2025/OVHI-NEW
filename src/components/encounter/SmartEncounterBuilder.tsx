import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square,
  Mic,
  MicOff,
  FileText,
  Clock,
  Users,
  Activity,
  Brain,
  Stethoscope
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SessionRecorder from './SessionRecorder';
import AIDocumentationEngine from '../ai/AIDocumentationEngine';
import HybridDocumentEditor from './HybridDocumentEditor';

interface SmartEncounterBuilderProps {
  patientId: string;
  providerId: string;
  specialty: string;
  appointmentType: string;
  patientIntakeData?: any;
  onEncounterComplete?: (encounterData: any) => void;
}

interface EncounterTemplate {
  id: string;
  name: string;
  specialty: string;
  sections: {
    subjective: string[];
    objective: string[];
    assessment: string[];
    plan: string[];
  };
  suggestedDuration: number;
  requiredFields: string[];
}

const SmartEncounterBuilder: React.FC<SmartEncounterBuilderProps> = ({
  patientId,
  providerId,
  specialty,
  appointmentType,
  patientIntakeData,
  onEncounterComplete
}) => {
  const { toast } = useToast();
  
  // State management
  const [selectedTemplate, setSelectedTemplate] = useState<EncounterTemplate | null>(null);
  const [encounterData, setEncounterData] = useState<any>({});
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [activeTab, setActiveTab] = useState('setup');
  const [aiGeneratedDocs, setAiGeneratedDocs] = useState<any>({});
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Auto-select template based on specialty and intake data
  useEffect(() => {
    if (specialty && patientIntakeData) {
      const template = selectOptimalTemplate(specialty, appointmentType, patientIntakeData);
      setSelectedTemplate(template);
      
      // Pre-populate encounter data from intake
      const prePopulatedData = populateFromIntake(template, patientIntakeData);
      setEncounterData(prePopulatedData);
    }
  }, [specialty, appointmentType, patientIntakeData]);

  const selectOptimalTemplate = (specialty: string, appointmentType: string, intakeData: any): EncounterTemplate => {
    // Smart template selection logic based on specialty and chief complaint
    const templates: Record<string, EncounterTemplate> = {
      'primary-care': {
        id: 'pc-general',
        name: 'Primary Care - General Visit',
        specialty: 'Primary Care',
        sections: {
          subjective: [
            'Chief Complaint',
            'History of Present Illness',
            'Review of Systems',
            'Past Medical History',
            'Current Medications',
            'Allergies',
            'Social History'
          ],
          objective: [
            'Vital Signs',
            'Physical Examination',
            'Laboratory Results',
            'Diagnostic Studies'
          ],
          assessment: [
            'Primary Diagnosis',
            'Secondary Diagnoses',
            'Risk Stratification'
          ],
          plan: [
            'Treatment Plan',
            'Medications',
            'Follow-up',
            'Patient Education',
            'Preventive Care'
          ]
        },
        suggestedDuration: 30,
        requiredFields: ['chief_complaint', 'vital_signs', 'physical_exam', 'assessment', 'plan']
      },
      'cardiology': {
        id: 'cardio-consultation',
        name: 'Cardiology Consultation',
        specialty: 'Cardiology',
        sections: {
          subjective: [
            'Cardiac Chief Complaint',
            'Chest Pain Assessment',
            'Exercise Tolerance',
            'Cardiac History',
            'Family History of CAD',
            'Risk Factors'
          ],
          objective: [
            'Cardiovascular Examination',
            'ECG Findings',
            'Echocardiogram',
            'Stress Test Results'
          ],
          assessment: [
            'Cardiac Risk Assessment',
            'Functional Class',
            'Prognosis'
          ],
          plan: [
            'Cardiac Medications',
            'Lifestyle Modifications',
            'Cardiac Rehabilitation',
            'Follow-up Studies'
          ]
        },
        suggestedDuration: 45,
        requiredFields: ['cardiac_exam', 'ecg', 'risk_assessment', 'treatment_plan']
      },
      'mental-health': {
        id: 'mh-assessment',
        name: 'Mental Health Assessment',
        specialty: 'Mental Health',
        sections: {
          subjective: [
            'Presenting Concerns',
            'Mental Status',
            'Psychiatric History',
            'Substance Use',
            'Support System',
            'Trauma History'
          ],
          objective: [
            'Mental Status Exam',
            'Behavioral Observations',
            'Cognitive Assessment',
            'Risk Assessment'
          ],
          assessment: [
            'DSM-5 Diagnosis',
            'Severity Assessment',
            'Safety Risk'
          ],
          plan: [
            'Therapeutic Interventions',
            'Medication Management',
            'Crisis Plan',
            'Referrals'
          ]
        },
        suggestedDuration: 60,
        requiredFields: ['mental_status', 'risk_assessment', 'diagnosis', 'safety_plan']
      }
    };

    // Select based on specialty and intake data analysis
    const specialtyKey = specialty.toLowerCase().replace(/\s+/g, '-');
    return templates[specialtyKey] || templates['primary-care'];
  };

  const populateFromIntake = (template: EncounterTemplate, intakeData: any) => {
    const populated = {
      templateId: template.id,
      patientId,
      providerId,
      specialty,
      appointmentType,
      subjective: {
        chief_complaint: intakeData.chiefComplaint || '',
        hpi: intakeData.historyPresentIllness || '',
        review_of_systems: intakeData.reviewOfSystems || {},
        past_medical_history: intakeData.pastMedicalHistory || [],
        medications: intakeData.currentMedications || [],
        allergies: intakeData.allergies || [],
        social_history: intakeData.socialHistory || {}
      },
      objective: {
        vital_signs: {
          bp: intakeData.bloodPressure || '',
          hr: intakeData.heartRate || '',
          temp: intakeData.temperature || '',
          resp: intakeData.respiratoryRate || '',
          o2sat: intakeData.oxygenSaturation || ''
        },
        physical_exam: {},
        lab_results: [],
        diagnostic_studies: []
      },
      assessment: {
        primary_diagnosis: '',
        secondary_diagnoses: [],
        risk_level: intakeData.riskLevel || 'low'
      },
      plan: {
        treatments: [],
        medications: [],
        follow_up: '',
        education: '',
        referrals: []
      }
    };

    return populated;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setActiveTab('documentation');
    toast({
      title: "Recording Started",
      description: "Session recording and transcription are now active."
    });
  };

  const handlePauseRecording = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Recording Resumed" : "Recording Paused",
      description: isPaused ? "Session recording has resumed." : "Session recording has been paused."
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    toast({
      title: "Recording Stopped",
      description: "Processing session data and generating documentation..."
    });
    generateAIDocumentation();
  };

  const generateAIDocumentation = async () => {
    setIsAiProcessing(true);
    setActiveTab('ai-review');
    
    try {
      // This would call the AI documentation engine
      const aiDocs = await processSessionWithAI({
        transcription: transcriptionText,
        encounterData,
        template: selectedTemplate,
        patientIntakeData,
        sessionDuration
      });
      
      setAiGeneratedDocs(aiDocs);
      toast({
        title: "AI Documentation Complete",
        description: "Generated progress notes, SOAP notes, and billing documentation."
      });
    } catch (error) {
      toast({
        title: "AI Processing Error",
        description: "Failed to generate AI documentation. Please try again."
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const processSessionWithAI = async (sessionData: any) => {
    // Mock AI processing - in real implementation this would call OpenAI API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          progressNote: `Progress Note generated from ${sessionData.sessionDuration} minute session...`,
          soapNote: {
            subjective: "Generated subjective section...",
            objective: "Generated objective section...",
            assessment: "Generated assessment section...",
            plan: "Generated plan section..."
          },
          encounterSummary: "Brief encounter summary...",
          billingDocumentation: {
            cptCodes: ['99213', '99214'],
            icdCodes: ['Z00.00'],
            timeSpent: sessionData.sessionDuration,
            complexity: 'moderate'
          }
        });
      }, 3000);
    });
  };

  const TemplatePreview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Selected Template: {selectedTemplate?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{selectedTemplate?.specialty}</Badge>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{selectedTemplate?.suggestedDuration} minutes</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Subjective Sections</h4>
              <ul className="text-sm space-y-1">
                {selectedTemplate?.sections.subjective.map((section, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    {section}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Objective Sections</h4>
              <ul className="text-sm space-y-1">
                {selectedTemplate?.sections.objective.map((section, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {section}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Smart Encounter Builder</h1>
          <p className="text-muted-foreground">
            AI-powered encounter documentation with session recording
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-3">
              {/* Advanced Recording Indicator */}
              <div className="relative flex items-center">
                <div className="absolute inset-0 animate-ping">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-75" />
                </div>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="ml-2 text-sm font-medium text-red-600 animate-pulse">REC</span>
              </div>
              
              {/* Live Audio Visualizer */}
              <div className="flex items-center gap-1 ml-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-bounce"
                    style={{
                      height: `${6 + Math.random() * 8}px`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
              
              <Badge variant="destructive" className="animate-pulse ml-2">
                Recording {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
              </Badge>
            </div>
          )}
          
          {!isRecording ? (
            <Button onClick={handleStartRecording} className="bg-red-600 hover:bg-red-700">
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePauseRecording}
                disabled={!isRecording}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleStopRecording}
                disabled={!isRecording}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Session
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="ai-review">AI Review</TabsTrigger>
          <TabsTrigger value="finalize">Finalize</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <TemplatePreview />
          
          <Card>
            <CardHeader>
              <CardTitle>Pre-populated Data from Patient Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Chief Complaint</h4>
                  <p className="text-sm bg-muted p-2 rounded">
                    {encounterData.subjective?.chief_complaint || 'No chief complaint provided'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Risk Level</h4>
                  <Badge variant={encounterData.assessment?.risk_level === 'high' ? 'destructive' : 'secondary'}>
                    {encounterData.assessment?.risk_level || 'Not assessed'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          {isRecording && (
            <SessionRecorder
              isRecording={isRecording}
              isPaused={isPaused}
              onTranscriptionUpdate={setTranscriptionText}
              onDurationUpdate={setSessionDuration}
            />
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Real-time Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Live Transcription</h4>
                  <div className="h-40 p-3 border rounded bg-muted/50 overflow-y-auto">
                    <p className="text-sm">{transcriptionText || 'Start speaking to see transcription...'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">AI Suggestions</h4>
                  <div className="h-40 p-3 border rounded bg-muted/50 overflow-y-auto">
                    <p className="text-sm text-muted-foreground">
                      AI suggestions will appear here based on conversation...
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-review" className="space-y-6">
          {isAiProcessing ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="animate-spin mx-auto">
                    <Brain className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium">AI Processing Session Data</h3>
                  <p className="text-muted-foreground">
                    Generating documentation from your session...
                  </p>
                  <Progress value={66} className="w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <AIDocumentationEngine
              sessionData={{
                transcription: transcriptionText,
                encounterData,
                template: selectedTemplate,
                duration: sessionDuration
              }}
              onDocumentationGenerated={setAiGeneratedDocs}
            />
          )}
        </TabsContent>

        <TabsContent value="finalize" className="space-y-6">
          <HybridDocumentEditor
            aiGeneratedDocs={aiGeneratedDocs}
            encounterData={encounterData}
            onDocumentUpdate={setEncounterData}
            onEncounterComplete={onEncounterComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartEncounterBuilder;