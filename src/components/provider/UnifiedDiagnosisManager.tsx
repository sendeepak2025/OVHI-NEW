import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Star, 
  Clock, 
  Stethoscope, 
  Brain,
  Save,
  History,
  Mic,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  X,
  Lightbulb,
  Filter,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosisItem {
  id: string;
  code: string;
  description: string;
  category: string;
  isCommon?: boolean;
  isFavorite?: boolean;
  confidence?: number;
  status?: 'active' | 'resolved' | 'rule-out' | 'chronic';
  dateAdded?: string;
  addedBy?: string;
  notes?: string;
  billable?: boolean;
}

interface DiagnosisTemplate {
  id: string;
  name: string;
  specialty: string;
  diagnoses: DiagnosisItem[];
  description?: string;
}

interface UnifiedDiagnosisManagerProps {
  patientId?: string;
  encounterId?: string;
  selectedDiagnoses: DiagnosisItem[];
  onDiagnosisChange: (diagnoses: DiagnosisItem[]) => void;
  specialty?: string;
  patientHistory?: DiagnosisItem[];
  mode?: 'encounter' | 'profile' | 'billing';
  autoSave?: boolean;
  onAutoSave?: (diagnoses: DiagnosisItem[]) => Promise<void>;
}

const ENHANCED_COMMON_DIAGNOSES: DiagnosisItem[] = [
  { 
    id: '1', 
    code: 'I10', 
    description: 'Essential hypertension', 
    category: 'Cardiovascular', 
    isCommon: true,
    billable: true,
    status: 'chronic'
  },
  { 
    id: '2', 
    code: 'E11.9', 
    description: 'Type 2 diabetes mellitus without complications', 
    category: 'Endocrine', 
    isCommon: true,
    billable: true,
    status: 'chronic'
  },
  { 
    id: '3', 
    code: 'J06.9', 
    description: 'Acute upper respiratory infection, unspecified', 
    category: 'Respiratory', 
    isCommon: true,
    billable: true,
    status: 'active'
  },
  { 
    id: '4', 
    code: 'M25.50', 
    description: 'Pain in unspecified joint', 
    category: 'Musculoskeletal', 
    isCommon: true,
    billable: true,
    status: 'active'
  },
  { 
    id: '5', 
    code: 'K59.00', 
    description: 'Constipation, unspecified', 
    category: 'Digestive', 
    isCommon: true,
    billable: true,
    status: 'active'
  },
  { 
    id: '6', 
    code: 'Z00.00', 
    description: 'Encounter for general adult medical examination', 
    category: 'Wellness', 
    isCommon: true,
    billable: true,
    status: 'active'
  },
];

const SPECIALTY_TEMPLATES: Record<string, DiagnosisTemplate[]> = {
  cardiology: [
    {
      id: 'cardio-1',
      name: 'Heart Failure Assessment',
      specialty: 'Cardiology',
      description: 'Common diagnoses for heart failure evaluation',
      diagnoses: [
        { id: 'c1', code: 'I50.9', description: 'Heart failure, unspecified', category: 'Cardiovascular', billable: true, status: 'active' },
        { id: 'c2', code: 'I25.10', description: 'Atherosclerotic heart disease', category: 'Cardiovascular', billable: true, status: 'chronic' },
        { id: 'c3', code: 'I48.91', description: 'Unspecified atrial fibrillation', category: 'Cardiovascular', billable: true, status: 'chronic' },
      ]
    }
  ],
  family: [
    {
      id: 'family-1',
      name: 'Annual Physical',
      specialty: 'Family Medicine',
      description: 'Common diagnoses for annual physical exams',
      diagnoses: [
        { id: 'f1', code: 'Z00.00', description: 'General adult medical examination', category: 'Wellness', billable: true, status: 'active' },
        { id: 'f2', code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular', billable: true, status: 'chronic' },
        { id: 'f3', code: 'E78.5', description: 'Hyperlipidemia, unspecified', category: 'Endocrine', billable: true, status: 'chronic' },
      ]
    }
  ]
};

const AI_DIAGNOSIS_SUGGESTIONS = {
  'chest pain': [
    { code: 'I20.9', description: 'Angina pectoris, unspecified', confidence: 85, category: 'Cardiovascular' },
    { code: 'K21.9', description: 'GERD, unspecified', confidence: 70, category: 'Digestive' },
    { code: 'M79.1', description: 'Myalgia', confidence: 60, category: 'Musculoskeletal' },
  ],
  'shortness of breath': [
    { code: 'I50.9', description: 'Heart failure, unspecified', confidence: 80, category: 'Cardiovascular' },
    { code: 'J44.1', description: 'COPD with acute exacerbation', confidence: 75, category: 'Respiratory' },
    { code: 'J18.9', description: 'Pneumonia, unspecified', confidence: 65, category: 'Respiratory' },
  ],
  'headache': [
    { code: 'G44.1', description: 'Vascular headache', confidence: 75, category: 'Neurological' },
    { code: 'G43.909', description: 'Migraine, unspecified', confidence: 70, category: 'Neurological' },
    { code: 'R51', description: 'Headache', confidence: 85, category: 'Symptoms' },
  ]
};

export const UnifiedDiagnosisManager: React.FC<UnifiedDiagnosisManagerProps> = ({
  patientId,
  encounterId,
  selectedDiagnoses,
  onDiagnosisChange,
  specialty = 'general',
  patientHistory = [],
  mode = 'encounter',
  autoSave = false,
  onAutoSave
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['I10', 'E11.9', 'J06.9']);
  const [recentlyUsed, setRecentlyUsed] = useState<DiagnosisItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [customDiagnosis, setCustomDiagnosis] = useState({ code: '', description: '' });
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && onAutoSave && selectedDiagnoses.length > 0) {
      const timeoutId = setTimeout(() => {
        onAutoSave(selectedDiagnoses);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDiagnoses, autoSave, onAutoSave]);

  // AI suggestions based on chief complaint
  useEffect(() => {
    if (chiefComplaint) {
      const suggestions = AI_DIAGNOSIS_SUGGESTIONS[chiefComplaint.toLowerCase()] || [];
      setAiSuggestions(suggestions);
    }
  }, [chiefComplaint]);

  const availableDiagnoses = useMemo(() => {
    const specialtyDiagnoses = SPECIALTY_TEMPLATES[specialty]?.flatMap(template => template.diagnoses) || [];
    const allDiagnoses = [...ENHANCED_COMMON_DIAGNOSES, ...specialtyDiagnoses];
    
    return allDiagnoses.map(dx => ({
      ...dx,
      isFavorite: favorites.includes(dx.code)
    }));
  }, [specialty, favorites]);

  const filteredDiagnoses = useMemo(() => {
    let filtered = availableDiagnoses;
    
    if (searchQuery) {
      filtered = filtered.filter(dx =>
        dx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dx.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(dx => dx.category === filterCategory);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(dx => dx.status === filterStatus);
    }
    
    return filtered;
  }, [searchQuery, availableDiagnoses, filterCategory, filterStatus]);

  const addDiagnosis = useCallback((diagnosis: Partial<DiagnosisItem>) => {
    const newDiagnosis: DiagnosisItem = {
      id: diagnosis.id || Math.random().toString(36).substr(2, 9),
      code: diagnosis.code || '',
      description: diagnosis.description || '',
      category: diagnosis.category || 'General',
      status: diagnosis.status || 'active',
      dateAdded: new Date().toISOString(),
      addedBy: 'current-provider',
      billable: diagnosis.billable ?? true,
      ...diagnosis
    };

    if (!selectedDiagnoses.find(d => d.code === newDiagnosis.code)) {
      const newDiagnoses = [...selectedDiagnoses, newDiagnosis];
      onDiagnosisChange(newDiagnoses);
      
      // Add to recently used
      setRecentlyUsed(prev => {
        const filtered = prev.filter(d => d.code !== newDiagnosis.code);
        return [newDiagnosis, ...filtered].slice(0, 5);
      });
      
      toast.success(`Added diagnosis: ${newDiagnosis.code}`);
    }
    setIsSearchOpen(false);
  }, [selectedDiagnoses, onDiagnosisChange]);

  const removeDiagnosis = useCallback((id: string) => {
    const newDiagnoses = selectedDiagnoses.filter(d => d.id !== id);
    onDiagnosisChange(newDiagnoses);
    toast.success('Diagnosis removed');
  }, [selectedDiagnoses, onDiagnosisChange]);

  const updateDiagnosisStatus = useCallback((id: string, status: DiagnosisItem['status']) => {
    const newDiagnoses = selectedDiagnoses.map(d => 
      d.id === id ? { ...d, status } : d
    );
    onDiagnosisChange(newDiagnoses);
    toast.success('Diagnosis status updated');
  }, [selectedDiagnoses, onDiagnosisChange]);

  const toggleFavorite = useCallback((code: string) => {
    setFavorites(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  }, []);

  const applyTemplate = useCallback((template: DiagnosisTemplate) => {
    const newDiagnoses = [...selectedDiagnoses];
    template.diagnoses.forEach(diagnosis => {
      if (!newDiagnoses.find(d => d.code === diagnosis.code)) {
        newDiagnoses.push({
          ...diagnosis,
          id: Math.random().toString(36).substr(2, 9),
          dateAdded: new Date().toISOString(),
          addedBy: 'current-provider'
        });
      }
    });
    onDiagnosisChange(newDiagnoses);
    setIsTemplateDialogOpen(false);
    toast.success(`Applied template: ${template.name}`);
  }, [selectedDiagnoses, onDiagnosisChange]);

  const handleVoiceInput = useCallback(() => {
    setIsVoiceRecording(true);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsVoiceRecording(false);
      };
      
      recognition.onerror = () => {
        setIsVoiceRecording(false);
        toast.error('Voice recognition failed');
      };
      
      recognition.start();
    } else {
      toast.error('Voice recognition not supported');
      setIsVoiceRecording(false);
    }
  }, []);

  const categories = Array.from(new Set(availableDiagnoses.map(d => d.category)));
  const statuses = ['active', 'resolved', 'rule-out', 'chronic'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Unified Diagnosis Manager
            {mode === 'encounter' && <Badge variant="outline">Encounter Mode</Badge>}
          </CardTitle>
          <div className="flex gap-2">
            {mode === 'encounter' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                disabled={isVoiceRecording}
              >
                <Mic className={`h-4 w-4 mr-1 ${isVoiceRecording ? 'text-red-500' : ''}`} />
                {isVoiceRecording ? 'Recording...' : 'Voice'}
              </Button>
            )}
            
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Diagnosis Templates</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {SPECIALTY_TEMPLATES[specialty]?.map(template => (
                      <Card key={template.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                          <Button size="sm" onClick={() => applyTemplate(template)}>
                            Apply
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {template.diagnoses.map(dx => (
                            <div key={dx.id} className="text-sm">
                              <span className="font-medium">{dx.code}</span> - {dx.description}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-1" />
                  Search & Add
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                <Command>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput 
                      placeholder="Search diagnoses..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                  </div>
                  <div className="p-2 border-b">
                    <div className="flex gap-2">
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CommandList>
                    <CommandEmpty>No diagnoses found.</CommandEmpty>
                    
                    {favorites.length > 0 && (
                      <CommandGroup heading="Favorites">
                        {availableDiagnoses
                          .filter(dx => dx.isFavorite)
                          .map((diagnosis) => (
                            <CommandItem
                              key={diagnosis.id}
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
                            key={diagnosis.id}
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

                    {aiSuggestions.length > 0 && (
                      <CommandGroup heading="AI Suggestions">
                        {aiSuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => addDiagnosis(suggestion)}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">{suggestion.code}</div>
                              <div className="text-sm text-muted-foreground">{suggestion.description}</div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {suggestion.confidence}% confidence
                              </Badge>
                            </div>
                            <Brain className="h-4 w-4 text-blue-500" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    <CommandGroup heading="All Diagnoses">
                      {filteredDiagnoses.map((diagnosis) => (
                        <CommandItem
                          key={diagnosis.id}
                          onSelect={() => addDiagnosis(diagnosis)}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{diagnosis.code}</div>
                            <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {diagnosis.category}
                              </Badge>
                              {diagnosis.billable && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  Billable
                                </Badge>
                              )}
                            </div>
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
        
        {mode === 'encounter' && (
          <div className="space-y-2">
            <Input
              placeholder="Enter chief complaint for AI suggestions..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
            />
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{selectedDiagnoses.length} diagnoses selected</span>
          {autoSave && <span className="flex items-center gap-1"><Save className="h-3 w-3" /> Auto-save enabled</span>}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="selected" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="selected">Selected ({selectedDiagnoses.length})</TabsTrigger>
            <TabsTrigger value="history">Patient History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="custom">Add Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="selected" className="space-y-4">
            {selectedDiagnoses.length > 0 ? (
              <div className="space-y-3">
                {selectedDiagnoses.map((diagnosis) => (
                  <Card key={diagnosis.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{diagnosis.code}</span>
                          <Badge variant={diagnosis.status === 'active' ? 'default' : 'secondary'}>
                            {diagnosis.status}
                          </Badge>
                          {diagnosis.billable && (
                            <Badge variant="outline" className="text-green-600">
                              Billable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{diagnosis.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Category: {diagnosis.category}</span>
                          {diagnosis.dateAdded && (
                            <span>Added: {new Date(diagnosis.dateAdded).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={diagnosis.status}
                          onValueChange={(value) => updateDiagnosisStatus(diagnosis.id, value as DiagnosisItem['status'])}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="rule-out">Rule Out</SelectItem>
                            <SelectItem value="chronic">Chronic</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFavorite(diagnosis.code)}
                        >
                          <Star className={`h-4 w-4 ${diagnosis.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDiagnosis(diagnosis.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No diagnoses selected</p>
                <p className="text-sm">Click "Search & Add" to add diagnoses</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {patientHistory.length > 0 ? (
              <div className="space-y-3">
                {patientHistory.map((diagnosis, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{diagnosis.code}</div>
                        <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {diagnosis.category}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addDiagnosis(diagnosis)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patient history available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">Diagnosis Stats</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Diagnoses:</span>
                    <span className="font-medium">{selectedDiagnoses.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active:</span>
                    <span className="font-medium text-green-600">
                      {selectedDiagnoses.filter(d => d.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Chronic:</span>
                    <span className="font-medium text-orange-600">
                      {selectedDiagnoses.filter(d => d.status === 'chronic').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Billable:</span>
                    <span className="font-medium text-blue-600">
                      {selectedDiagnoses.filter(d => d.billable).length}
                    </span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">Common Categories</h4>
                </div>
                <div className="space-y-2">
                  {Array.from(new Set(selectedDiagnoses.map(d => d.category))).map(category => (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}:</span>
                      <span className="font-medium">
                        {selectedDiagnoses.filter(d => d.category === category).length}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-4">Add Custom Diagnosis</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">ICD-10 Code</label>
                    <Input
                      placeholder="e.g., Z99.89"
                      value={customDiagnosis.code}
                      onChange={(e) => setCustomDiagnosis(prev => ({ ...prev, code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Enter diagnosis description"
                      value={customDiagnosis.description}
                      onChange={(e) => setCustomDiagnosis(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (customDiagnosis.code && customDiagnosis.description) {
                      addDiagnosis({
                        code: customDiagnosis.code,
                        description: customDiagnosis.description,
                        category: 'Custom',
                        billable: true,
                        status: 'active'
                      });
                      setCustomDiagnosis({ code: '', description: '' });
                    }
                  }}
                  disabled={!customDiagnosis.code || !customDiagnosis.description}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Diagnosis
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};