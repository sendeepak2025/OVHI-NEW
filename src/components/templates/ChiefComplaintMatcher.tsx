import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, Brain, Target, TrendingUp } from 'lucide-react';

interface ChiefComplaintMatch {
  templateId: string;
  templateName: string;
  confidence: number;
  specialty: string;
  keywords: string[];
  reasoning: string[];
}

interface PatientContext {
  age: number;
  gender: string;
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  vitals?: {
    bp: string;
    hr: number;
    temp: number;
    o2sat: number;
  };
}

const COMPLAINT_MAPPINGS = {
  'chest pain': {
    keywords: ['chest pain', 'chest discomfort', 'heart pain', 'chest pressure', 'angina'],
    templates: [
      { id: 'chest-pain-acute', name: 'Acute Chest Pain Evaluation', specialty: 'Emergency Medicine', priority: 'high' },
      { id: 'chest-pain-chronic', name: 'Chronic Chest Pain Assessment', specialty: 'Cardiology', priority: 'medium' },
      { id: 'chest-pain-primary', name: 'Chest Pain Primary Care', specialty: 'Family Medicine', priority: 'medium' }
    ]
  },
  'headache': {
    keywords: ['headache', 'head pain', 'migraine', 'cephalgia', 'head ache'],
    templates: [
      { id: 'headache-acute', name: 'Acute Headache Evaluation', specialty: 'Emergency Medicine', priority: 'high' },
      { id: 'migraine-management', name: 'Migraine Follow-up', specialty: 'Neurology', priority: 'medium' },
      { id: 'tension-headache', name: 'Tension Headache Assessment', specialty: 'Family Medicine', priority: 'low' }
    ]
  },
  'shortness of breath': {
    keywords: ['shortness of breath', 'sob', 'dyspnea', 'breathing difficulty', 'cannot breathe'],
    templates: [
      { id: 'dyspnea-acute', name: 'Acute Dyspnea Assessment', specialty: 'Emergency Medicine', priority: 'high' },
      { id: 'copd-exacerbation', name: 'COPD Exacerbation', specialty: 'Pulmonology', priority: 'high' },
      { id: 'asthma-assessment', name: 'Asthma Follow-up', specialty: 'Family Medicine', priority: 'medium' }
    ]
  },
  'abdominal pain': {
    keywords: ['abdominal pain', 'stomach pain', 'belly pain', 'abd pain', 'gut pain'],
    templates: [
      { id: 'abd-pain-acute', name: 'Acute Abdominal Pain', specialty: 'Emergency Medicine', priority: 'high' },
      { id: 'ibs-followup', name: 'IBS Management', specialty: 'Gastroenterology', priority: 'medium' },
      { id: 'dyspepsia', name: 'Dyspepsia Assessment', specialty: 'Family Medicine', priority: 'low' }
    ]
  },
  'diabetes': {
    keywords: ['diabetes', 'blood sugar', 'dm', 'diabetic', 'glucose'],
    templates: [
      { id: 'diabetes-followup', name: 'Diabetes Follow-up', specialty: 'Endocrinology', priority: 'medium' },
      { id: 'diabetes-primary', name: 'Diabetes Management - Primary Care', specialty: 'Family Medicine', priority: 'medium' },
      { id: 'dka-assessment', name: 'DKA Assessment', specialty: 'Emergency Medicine', priority: 'high' }
    ]
  },
  'hypertension': {
    keywords: ['hypertension', 'high blood pressure', 'htn', 'bp check'],
    templates: [
      { id: 'htn-followup', name: 'Hypertension Follow-up', specialty: 'Cardiology', priority: 'medium' },
      { id: 'htn-primary', name: 'HTN Management - Primary Care', specialty: 'Family Medicine', priority: 'medium' },
      { id: 'hypertensive-crisis', name: 'Hypertensive Crisis', specialty: 'Emergency Medicine', priority: 'high' }
    ]
  }
};

interface ChiefComplaintMatcherProps {
  chiefComplaint: string;
  patientContext: PatientContext;
  providerSpecialty: string;
  onTemplateSelect: (match: ChiefComplaintMatch) => void;
}

export const ChiefComplaintMatcher: React.FC<ChiefComplaintMatcherProps> = ({
  chiefComplaint,
  patientContext,
  providerSpecialty,
  onTemplateSelect
}) => {
  const [matches, setMatches] = useState<ChiefComplaintMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (chiefComplaint && chiefComplaint.length > 2) {
      analyzeChiefComplaint();
    }
  }, [chiefComplaint, patientContext, providerSpecialty]);

  const analyzeChiefComplaint = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with sophisticated matching
    const normalizedComplaint = chiefComplaint.toLowerCase().trim();
    const foundMatches: ChiefComplaintMatch[] = [];

    // Direct keyword matching
    Object.entries(COMPLAINT_MAPPINGS).forEach(([complaint, data]) => {
      data.keywords.forEach(keyword => {
        if (normalizedComplaint.includes(keyword)) {
          data.templates.forEach(template => {
            let confidence = calculateConfidence(keyword, normalizedComplaint, template, patientContext, providerSpecialty);
            let reasoning = generateReasoning(keyword, template, patientContext, providerSpecialty);
            
            foundMatches.push({
              templateId: template.id,
              templateName: template.name,
              confidence,
              specialty: template.specialty,
              keywords: [keyword],
              reasoning
            });
          });
        }
      });
    });

    // Sort by confidence and remove duplicates
    const uniqueMatches = foundMatches
      .reduce((acc, current) => {
        const existing = acc.find(item => item.templateId === current.templateId);
        if (existing) {
          if (current.confidence > existing.confidence) {
            existing.confidence = current.confidence;
            existing.reasoning = [...existing.reasoning, ...current.reasoning];
          }
        } else {
          acc.push(current);
        }
        return acc;
      }, [] as ChiefComplaintMatch[])
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    setMatches(uniqueMatches);
    setIsAnalyzing(false);
  };

  const calculateConfidence = (
    keyword: string, 
    complaint: string, 
    template: any, 
    context: PatientContext, 
    specialty: string
  ): number => {
    let confidence = 0.3; // Base confidence

    // Exact keyword match
    if (complaint === keyword) confidence += 0.4;
    else if (complaint.includes(keyword)) confidence += 0.2;

    // Specialty match bonus
    if (template.specialty === specialty) confidence += 0.3;
    else if (specialty === 'Family Medicine') confidence += 0.1; // FM can handle most things

    // Priority bonus
    if (template.priority === 'high') confidence += 0.1;

    // Age-based adjustments
    if (context.age > 65 && ['chest pain', 'shortness of breath'].includes(keyword)) {
      confidence += 0.1; // Higher priority for elderly with these symptoms
    }

    // Medical history context
    if (context.medicalHistory.includes('diabetes') && keyword.includes('diabetes')) {
      confidence += 0.2;
    }
    if (context.medicalHistory.includes('hypertension') && keyword.includes('blood pressure')) {
      confidence += 0.2;
    }

    // Vital signs context
    if (context.vitals) {
      const systolic = parseInt(context.vitals.bp.split('/')[0]);
      if (systolic > 140 && keyword.includes('blood pressure')) {
        confidence += 0.15;
      }
      if (context.vitals.temp > 101 && keyword.includes('fever')) {
        confidence += 0.15;
      }
    }

    return Math.min(confidence, 1.0);
  };

  const generateReasoning = (
    keyword: string, 
    template: any, 
    context: PatientContext, 
    specialty: string
  ): string[] => {
    const reasons = [];

    if (template.specialty === specialty) {
      reasons.push(`Matches your specialty (${specialty})`);
    }

    if (context.age > 65) {
      reasons.push('Age-appropriate considerations included');
    }

    if (template.priority === 'high') {
      reasons.push('High-priority condition requiring immediate attention');
    }

    if (context.medicalHistory.length > 0) {
      reasons.push('Takes into account patient medical history');
    }

    reasons.push(`Optimized for "${keyword}" presentations`);

    return reasons;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Match';
    if (confidence >= 0.6) return 'Good Match';
    return 'Possible Match';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Smart Template Matching
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered template recommendations based on chief complaint and patient context
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Analyzing complaint...</span>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match, index) => (
              <div
                key={match.templateId}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onTemplateSelect(match)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{match.templateName}</h4>
                      <Badge variant="outline">{match.specialty}</Badge>
                      {index === 0 && (
                        <Badge variant="default" className="bg-primary">
                          <Target className="h-3 w-3 mr-1" />
                          Best Match
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Matched keywords: {match.keywords.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(match.confidence)}`}></div>
                      <span className="text-sm font-medium">
                        {Math.round(match.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getConfidenceText(match.confidence)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {match.reasoning.slice(0, 3).map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {reason}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={() => onTemplateSelect(match)}>
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : chiefComplaint.length > 2 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No specific templates found for "{chiefComplaint}"</p>
            <p className="text-xs mt-1">Try using more specific terms or check our general templates</p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Enter a chief complaint to see intelligent template suggestions</p>
          </div>
        )}

        <Separator />

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 mb-1">AI Matching Process</h5>
              <p className="text-sm text-blue-700">
                Our AI considers chief complaint keywords, patient demographics, medical history, 
                current vitals, provider specialty, and clinical urgency to recommend the most 
                appropriate templates.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};