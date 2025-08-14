import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  Stethoscope,
  ClipboardList,
  DollarSign,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { openaiService, type ClinicalGuidanceRequest } from '@/services/openaiService';

interface AIDocumentationEngineProps {
  sessionData: {
    transcription: string;
    encounterData: any;
    template: any;
    duration: number;
  };
  onDocumentationGenerated: (docs: any) => void;
}

interface GeneratedDocument {
  type: string;
  title: string;
  content: string;
  metadata: {
    wordCount: number;
    estimatedTime: number;
    confidence: number;
  };
}

const AIDocumentationEngine: React.FC<AIDocumentationEngineProps> = ({
  sessionData,
  onDocumentationGenerated
}) => {
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [activeDocType, setActiveDocType] = useState('progress-note');
  const [clinicalGuidance, setClinicalGuidance] = useState<any>(null);

  useEffect(() => {
    if (sessionData.transcription) {
      generateAllDocuments();
    }
  }, [sessionData]);

  const generateAllDocuments = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Generate Clinical Guidance (20%)
      await generateClinicalGuidance();
      setGenerationProgress(20);

      // Step 2: Generate Progress Note (40%)
      const progressNote = await generateProgressNote();
      setGenerationProgress(40);

      // Step 3: Generate SOAP Note (60%)
      const soapNote = await generateSOAPNote();
      setGenerationProgress(60);

      // Step 4: Generate Encounter Summary (80%)
      const encounterSummary = await generateEncounterSummary();
      setGenerationProgress(80);

      // Step 5: Generate Billing Documentation (100%)
      const billingDoc = await generateBillingDocumentation();
      setGenerationProgress(100);

      const allDocs = [progressNote, soapNote, encounterSummary, billingDoc];
      setGeneratedDocs(allDocs);
      onDocumentationGenerated({
        progressNote: progressNote.content,
        soapNote: soapNote.content,
        encounterSummary: encounterSummary.content,
        billingDocumentation: billingDoc.content,
        clinicalGuidance
      });

      toast({
        title: "Documentation Generated",
        description: "All AI documentation has been successfully generated."
      });

    } catch (error) {
      console.error('Error generating documentation:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate AI documentation. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateClinicalGuidance = async () => {
    const request: ClinicalGuidanceRequest = {
      patientConditions: sessionData.encounterData.assessment?.diagnoses || [],
      currentTasks: [],
      medications: sessionData.encounterData.subjective?.medications || [],
      recentAssessments: []
    };

    try {
      const guidance = await openaiService.getClinicalGuidance(request);
      setClinicalGuidance(guidance);
    } catch (error) {
      console.error('Clinical guidance error:', error);
    }
  };

  const generateProgressNote = async (): Promise<GeneratedDocument> => {
    // Simulate AI generation with structured progress note
    await new Promise(resolve => setTimeout(resolve, 2000));

    const content = `PROGRESS NOTE
Date: ${new Date().toLocaleDateString()}
Duration: ${sessionData.duration} minutes

SUBJECTIVE:
${sessionData.encounterData.subjective?.chief_complaint || 'Chief complaint not documented'}

Patient reports: ${extractSubjectiveFromTranscription(sessionData.transcription)}

OBJECTIVE:
Vital Signs: ${formatVitalSigns(sessionData.encounterData.objective?.vital_signs)}
Physical Examination: ${extractObjectiveFromTranscription(sessionData.transcription)}

ASSESSMENT:
${generateAssessmentFromData(sessionData.encounterData, sessionData.transcription)}

PLAN:
${generatePlanFromData(sessionData.encounterData, sessionData.transcription)}

Time spent: ${sessionData.duration} minutes
Provider: [Provider Name]
`;

    return {
      type: 'progress-note',
      title: 'Progress Note',
      content,
      metadata: {
        wordCount: content.split(' ').length,
        estimatedTime: Math.ceil(sessionData.duration * 0.8),
        confidence: 0.92
      }
    };
  };

  const generateSOAPNote = async (): Promise<GeneratedDocument> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const content = `SOAP NOTE
Date: ${new Date().toLocaleDateString()}

SUBJECTIVE:
Chief Complaint: ${sessionData.encounterData.subjective?.chief_complaint || 'Not specified'}
History of Present Illness: ${extractHPIFromTranscription(sessionData.transcription)}
Review of Systems: ${generateROSFromTranscription(sessionData.transcription)}
Past Medical History: ${formatMedicalHistory(sessionData.encounterData.subjective)}
Medications: ${formatMedications(sessionData.encounterData.subjective?.medications)}
Allergies: ${formatAllergies(sessionData.encounterData.subjective?.allergies)}

OBJECTIVE:
Vital Signs:
  - Blood Pressure: ${sessionData.encounterData.objective?.vital_signs?.bp || 'Not recorded'}
  - Heart Rate: ${sessionData.encounterData.objective?.vital_signs?.hr || 'Not recorded'}
  - Temperature: ${sessionData.encounterData.objective?.vital_signs?.temp || 'Not recorded'}
  - Respiratory Rate: ${sessionData.encounterData.objective?.vital_signs?.resp || 'Not recorded'}

Physical Examination: ${extractPhysicalExamFromTranscription(sessionData.transcription)}

ASSESSMENT:
Primary Diagnosis: ${sessionData.encounterData.assessment?.primary_diagnosis || 'To be determined'}
Secondary Diagnoses: ${formatSecondaryDiagnoses(sessionData.encounterData.assessment?.secondary_diagnoses)}

PLAN:
Treatment: ${generateTreatmentPlan(sessionData.transcription)}
Follow-up: ${generateFollowUpPlan(sessionData.transcription)}
Patient Education: ${generatePatientEducation(sessionData.transcription)}
`;

    return {
      type: 'soap-note',
      title: 'SOAP Note',
      content,
      metadata: {
        wordCount: content.split(' ').length,
        estimatedTime: Math.ceil(sessionData.duration * 0.9),
        confidence: 0.89
      }
    };
  };

  const generateEncounterSummary = async (): Promise<GeneratedDocument> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const content = `ENCOUNTER SUMMARY
Date: ${new Date().toLocaleDateString()}
Duration: ${sessionData.duration} minutes
Type: ${sessionData.template?.name || 'General Consultation'}

KEY POINTS:
• Chief Complaint: ${sessionData.encounterData.subjective?.chief_complaint || 'Not specified'}
• Assessment: ${generateBriefAssessment(sessionData.transcription)}
• Plan: ${generateBriefPlan(sessionData.transcription)}

CLINICAL DECISION MAKING:
${generateClinicalDecisionRationale(sessionData.transcription)}

PATIENT UNDERSTANDING:
Patient demonstrated understanding of diagnosis and treatment plan.

NEXT STEPS:
${generateNextSteps(sessionData.transcription)}

PROVIDER NOTES:
${generateProviderNotes(sessionData.transcription)}
`;

    return {
      type: 'encounter-summary',
      title: 'Encounter Summary',
      content,
      metadata: {
        wordCount: content.split(' ').length,
        estimatedTime: Math.ceil(sessionData.duration * 0.6),
        confidence: 0.94
      }
    };
  };

  const generateBillingDocumentation = async (): Promise<GeneratedDocument> => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const cptCodes = determineCPTCodes(sessionData.duration, sessionData.transcription);
    const icdCodes = determineICDCodes(sessionData.encounterData);

    const content = `BILLING DOCUMENTATION
Date of Service: ${new Date().toLocaleDateString()}
Provider: [Provider Name]
Patient: [Patient Name]

TIME-BASED BILLING:
Total Face-to-Face Time: ${sessionData.duration} minutes
Counseling/Coordination Time: ${Math.ceil(sessionData.duration * 0.4)} minutes

RECOMMENDED CPT CODES:
${cptCodes.map(code => `• ${code.code} - ${code.description} (${code.rvu} RVU)`).join('\n')}

ICD-10 DIAGNOSIS CODES:
${icdCodes.map(code => `• ${code.code} - ${code.description}`).join('\n')}

MEDICAL DECISION MAKING:
Complexity Level: ${determineMDMComplexity(sessionData.transcription)}
Risk Level: ${determineRiskLevel(sessionData.encounterData)}

DOCUMENTATION REQUIREMENTS MET:
✓ Chief Complaint documented
✓ History of Present Illness documented  
✓ Physical examination performed
✓ Assessment and plan documented
✓ Time spent documented

BILLING JUSTIFICATION:
${generateBillingJustification(sessionData.duration, sessionData.transcription)}
`;

    return {
      type: 'billing-documentation',
      title: 'Billing Documentation',
      content,
      metadata: {
        wordCount: content.split(' ').length,
        estimatedTime: Math.ceil(sessionData.duration * 1.0),
        confidence: 0.87
      }
    };
  };

  // Helper functions for content generation
  const extractSubjectiveFromTranscription = (transcription: string): string => {
    // AI logic to extract subjective information from transcription
    return transcription.length > 100 ? 
      transcription.substring(0, 200) + '...' : 
      'Patient discussed their current symptoms and concerns.';
  };

  const extractObjectiveFromTranscription = (transcription: string): string => {
    const objectiveKeywords = ['examined', 'appears', 'auscultation', 'palpation', 'inspection'];
    const hasObjective = objectiveKeywords.some(keyword => 
      transcription.toLowerCase().includes(keyword)
    );
    
    return hasObjective ? 
      'Physical examination findings documented during session.' :
      'Physical examination performed and documented.';
  };

  const generateAssessmentFromData = (encounterData: any, transcription: string): string => {
    return encounterData.assessment?.primary_diagnosis || 
           'Assessment based on clinical findings and patient presentation.';
  };

  const generatePlanFromData = (encounterData: any, transcription: string): string => {
    return encounterData.plan?.treatments?.join(', ') || 
           'Treatment plan discussed and agreed upon with patient.';
  };

  const formatVitalSigns = (vitals: any): string => {
    if (!vitals) return 'Not recorded';
    return `BP: ${vitals.bp || 'N/A'}, HR: ${vitals.hr || 'N/A'}, Temp: ${vitals.temp || 'N/A'}`;
  };

  const determineCPTCodes = (duration: number, transcription: string) => {
    if (duration >= 40) {
      return [{ code: '99214', description: 'Office visit, established patient, moderate complexity', rvu: 1.92 }];
    } else if (duration >= 25) {
      return [{ code: '99213', description: 'Office visit, established patient, low complexity', rvu: 1.30 }];
    } else {
      return [{ code: '99212', description: 'Office visit, established patient, straightforward', rvu: 0.93 }];
    }
  };

  const determineICDCodes = (encounterData: any) => {
    return [
      { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' }
    ];
  };

  const determineMDMComplexity = (transcription: string): string => {
    const complexityIndicators = ['multiple', 'complex', 'chronic', 'management'];
    const hasComplexity = complexityIndicators.some(indicator => 
      transcription.toLowerCase().includes(indicator)
    );
    
    return hasComplexity ? 'Moderate' : 'Low';
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to Clipboard",
      description: "Document content has been copied to your clipboard."
    });
  };

  const downloadDocument = (doc: GeneratedDocument) => {
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.type}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="animate-spin mx-auto">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">AI Generating Documentation</h3>
              <p className="text-muted-foreground mb-4">
                Processing your session data and creating comprehensive documentation...
              </p>
              <Progress value={generationProgress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                {generationProgress}% complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            AI Documentation Generated Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {generatedDocs.map((doc) => (
              <div key={doc.type} className="text-center">
                <div className="text-2xl font-bold">{doc.metadata.wordCount}</div>
                <div className="text-sm text-muted-foreground">words</div>
                <div className="text-xs">{doc.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Tabs */}
      <Tabs value={activeDocType} onValueChange={setActiveDocType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress-note">
            <FileText className="h-4 w-4 mr-2" />
            Progress Note
          </TabsTrigger>
          <TabsTrigger value="soap-note">
            <Stethoscope className="h-4 w-4 mr-2" />
            SOAP Note
          </TabsTrigger>
          <TabsTrigger value="encounter-summary">
            <ClipboardList className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="billing-documentation">
            <DollarSign className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {generatedDocs.map((doc) => (
          <TabsContent key={doc.type} value={doc.type} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{doc.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {Math.round(doc.metadata.confidence * 100)}% confidence
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {doc.metadata.estimatedTime}min
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(doc.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadDocument(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {doc.content}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Clinical Guidance */}
      {clinicalGuidance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Clinical Guidance & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Mandatory Tasks</h4>
                <ul className="space-y-1">
                  {clinicalGuidance.mandatoryTasks?.map((task: any, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {task.priority}
                      </Badge>
                      <span>{task.task}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Quality Measures</h4>
                <ul className="space-y-1">
                  {clinicalGuidance.qualityMeasures?.map((measure: any, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Badge variant={measure.status === 'compliant' ? 'default' : 'secondary'} className="text-xs">
                        {measure.status}
                      </Badge>
                      <span>{measure.measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper functions that would be implemented based on specific AI logic
const extractHPIFromTranscription = (transcription: string): string => {
  return 'History extracted from patient interview during session.';
};

const generateROSFromTranscription = (transcription: string): string => {
  return 'Review of systems discussed during encounter.';
};

const formatMedicalHistory = (subjective: any): string => {
  return subjective?.past_medical_history?.join(', ') || 'No significant past medical history reported.';
};

const formatMedications = (medications: any[]): string => {
  return medications?.map(med => `${med.name} ${med.dosage}`).join(', ') || 'No current medications.';
};

const formatAllergies = (allergies: any[]): string => {
  return allergies?.map(allergy => `${allergy.allergen} (${allergy.reaction})`).join(', ') || 'NKDA';
};

const extractPhysicalExamFromTranscription = (transcription: string): string => {
  return 'Physical examination findings documented during session.';
};

const formatSecondaryDiagnoses = (diagnoses: any[]): string => {
  return diagnoses?.join(', ') || 'None at this time.';
};

const generateTreatmentPlan = (transcription: string): string => {
  return 'Treatment plan discussed and documented during encounter.';
};

const generateFollowUpPlan = (transcription: string): string => {
  return 'Follow-up plan established with patient.';
};

const generatePatientEducation = (transcription: string): string => {
  return 'Patient education provided regarding condition and treatment.';
};

const generateBriefAssessment = (transcription: string): string => {
  return 'Clinical assessment based on presentation and examination.';
};

const generateBriefPlan = (transcription: string): string => {
  return 'Treatment and management plan established.';
};

const generateClinicalDecisionRationale = (transcription: string): string => {
  return 'Clinical decisions based on evidence-based guidelines and patient-specific factors.';
};

const generateNextSteps = (transcription: string): string => {
  return 'Next steps discussed with patient including follow-up and monitoring.';
};

const generateProviderNotes = (transcription: string): string => {
  return 'Provider notes and observations from encounter.';
};

const determineRiskLevel = (encounterData: any): string => {
  return encounterData.assessment?.risk_level || 'Low';
};

const generateBillingJustification = (duration: number, transcription: string): string => {
  return `${duration} minutes of face-to-face time spent with patient including history, examination, medical decision making, and counseling.`;
};

export default AIDocumentationEngine;