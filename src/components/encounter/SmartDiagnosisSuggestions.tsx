import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  Brain,
  TrendingUp,
  Star,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Plus,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface DiagnosisCode {
  icd10: string;
  description: string;
  category: string;
  isCommon: boolean;
  isFavorite: boolean;
  lastUsed?: Date;
  frequency: number;
  aiConfidence?: number;
  clinicalEvidence?: string[];
}

interface SmartDiagnosisSuggestionsProps {
  patientAge?: number;
  patientGender?: string;
  specialty?: string;
  symptoms: string[];
  physicalFindings: string[];
  vitalSigns?: any;
  selectedDiagnoses: DiagnosisCode[];
  onDiagnosisSelect: (diagnosis: DiagnosisCode) => void;
  onDiagnosisRemove: (icd10: string) => void;
}

const DIAGNOSIS_DATABASE: DiagnosisCode[] = [
  // Cardiovascular
  {
    icd10: 'I10',
    description: 'Essential hypertension',
    category: 'Cardiovascular',
    isCommon: true,
    isFavorite: false,
    frequency: 95,
    clinicalEvidence: ['Elevated blood pressure', 'No secondary causes identified']
  },
  {
    icd10: 'I20.9',
    description: 'Angina pectoris, unspecified',
    category: 'Cardiovascular',
    isCommon: true,
    isFavorite: false,
    frequency: 75,
    clinicalEvidence: ['Chest pain on exertion', 'Relief with rest or nitroglycerin']
  },
  {
    icd10: 'I25.10',
    description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris',
    category: 'Cardiovascular',
    isCommon: true,
    isFavorite: false,
    frequency: 80,
    clinicalEvidence: ['Coronary artery disease history', 'Abnormal stress test']
  },
  
  // Endocrine
  {
    icd10: 'E11.9',
    description: 'Type 2 diabetes mellitus without complications',
    category: 'Endocrine',
    isCommon: true,
    isFavorite: false,
    frequency: 90,
    clinicalEvidence: ['Elevated HbA1c', 'Fasting glucose >126 mg/dL']
  },
  {
    icd10: 'E78.5',
    description: 'Hyperlipidemia, unspecified',
    category: 'Endocrine',
    isCommon: true,
    isFavorite: false,
    frequency: 85,
    clinicalEvidence: ['Elevated cholesterol', 'LDL >100 mg/dL']
  },
  
  // Respiratory
  {
    icd10: 'J44.1',
    description: 'Chronic obstructive pulmonary disease with acute exacerbation',
    category: 'Respiratory',
    isCommon: true,
    isFavorite: false,
    frequency: 70,
    clinicalEvidence: ['Smoking history', 'Dyspnea', 'Chronic cough']
  },
  {
    icd10: 'J45.9',
    description: 'Asthma, unspecified',
    category: 'Respiratory',
    isCommon: true,
    isFavorite: false,
    frequency: 80,
    clinicalEvidence: ['Wheezing', 'Reversible airway obstruction', 'Allergic triggers']
  },
  
  // Mental Health
  {
    icd10: 'F32.9',
    description: 'Major depressive disorder, single episode, unspecified',
    category: 'Mental Health',
    isCommon: true,
    isFavorite: false,
    frequency: 85,
    clinicalEvidence: ['PHQ-9 score >10', 'Depressed mood', 'Anhedonia']
  },
  {
    icd10: 'F41.9',
    description: 'Anxiety disorder, unspecified',
    category: 'Mental Health',
    isCommon: true,
    isFavorite: false,
    frequency: 80,
    clinicalEvidence: ['GAD-7 score >10', 'Excessive worry', 'Physical symptoms']
  },
  
  // Infectious Diseases
  {
    icd10: 'J06.9',
    description: 'Acute upper respiratory infection, unspecified',
    category: 'Respiratory',
    isCommon: true,
    isFavorite: false,
    frequency: 95,
    clinicalEvidence: ['Rhinorrhea', 'Sore throat', 'Nasal congestion']
  },
  {
    icd10: 'A09',
    description: 'Infectious gastroenteritis and colitis, unspecified',
    category: 'Gastrointestinal',
    isCommon: true,
    isFavorite: false,
    frequency: 70,
    clinicalEvidence: ['Diarrhea', 'Nausea', 'Abdominal pain']
  }
];

const SPECIALTY_FILTERS = {
  'Family Medicine': ['Cardiovascular', 'Endocrine', 'Respiratory', 'Mental Health'],
  'Cardiology': ['Cardiovascular'],
  'Endocrinology': ['Endocrine'],
  'Pulmonology': ['Respiratory'],
  'Psychiatry': ['Mental Health']
};

const AI_DIAGNOSIS_MATCHING = {
  'chest pain': ['I20.9', 'I25.10', 'K21.9'],
  'shortness of breath': ['J44.1', 'J45.9', 'I50.9'],
  'fatigue': ['E11.9', 'F32.9', 'D50.9'],
  'headache': ['G44.1', 'R51'],
  'cough': ['J06.9', 'J44.1', 'J45.9'],
  'depression': ['F32.9', 'F33.9'],
  'anxiety': ['F41.9', 'F41.1'],
  'elevated blood pressure': ['I10', 'I15.9'],
  'diabetes': ['E11.9', 'E10.9']
};

export const SmartDiagnosisSuggestions: React.FC<SmartDiagnosisSuggestionsProps> = ({
  patientAge = 0,
  patientGender = '',
  specialty = 'Family Medicine',
  symptoms = [],
  physicalFindings = [],
  vitalSigns = {},
  selectedDiagnoses = [],
  onDiagnosisSelect,
  onDiagnosisRemove
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'alphabetical' | 'frequency'>('relevance');

  // AI-powered diagnosis suggestions based on symptoms
  const aiSuggestions = useMemo(() => {
    const suggestions: DiagnosisCode[] = [];
    const allEvidence = [...symptoms, ...physicalFindings];
    
    allEvidence.forEach(evidence => {
      const evidenceLower = evidence.toLowerCase();
      Object.entries(AI_DIAGNOSIS_MATCHING).forEach(([key, diagnosisCodes]) => {
        if (evidenceLower.includes(key)) {
          diagnosisCodes.forEach(icd10 => {
            const diagnosis = DIAGNOSIS_DATABASE.find(d => d.icd10 === icd10);
            if (diagnosis && !suggestions.find(s => s.icd10 === icd10)) {
              // Calculate AI confidence based on evidence match
              const confidence = Math.min(95, 60 + (allEvidence.length * 10));
              suggestions.push({
                ...diagnosis,
                aiConfidence: confidence
              });
            }
          });
        }
      });
    });
    
    return suggestions.sort((a, b) => (b.aiConfidence || 0) - (a.aiConfidence || 0));
  }, [symptoms, physicalFindings]);

  // Filtered and sorted diagnoses
  const filteredDiagnoses = useMemo(() => {
    let filtered = DIAGNOSIS_DATABASE.filter(diagnosis => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!diagnosis.description.toLowerCase().includes(searchLower) &&
            !diagnosis.icd10.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategory !== 'all' && diagnosis.category !== selectedCategory) {
        return false;
      }
      
      // Specialty filter
      const specialtyCategories = SPECIALTY_FILTERS[specialty] || [];
      if (specialtyCategories.length > 0 && !specialtyCategories.includes(diagnosis.category)) {
        return false;
      }
      
      // Favorites filter
      if (showFavoritesOnly && !diagnosis.isFavorite) {
        return false;
      }
      
      return true;
    });
    
    // Sort
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.description.localeCompare(b.description));
        break;
      case 'frequency':
        filtered.sort((a, b) => b.frequency - a.frequency);
        break;
      case 'relevance':
      default:
        // Sort by AI confidence first, then frequency
        filtered.sort((a, b) => {
          const aAI = aiSuggestions.find(s => s.icd10 === a.icd10);
          const bAI = aiSuggestions.find(s => s.icd10 === b.icd10);
          
          if (aAI && bAI) return (bAI.aiConfidence || 0) - (aAI.aiConfidence || 0);
          if (aAI) return -1;
          if (bAI) return 1;
          
          return b.frequency - a.frequency;
        });
        break;
    }
    
    return filtered;
  }, [searchTerm, selectedCategory, specialty, showFavoritesOnly, sortBy, aiSuggestions]);

  const categories = useMemo(() => {
    const cats = [...new Set(DIAGNOSIS_DATABASE.map(d => d.category))];
    return cats.sort();
  }, []);

  const toggleFavorite = useCallback((icd10: string) => {
    // In a real app, this would update the database
    toast.success('Diagnosis favorite status updated');
  }, []);

  const isSelected = useCallback((icd10: string) => {
    return selectedDiagnoses.some(d => d.icd10 === icd10);
  }, [selectedDiagnoses]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Smart Diagnosis Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Suggestions Section */}
          {aiSuggestions.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">AI-Powered Suggestions</h4>
                <Badge variant="secondary" className="text-xs">Based on symptoms & findings</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiSuggestions.slice(0, 4).map((diagnosis) => (
                  <div key={diagnosis.icd10} className="p-3 bg-white rounded border border-blue-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{diagnosis.description}</h5>
                        <p className="text-xs text-muted-foreground">{diagnosis.icd10}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {diagnosis.aiConfidence}%
                        </Badge>
                        <Button
                          size="sm"
                          variant={isSelected(diagnosis.icd10) ? "default" : "outline"}
                          onClick={() => 
                            isSelected(diagnosis.icd10)
                              ? onDiagnosisRemove(diagnosis.icd10)
                              : onDiagnosisSelect(diagnosis)
                          }
                        >
                          {isSelected(diagnosis.icd10) ? <CheckCircle className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    {diagnosis.clinicalEvidence && (
                      <div className="text-xs text-muted-foreground">
                        Evidence: {diagnosis.clinicalEvidence.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search diagnoses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="frequency">Most Common</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </Button>
          </div>

          {/* Selected Diagnoses */}
          {selectedDiagnoses.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Selected Diagnoses</h4>
              <div className="space-y-2">
                {selectedDiagnoses.map((diagnosis) => (
                  <div key={diagnosis.icd10} className="flex items-center justify-between p-3 bg-primary/5 rounded border">
                    <div>
                      <span className="font-medium">{diagnosis.description}</span>
                      <span className="text-sm text-muted-foreground ml-2">({diagnosis.icd10})</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDiagnosisRemove(diagnosis.icd10)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnosis List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredDiagnoses.map((diagnosis) => {
              const aiSuggestion = aiSuggestions.find(s => s.icd10 === diagnosis.icd10);
              const selected = isSelected(diagnosis.icd10);
              
              return (
                <div
                  key={diagnosis.icd10}
                  className={`p-3 border rounded-lg transition-colors ${
                    selected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{diagnosis.description}</h5>
                        {aiSuggestion && (
                          <Badge variant="secondary" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            {aiSuggestion.aiConfidence}% match
                          </Badge>
                        )}
                        {diagnosis.isCommon && (
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Common
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{diagnosis.icd10}</span>
                        <span>•</span>
                        <span>{diagnosis.category}</span>
                        <span>•</span>
                        <span>{diagnosis.frequency}% frequency</span>
                      </div>
                      {diagnosis.clinicalEvidence && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Evidence: {diagnosis.clinicalEvidence.join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(diagnosis.icd10)}
                      >
                        <Star className={`h-4 w-4 ${diagnosis.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant={selected ? "default" : "outline"}
                        onClick={() => 
                          selected 
                            ? onDiagnosisRemove(diagnosis.icd10)
                            : onDiagnosisSelect(diagnosis)
                        }
                      >
                        {selected ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Selected
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDiagnoses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No diagnoses found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartDiagnosisSuggestions;