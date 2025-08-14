import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Search, 
  Star, 
  Zap,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosisItem {
  id: string;
  code: string;
  description: string;
  category: string;
  isCommon?: boolean;
  isFavorite?: boolean;
}

interface QuickDiagnosisWidgetProps {
  onDiagnosisAdd: (diagnosis: DiagnosisItem) => void;
  patientId?: string;
  compact?: boolean;
  showFavorites?: boolean;
  showRecent?: boolean;
  placeholder?: string;
}

const QUICK_ACCESS_DIAGNOSES: DiagnosisItem[] = [
  { id: '1', code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular', isCommon: true },
  { id: '2', code: 'E11.9', description: 'Type 2 diabetes mellitus', category: 'Endocrine', isCommon: true },
  { id: '3', code: 'J06.9', description: 'Upper respiratory infection', category: 'Respiratory', isCommon: true },
  { id: '4', code: 'M25.50', description: 'Joint pain, unspecified', category: 'Musculoskeletal', isCommon: true },
  { id: '5', code: 'Z00.00', description: 'General medical examination', category: 'Wellness', isCommon: true },
  { id: '6', code: 'F32.9', description: 'Major depressive disorder', category: 'Mental Health', isCommon: true },
];

const SPECIALTY_QUICK_ACCESS = {
  cardiology: [
    { id: 'c1', code: 'I50.9', description: 'Heart failure', category: 'Cardiovascular' },
    { id: 'c2', code: 'I48.91', description: 'Atrial fibrillation', category: 'Cardiovascular' },
    { id: 'c3', code: 'I25.10', description: 'Coronary artery disease', category: 'Cardiovascular' },
  ],
  family: [
    { id: 'f1', code: 'Z00.00', description: 'Annual physical', category: 'Wellness' },
    { id: 'f2', code: 'J06.9', description: 'Cold/URI', category: 'Respiratory' },
    { id: 'f3', code: 'K21.9', description: 'GERD', category: 'Digestive' },
  ],
  internal: [
    { id: 'i1', code: 'E11.9', description: 'Type 2 diabetes', category: 'Endocrine' },
    { id: 'i2', code: 'I10', description: 'Hypertension', category: 'Cardiovascular' },
    { id: 'i3', code: 'E78.5', description: 'Hyperlipidemia', category: 'Endocrine' },
  ]
};

export const QuickDiagnosisWidget: React.FC<QuickDiagnosisWidgetProps> = ({
  onDiagnosisAdd,
  patientId,
  compact = false,
  showFavorites = true,
  showRecent = true,
  placeholder = "Quick add diagnosis..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentDiagnoses, setRecentDiagnoses] = useState<DiagnosisItem[]>([]);
  const [favorites] = useState<string[]>(['I10', 'E11.9', 'J06.9']);

  const handleQuickAdd = useCallback((diagnosis: DiagnosisItem) => {
    onDiagnosisAdd(diagnosis);
    
    // Add to recent
    setRecentDiagnoses(prev => {
      const filtered = prev.filter(d => d.id !== diagnosis.id);
      return [diagnosis, ...filtered].slice(0, 3);
    });
    
    setIsOpen(false);
    setSearchQuery('');
    toast.success(`Added: ${diagnosis.code}`);
  }, [onDiagnosisAdd]);

  const filteredDiagnoses = QUICK_ACCESS_DIAGNOSES.filter(dx =>
    dx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dx.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-3 w-3 mr-1" />
              Dx
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput 
                placeholder={placeholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No diagnoses found.</CommandEmpty>
                
                {showRecent && recentDiagnoses.length > 0 && (
                  <CommandGroup heading="Recently Added">
                    {recentDiagnoses.map((diagnosis) => (
                      <CommandItem
                        key={diagnosis.id}
                        onSelect={() => handleQuickAdd(diagnosis)}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-sm">{diagnosis.code}</div>
                          <div className="text-xs text-muted-foreground">{diagnosis.description}</div>
                        </div>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                <CommandGroup heading="Quick Access">
                  {filteredDiagnoses.map((diagnosis) => (
                    <CommandItem
                      key={diagnosis.id}
                      onSelect={() => handleQuickAdd(diagnosis)}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-sm">{diagnosis.code}</div>
                        <div className="text-xs text-muted-foreground">{diagnosis.description}</div>
                      </div>
                      {diagnosis.isCommon && (
                        <Badge variant="outline" className="text-xs">
                          Common
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary" />
          <h4 className="font-medium">Quick Diagnosis</h4>
        </div>
        
        <div className="space-y-3">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                {placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder={placeholder}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No diagnoses found.</CommandEmpty>
                  
                  {showFavorites && (
                    <CommandGroup heading="Favorites">
                      {QUICK_ACCESS_DIAGNOSES
                        .filter(dx => favorites.includes(dx.code))
                        .map((diagnosis) => (
                          <CommandItem
                            key={diagnosis.id}
                            onSelect={() => handleQuickAdd(diagnosis)}
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

                  {showRecent && recentDiagnoses.length > 0 && (
                    <CommandGroup heading="Recently Added">
                      {recentDiagnoses.map((diagnosis) => (
                        <CommandItem
                          key={diagnosis.id}
                          onSelect={() => handleQuickAdd(diagnosis)}
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

                  <CommandGroup heading="Common Diagnoses">
                    {filteredDiagnoses.map((diagnosis) => (
                      <CommandItem
                        key={diagnosis.id}
                        onSelect={() => handleQuickAdd(diagnosis)}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{diagnosis.code}</div>
                          <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {diagnosis.category}
                          </Badge>
                        </div>
                        {diagnosis.isCommon && (
                          <Badge variant="secondary" className="text-xs">
                            Common
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACCESS_DIAGNOSES.slice(0, 4).map((diagnosis) => (
              <Button
                key={diagnosis.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(diagnosis)}
                className="justify-start text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {diagnosis.code}
              </Button>
            ))}
          </div>

          {recentDiagnoses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Recently Used</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {recentDiagnoses.slice(0, 3).map((diagnosis) => (
                  <Button
                    key={diagnosis.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAdd(diagnosis)}
                    className="h-6 px-2 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                    {diagnosis.code}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};