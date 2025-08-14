import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Brain,
  DollarSign,
  Star,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface CPTCode {
  code: string;
  description: string;
  category: string;
  fee: number;
  rvu: number;
  specialty?: string;
  modifiers?: string[];
  bundled?: string[];
  excludes?: string[];
  popularity?: number;
  confidence?: number;
}

interface Diagnosis {
  code: string;
  description: string;
  category: string;
}

interface SmartCPTSuggestionsProps {
  diagnoses: Diagnosis[];
  encounterType?: string;
  specialty?: string;
  patientAge?: number;
  patientGender?: string;
  onCPTSelect: (cpt: CPTCode) => void;
  selectedCPTs?: CPTCode[];
}

const SmartCPTSuggestions: React.FC<SmartCPTSuggestionsProps> = ({
  diagnoses,
  encounterType = 'office-visit',
  specialty = 'family-medicine',
  patientAge = 45,
  patientGender = 'unknown',
  onCPTSelect,
  selectedCPTs = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock CPT database with intelligent matching
  const cptDatabase: CPTCode[] = [
    // Office Visits
    { code: '99213', description: 'Office visit, established patient, moderate complexity', category: 'Office Visits', fee: 150, rvu: 1.3, specialty: 'family-medicine', popularity: 90 },
    { code: '99214', description: 'Office visit, established patient, high complexity', category: 'Office Visits', fee: 200, rvu: 1.9, specialty: 'family-medicine', popularity: 75 },
    { code: '99203', description: 'Office visit, new patient, moderate complexity', category: 'Office Visits', fee: 180, rvu: 1.6, specialty: 'family-medicine', popularity: 80 },
    { code: '99204', description: 'Office visit, new patient, high complexity', category: 'Office Visits', fee: 250, rvu: 2.4, specialty: 'family-medicine', popularity: 60 },
    
    // Preventive Care
    { code: '99395', description: 'Preventive visit, established patient, 18-39 years', category: 'Preventive', fee: 200, rvu: 1.8, specialty: 'family-medicine', popularity: 85 },
    { code: '99396', description: 'Preventive visit, established patient, 40-64 years', category: 'Preventive', fee: 220, rvu: 2.0, specialty: 'family-medicine', popularity: 85 },
    { code: '99397', description: 'Preventive visit, established patient, 65+ years', category: 'Preventive', fee: 240, rvu: 2.2, specialty: 'family-medicine', popularity: 85 },
    
    // Procedures
    { code: '11055', description: 'Paring or cutting, benign hyperkeratotic lesion', category: 'Procedures', fee: 75, rvu: 0.8, specialty: 'dermatology', popularity: 70 },
    { code: '12001', description: 'Simple repair of superficial wounds, 2.5 cm or less', category: 'Procedures', fee: 120, rvu: 1.1, specialty: 'family-medicine', popularity: 65 },
    { code: '17000', description: 'Destruction, premalignant lesions, first lesion', category: 'Procedures', fee: 100, rvu: 0.9, specialty: 'dermatology', popularity: 75 },
    
    // Diagnostic
    { code: '93000', description: 'Electrocardiogram, routine ECG with interpretation', category: 'Diagnostic', fee: 85, rvu: 0.7, specialty: 'cardiology', popularity: 80 },
    { code: '71045', description: 'Chest X-ray, single view', category: 'Diagnostic', fee: 60, rvu: 0.5, specialty: 'radiology', popularity: 90 },
    { code: '80053', description: 'Comprehensive metabolic panel', category: 'Laboratory', fee: 45, rvu: 0.3, specialty: 'laboratory', popularity: 95 },
    
    // Mental Health
    { code: '90834', description: 'Psychotherapy, 45 minutes', category: 'Mental Health', fee: 180, rvu: 1.5, specialty: 'psychiatry', popularity: 85 },
    { code: '90837', description: 'Psychotherapy, 60 minutes', category: 'Mental Health', fee: 240, rvu: 2.0, specialty: 'psychiatry', popularity: 70 },
    
    // Immunizations
    { code: '90715', description: 'Tetanus, diphtheria toxoids and acellular pertussis vaccine', category: 'Immunizations', fee: 50, rvu: 0.4, specialty: 'family-medicine', popularity: 80 },
    { code: '90658', description: 'Influenza virus vaccine, trivalent', category: 'Immunizations', fee: 35, rvu: 0.3, specialty: 'family-medicine', popularity: 95 }
  ];

  // Generate AI-powered suggestions based on diagnoses
  const generateSmartSuggestions = useMemo(() => {
    if (diagnoses.length === 0) {
      // Default suggestions for encounter type
      return cptDatabase
        .filter(cpt => {
          if (encounterType === 'annual-physical') {
            return cpt.category === 'Preventive' || cpt.category === 'Laboratory';
          }
          if (encounterType === 'follow-up') {
            return cpt.category === 'Office Visits';
          }
          return cpt.category === 'Office Visits';
        })
        .slice(0, 6)
        .map(cpt => ({ ...cpt, confidence: 80 }));
    }

    const suggestions: (CPTCode & { confidence: number })[] = [];

    // Analyze diagnoses and suggest relevant CPTs
    diagnoses.forEach(diagnosis => {
      const icd10Code = diagnosis.code.toLowerCase();
      const description = diagnosis.description.toLowerCase();

      // Rule-based matching for common scenarios
      if (icd10Code.startsWith('z00') || description.includes('wellness') || description.includes('physical')) {
        // Wellness/Physical exam
        const ageAppropriate = patientAge >= 65 ? '99397' : patientAge >= 40 ? '99396' : '99395';
        const cpt = cptDatabase.find(c => c.code === ageAppropriate);
        if (cpt) suggestions.push({ ...cpt, confidence: 95 });
        
        // Add lab work
        const labCpt = cptDatabase.find(c => c.code === '80053');
        if (labCpt) suggestions.push({ ...labCpt, confidence: 85 });
      }

      if (icd10Code.startsWith('i') || description.includes('hypertension') || description.includes('heart')) {
        // Cardiovascular
        const ecgCpt = cptDatabase.find(c => c.code === '93000');
        if (ecgCpt) suggestions.push({ ...ecgCpt, confidence: 90 });
        
        const officeCpt = cptDatabase.find(c => c.code === '99214');
        if (officeCpt) suggestions.push({ ...officeCpt, confidence: 85 });
      }

      if (icd10Code.startsWith('f') || description.includes('depression') || description.includes('anxiety')) {
        // Mental health
        const therapyCpt = cptDatabase.find(c => c.code === '90834');
        if (therapyCpt) suggestions.push({ ...therapyCpt, confidence: 90 });
      }

      if (icd10Code.startsWith('s') || description.includes('injury') || description.includes('wound')) {
        // Injury/Wound care
        const repairCpt = cptDatabase.find(c => c.code === '12001');
        if (repairCpt) suggestions.push({ ...repairCpt, confidence: 85 });
      }

      if (description.includes('skin') || description.includes('lesion') || description.includes('dermatitis')) {
        // Dermatology
        const lesionCpt = cptDatabase.find(c => c.code === '17000');
        if (lesionCpt) suggestions.push({ ...lesionCpt, confidence: 85 });
      }
    });

    // Remove duplicates and sort by confidence
    const uniqueSuggestions = suggestions.filter((item, index, self) => 
      index === self.findIndex(t => t.code === item.code)
    );

    return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  }, [diagnoses, encounterType, patientAge]);

  // Filter CPTs based on search and category
  const filteredCPTs = useMemo(() => {
    let filtered = cptDatabase;

    if (searchTerm) {
      filtered = filtered.filter(cpt => 
        cpt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpt.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(cpt => cpt.category === selectedCategory);
    }

    return filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(cptDatabase.map(cpt => cpt.category))];
    return ['all', ...cats];
  }, []);

  const isSelected = (cpt: CPTCode) => {
    return selectedCPTs.some(selected => selected.code === cpt.code);
  };

  const handleSelectCPT = (cpt: CPTCode) => {
    if (isSelected(cpt)) {
      toast.info(`CPT ${cpt.code} already selected`);
      return;
    }

    onCPTSelect(cpt);
    toast.success(`Added CPT ${cpt.code}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Smart CPT Code Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Based on diagnoses: {diagnoses.map(d => d.code).join(', ') || 'None selected'}
            </div>
            
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {generateSmartSuggestions.map((cpt) => (
                  <Card key={cpt.code} className={`cursor-pointer transition-colors hover:bg-accent ${isSelected(cpt) ? 'border-primary bg-primary/5' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{cpt.code}</Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {cpt.confidence}%
                            </Badge>
                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {cpt.fee}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{cpt.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectCPT(cpt)}
                          disabled={isSelected(cpt)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {generateSmartSuggestions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Add diagnoses to see AI-powered CPT suggestions</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <div className="flex gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-2">
                {filteredCPTs.slice(0, 10).map((cpt) => (
                  <Card key={cpt.code} className={`cursor-pointer transition-colors hover:bg-accent ${isSelected(cpt) ? 'border-primary bg-primary/5' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{cpt.code}</Badge>
                            <Badge variant="secondary">{cpt.category}</Badge>
                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {cpt.fee}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{cpt.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectCPT(cpt)}
                          disabled={isSelected(cpt)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search CPT codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All' : cat}
                  </option>
                ))}
              </select>
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-2">
                {filteredCPTs.map((cpt) => (
                  <Card key={cpt.code} className={`cursor-pointer transition-colors hover:bg-accent ${isSelected(cpt) ? 'border-primary bg-primary/5' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{cpt.code}</Badge>
                            <Badge variant="secondary">{cpt.category}</Badge>
                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {cpt.fee}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{cpt.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSelectCPT(cpt)}
                          disabled={isSelected(cpt)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredCPTs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No CPT codes found matching your search</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartCPTSuggestions;