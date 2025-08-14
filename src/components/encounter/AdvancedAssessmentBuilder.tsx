import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Stethoscope,
  Activity,
  Plus,
  X
} from "lucide-react";
import { toast } from "sonner";

interface Diagnosis {
  icd10: string;
  description: string;
  confidence: number;
  category: 'primary' | 'secondary' | 'rule-out';
  evidence: string[];
  recommendations: string[];
}

interface ClinicalRule {
  name: string;
  description: string;
  criteria: string[];
  score?: number;
  interpretation: string;
  action: string;
}

interface AdvancedAssessmentBuilderProps {
  symptoms: string[];
  physicalFindings: string[];
  patientContext?: {
    age: number;
    gender: string;
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  onDiagnosisAdd: (diagnosis: Diagnosis) => void;
  onAssessmentUpdate: (assessment: string) => void;
  currentAssessment?: string;
}

const COMMON_SYMPTOMS = [
  'Chest pain', 'Shortness of breath', 'Fatigue', 'Headache', 'Nausea',
  'Fever', 'Cough', 'Dizziness', 'Abdominal pain', 'Joint pain'
];

const DIFFERENTIAL_DIAGNOSES = {
  'chest pain': [
    {
      icd10: 'I20.9',
      description: 'Angina pectoris, unspecified',
      confidence: 85,
      category: 'primary' as const,
      evidence: ['Typical chest pain', 'Exertional symptoms', 'Relief with rest'],
      recommendations: ['ECG', 'Cardiac enzymes', 'Stress test consideration']
    },
    {
      icd10: 'K21.9',
      description: 'GERD, unspecified',
      confidence: 70,
      category: 'rule-out' as const,
      evidence: ['Burning sensation', 'Relationship to meals', 'Acid taste'],
      recommendations: ['Trial of PPI', 'Dietary modification counseling']
    }
  ],
  'shortness of breath': [
    {
      icd10: 'I50.9',
      description: 'Heart failure, unspecified',
      confidence: 75,
      category: 'primary' as const,
      evidence: ['Dyspnea on exertion', 'Orthopnea', 'Lower extremity edema'],
      recommendations: ['Echocardiogram', 'BNP/NT-proBNP', 'Chest X-ray']
    },
    {
      icd10: 'J44.1',
      description: 'COPD with acute exacerbation',
      confidence: 65,
      category: 'rule-out' as const,
      evidence: ['Smoking history', 'Chronic cough', 'Decreased exercise tolerance'],
      recommendations: ['Pulmonary function tests', 'Arterial blood gas', 'Chest CT']
    }
  ]
};

const CLINICAL_RULES = [
  {
    name: 'CHADS2-VASc Score',
    description: 'Stroke risk assessment in atrial fibrillation',
    criteria: [
      'CHF (1 point)',
      'Hypertension (1 point)',
      'Age ≥75 (2 points)',
      'Diabetes (1 point)',
      'Stroke/TIA (2 points)',
      'Vascular disease (1 point)',
      'Age 65-74 (1 point)',
      'Sex category (female) (1 point)'
    ],
    interpretation: 'Score 0: Low risk, Score 1: Moderate risk, Score ≥2: High risk',
    action: 'Consider anticoagulation for score ≥2'
  },
  {
    name: 'Wells Score for PE',
    description: 'Pulmonary embolism probability assessment',
    criteria: [
      'Clinical signs of DVT (3 points)',
      'PE more likely than alternative (3 points)',
      'Heart rate >100 (1.5 points)',
      'Immobilization/surgery in past 4 weeks (1.5 points)',
      'Previous PE/DVT (1.5 points)',
      'Hemoptysis (1 point)',
      'Malignancy (1 point)'
    ],
    interpretation: 'Score <2: Low probability, Score 2-6: Moderate, Score >6: High',
    action: 'Low: D-dimer, Moderate/High: CT-PA or VQ scan'
  }
];

export const AdvancedAssessmentBuilder: React.FC<AdvancedAssessmentBuilderProps> = ({
  symptoms,
  physicalFindings,
  patientContext,
  onDiagnosisAdd,
  onAssessmentUpdate,
  currentAssessment = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(symptoms);
  const [customSymptom, setCustomSymptom] = useState('');
  const [activeRule, setActiveRule] = useState<ClinicalRule | null>(null);
  const [ruleScore, setRuleScore] = useState(0);

  const suggestedDiagnoses = useMemo(() => {
    const allDiagnoses: Diagnosis[] = [];
    selectedSymptoms.forEach(symptom => {
      const key = symptom.toLowerCase();
      if (DIFFERENTIAL_DIAGNOSES[key]) {
        allDiagnoses.push(...DIFFERENTIAL_DIAGNOSES[key]);
      }
    });
    
    // Sort by confidence score
    return allDiagnoses.sort((a, b) => b.confidence - a.confidence);
  }, [selectedSymptoms]);

  const addSymptom = useCallback((symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  }, [selectedSymptoms]);

  const removeSymptom = useCallback((symptom: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
  }, []);

  const addCustomSymptom = useCallback(() => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      addSymptom(customSymptom.trim());
      setCustomSymptom('');
    }
  }, [customSymptom, addSymptom]);

  const generateAssessmentText = useCallback(() => {
    const primaryDx = suggestedDiagnoses.filter(d => d.category === 'primary');
    const ruleOuts = suggestedDiagnoses.filter(d => d.category === 'rule-out');
    
    let assessment = '';
    
    if (primaryDx.length > 0) {
      assessment += `Primary consideration: ${primaryDx[0].description} (${primaryDx[0].icd10})\n`;
      assessment += `Confidence: ${primaryDx[0].confidence}%\n\n`;
    }
    
    if (ruleOuts.length > 0) {
      assessment += 'Differential diagnoses to consider:\n';
      ruleOuts.forEach((dx, index) => {
        assessment += `${index + 1}. ${dx.description} (${dx.icd10}) - ${dx.confidence}% confidence\n`;
      });
    }
    
    onAssessmentUpdate(assessment);
    toast.success('Assessment updated with AI suggestions');
  }, [suggestedDiagnoses, onAssessmentUpdate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Advanced Assessment Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="symptoms" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
              <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
              <TabsTrigger value="rules">Clinical Rules</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="symptoms" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Selected Symptoms</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary" className="flex items-center gap-1">
                      {symptom}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSymptom(symptom)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom symptom..."
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
                />
                <Button onClick={addCustomSymptom}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Common Symptoms</label>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <Button
                      key={symptom}
                      variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                      size="sm"
                      onClick={() => 
                        selectedSymptoms.includes(symptom) 
                          ? removeSymptom(symptom)
                          : addSymptom(symptom)
                      }
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="diagnoses" className="space-y-4">
              <div className="space-y-3">
                {suggestedDiagnoses.length > 0 ? (
                  suggestedDiagnoses.map((diagnosis, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{diagnosis.description}</h4>
                          <p className="text-sm text-muted-foreground">ICD-10: {diagnosis.icd10}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={diagnosis.category === 'primary' ? 'default' : 'secondary'}>
                            {diagnosis.category}
                          </Badge>
                          <Badge variant="outline">
                            {diagnosis.confidence}%
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => onDiagnosisAdd(diagnosis)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Supporting Evidence</label>
                          <ul className="text-sm mt-1 space-y-1">
                            {diagnosis.evidence.map((evidence, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {evidence}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Recommendations</label>
                          <ul className="text-sm mt-1 space-y-1">
                            {diagnosis.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <Lightbulb className="h-3 w-3 text-amber-600" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select symptoms to see AI-powered diagnostic suggestions</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <div className="grid gap-4">
                {CLINICAL_RULES.map((rule, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveRule(rule)}
                      >
                        Calculate
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Criteria</label>
                      <ul className="text-sm space-y-1">
                        {rule.criteria.map((criterion, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-blue-600" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-3 p-2 bg-muted rounded">
                      <p className="text-sm font-medium">{rule.interpretation}</p>
                      <p className="text-sm text-muted-foreground">{rule.action}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Clinical Assessment</h3>
                <Button onClick={generateAssessmentText} variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Assessment
                </Button>
              </div>
              
              <Textarea
                placeholder="Enter your clinical assessment..."
                value={currentAssessment}
                onChange={(e) => onAssessmentUpdate(e.target.value)}
                rows={10}
                className="min-h-[200px]"
              />
              
              {suggestedDiagnoses.length > 0 && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">AI Recommendations</h4>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Consider {suggestedDiagnoses[0]?.description} as primary diagnosis</li>
                    <li>• Rule out {suggestedDiagnoses.filter(d => d.category === 'rule-out')[0]?.description}</li>
                    <li>• Recommend additional testing based on differential diagnoses</li>
                    <li>• Review patient's medication list for interactions</li>
                  </ul>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAssessmentBuilder;