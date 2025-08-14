
import React, { useState } from 'react';
import { commonICD10Codes } from '@/utils/billingUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Diagnosis } from '@/utils/billingUtils';

interface DiagnosisSelectorProps {
  selectedDiagnoses: Diagnosis[];
  onDiagnosisChange: (diagnoses: Diagnosis[]) => void;
  maxSelections?: number;
}

const DiagnosisSelector: React.FC<DiagnosisSelectorProps> = ({
  selectedDiagnoses = [],
  onDiagnosisChange,
  maxSelections = 4
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSelect = (icd10Code: string, description: string) => {
    // Check if we're at max selections
    if (selectedDiagnoses.length >= maxSelections) return;
    
    // Check if this diagnosis is already selected
    if (selectedDiagnoses.some(d => d.icd10Code === icd10Code)) return;
    
    // Add new diagnosis
    const newDiagnosis: Diagnosis = {
      id: `diag-${Math.random().toString(36).substr(2, 9)}`,
      icd10Code,
      description
    };
    
    onDiagnosisChange([...selectedDiagnoses, newDiagnosis]);
    setOpen(false);
  };

  const removeDiagnosis = (id: string) => {
    onDiagnosisChange(selectedDiagnoses.filter(diag => diag.id !== id));
  };

  const filteredCodes = commonICD10Codes.filter(code => 
    code.code.toLowerCase().includes(searchValue.toLowerCase()) || 
    code.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedDiagnoses && selectedDiagnoses.map(diagnosis => (
          <Badge key={diagnosis.id} variant="secondary" className="gap-1">
            <span className="font-medium">{diagnosis.icd10Code}</span>
            <span>-</span>
            <span className="truncate max-w-[200px]">{diagnosis.description}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1"
              onClick={() => removeDiagnosis(diagnosis.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open}
            className="w-full justify-between"
            disabled={selectedDiagnoses && selectedDiagnoses.length >= maxSelections}
          >
            {!selectedDiagnoses || selectedDiagnoses.length === 0 
              ? "Select diagnoses..." 
              : `${selectedDiagnoses.length} diagnosis selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput 
              placeholder="Search ICD-10 codes..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            {filteredCodes.length === 0 ? (
              <CommandEmpty>No ICD-10 codes found.</CommandEmpty>
            ) : (
              <CommandGroup className="max-h-64 overflow-y-auto">
                {filteredCodes.map(code => (
                  <CommandItem
                    key={code.code}
                    value={`${code.code} ${code.description}`}
                    onSelect={() => handleSelect(code.code, code.description)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedDiagnoses && selectedDiagnoses.some(d => d.icd10Code === code.code)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <span className="font-medium mr-2">{code.code}</span>
                    <span className="text-sm text-muted-foreground">{code.description}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DiagnosisSelector;
