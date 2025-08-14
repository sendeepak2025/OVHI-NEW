import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Plus, Star, Clock, Stethoscope } from 'lucide-react';

interface DiagnosisItem {
  code: string;
  description: string;
  category: string;
  isCommon?: boolean;
  isFavorite?: boolean;
}

interface SmartDiagnosisPickerProps {
  selectedDiagnoses: DiagnosisItem[];
  onDiagnosisChange: (diagnoses: DiagnosisItem[]) => void;
  specialty?: string;
  patientHistory?: DiagnosisItem[];
}

const COMMON_DIAGNOSES: DiagnosisItem[] = [
  { code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular', isCommon: true },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine', isCommon: true },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory', isCommon: true },
  { code: 'M25.50', description: 'Pain in unspecified joint', category: 'Musculoskeletal', isCommon: true },
  { code: 'K59.00', description: 'Constipation, unspecified', category: 'Digestive', isCommon: true },
  { code: 'R50.9', description: 'Fever, unspecified', category: 'Symptoms', isCommon: true },
  { code: 'Z00.00', description: 'Encounter for general adult medical examination', category: 'Wellness', isCommon: true },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health', isCommon: true },
];

const SPECIALTY_TEMPLATES = {
  cardiology: [
    { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery', category: 'Cardiovascular' },
    { code: 'I48.91', description: 'Unspecified atrial fibrillation', category: 'Cardiovascular' },
    { code: 'I50.9', description: 'Heart failure, unspecified', category: 'Cardiovascular' },
  ],
  family: [
    { code: 'Z00.00', description: 'General adult medical examination', category: 'Wellness' },
    { code: 'J06.9', description: 'Upper respiratory infection', category: 'Respiratory' },
    { code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular' },
  ],
  internal: [
    { code: 'E11.9', description: 'Type 2 diabetes mellitus', category: 'Endocrine' },
    { code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular' },
    { code: 'K21.9', description: 'Gastro-esophageal reflux disease', category: 'Digestive' },
  ]
};

export const SmartDiagnosisPicker: React.FC<SmartDiagnosisPickerProps> = ({
  selectedDiagnoses,
  onDiagnosisChange,
  specialty = 'general',
  patientHistory = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['I10', 'E11.9', 'J06.9']);
  const [recentlyUsed, setRecentlyUsed] = useState<DiagnosisItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const availableDiagnoses = useMemo(() => {
    const specialtyDiagnoses = SPECIALTY_TEMPLATES[specialty as keyof typeof SPECIALTY_TEMPLATES] || [];
    const allDiagnoses = [...COMMON_DIAGNOSES, ...specialtyDiagnoses];
    
    return allDiagnoses.map(dx => ({
      ...dx,
      isFavorite: favorites.includes(dx.code)
    }));
  }, [specialty, favorites]);

  const filteredDiagnoses = useMemo(() => {
    if (!searchQuery) return availableDiagnoses;
    
    return availableDiagnoses.filter(dx =>
      dx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dx.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, availableDiagnoses]);

  const addDiagnosis = (diagnosis: DiagnosisItem) => {
    if (!selectedDiagnoses.find(d => d.code === diagnosis.code)) {
      const newDiagnoses = [...selectedDiagnoses, diagnosis];
      onDiagnosisChange(newDiagnoses);
      
      // Add to recently used
      setRecentlyUsed(prev => {
        const filtered = prev.filter(d => d.code !== diagnosis.code);
        return [diagnosis, ...filtered].slice(0, 5);
      });
    }
    setIsOpen(false);
  };

  const removeDiagnosis = (code: string) => {
    const newDiagnoses = selectedDiagnoses.filter(d => d.code !== code);
    onDiagnosisChange(newDiagnoses);
  };

  const toggleFavorite = (code: string) => {
    setFavorites(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const quickAddCommon = () => {
    const commonForSpecialty = SPECIALTY_TEMPLATES[specialty as keyof typeof SPECIALTY_TEMPLATES]?.[0];
    if (commonForSpecialty) {
      addDiagnosis(commonForSpecialty);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Smart Diagnosis Picker
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={quickAddCommon}>
              <Plus className="h-4 w-4 mr-1" />
              Common
            </Button>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-1" />
                  Search ICD-10
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search diagnoses..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No diagnoses found.</CommandEmpty>
                    
                    {favorites.length > 0 && (
                      <CommandGroup heading="Favorites">
                        {availableDiagnoses
                          .filter(dx => dx.isFavorite)
                          .map((diagnosis) => (
                            <CommandItem
                              key={diagnosis.code}
                              onSelect={() => addDiagnosis(diagnosis)}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">{diagnosis.code}</div>
                                <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                              </div>
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}

                    {recentlyUsed.length > 0 && (
                      <CommandGroup heading="Recently Used">
                        {recentlyUsed.map((diagnosis) => (
                          <CommandItem
                            key={diagnosis.code}
                            onSelect={() => addDiagnosis(diagnosis)}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">{diagnosis.code}</div>
                              <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                            </div>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    <CommandGroup heading="All Diagnoses">
                      {filteredDiagnoses.map((diagnosis) => (
                        <CommandItem
                          key={diagnosis.code}
                          onSelect={() => addDiagnosis(diagnosis)}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{diagnosis.code}</div>
                            <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {diagnosis.category}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(diagnosis.code);
                            }}
                          >
                            <Star className={`h-4 w-4 ${diagnosis.isFavorite ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Badge variant="outline">{specialty} - {selectedDiagnoses.length} selected</Badge>
      </CardHeader>

      <CardContent>
        {selectedDiagnoses.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Diagnoses:</h4>
            <div className="space-y-2">
              {selectedDiagnoses.map((diagnosis) => (
                <div key={diagnosis.code} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{diagnosis.code}</div>
                    <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {diagnosis.category}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDiagnosis(diagnosis.code)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No diagnoses selected</p>
            <p className="text-sm">Click "Search ICD-10" to add diagnoses</p>
          </div>
        )}

        {patientHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Patient History:</h4>
            <div className="flex flex-wrap gap-2">
              {patientHistory.slice(0, 3).map((diagnosis) => (
                <Button
                  key={diagnosis.code}
                  variant="ghost"
                  size="sm"
                  onClick={() => addDiagnosis(diagnosis)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {diagnosis.code}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};