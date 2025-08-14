
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  FileText, 
  Download, 
  Upload, 
  ClipboardCheck, 
  Clock, 
  Search,
  Tag
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface ConsultationNotesProps {
  patient: any;
  onSaveNotes?: (notes: string, diagnosis: string, treatmentPlan: string) => void;
}

// Common medical terms for quick selection
const MEDICAL_TERMS = [
  { term: "Hypertension", definition: "High blood pressure" },
  { term: "Diabetes Mellitus", definition: "A group of metabolic disorders characterized by high blood sugar" },
  { term: "Dyslipidemia", definition: "Abnormal amount of lipids in the blood" },
  { term: "COPD", definition: "Chronic Obstructive Pulmonary Disease" },
  { term: "CHF", definition: "Congestive Heart Failure" },
  { term: "Arrhythmia", definition: "Irregular heartbeat" },
  { term: "Gastritis", definition: "Inflammation of the stomach lining" },
  { term: "Hypothyroidism", definition: "Underactive thyroid gland" },
  { term: "Arthritis", definition: "Inflammation of one or more joints" },
];

// Common medications for quick selection
const COMMON_MEDICATIONS = [
  "Lisinopril 10mg",
  "Metformin 500mg",
  "Atorvastatin 20mg",
  "Levothyroxine 50mcg",
  "Amlodipine 5mg",
  "Metoprolol 25mg",
  "Sertraline 50mg",
  "Omeprazole 20mg",
  "Albuterol inhaler",
  "Hydrochlorothiazide 12.5mg"
];

const ConsultationNotes: React.FC<ConsultationNotesProps> = ({ patient, onSaveNotes }) => {
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [activeTab, setActiveTab] = useState('soap');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [icdCodes, setIcdCodes] = useState<string[]>([]);
  const [newIcdCode, setNewIcdCode] = useState('');
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && (notes || diagnosis || treatmentPlan)) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleSaveAsDraft();
      }, 30000); // Auto-save every 30 seconds
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [notes, diagnosis, treatmentPlan, autoSaveEnabled]);

  const handleSaveNotes = () => {
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (onSaveNotes) {
        onSaveNotes(notes, diagnosis, treatmentPlan);
      } else {
        toast.success("Consultation notes saved");
      }
      setIsSaving(false);
      setLastSaved(new Date());
    }, 800);
  };

  const addTemplate = (templateType: string) => {
    let template = '';
    
    switch (templateType) {
      case 'subjective':
        template = `Chief Complaint: \nHistory of Present Illness: \nPast Medical History: \nMedications: \nAllergies: \nSocial History: \nFamily History: `;
        break;
      case 'objective':
        template = `Vital Signs: \n- BP: ${Math.floor(Math.random() * 40) + 100}/${Math.floor(Math.random() * 20) + 70} mmHg\n- HR: ${Math.floor(Math.random() * 20) + 60} bpm\n- RR: 16/min\n- Temp: 98.6°F\n- SpO2: 98%\n\nPhysical Examination: \nGeneral: \nHEENT: \nCardiovascular: \nRespiratory: \nGastrointestinal: \nMusculoskeletal: \nNeurological: \nSkin: `;
        break;
      case 'assessment':
        template = `Primary Diagnosis: \nDifferential Diagnosis: \n1. \n2. \n3. \nJustification: `;
        break;
      case 'plan':
        template = `Treatment Plan: \nMedications: \nDiagnostic Tests: \nConsultations/Referrals: \nPatient Education: \nFollow-up: `;
        break;
      default:
        break;
    }
    
    setNotes(prev => prev + (prev ? '\n\n' : '') + template);
  };
  
  const handleExportNotes = () => {
    // In a real app, this would trigger a PDF download
    toast.success("Notes exported as PDF");
  };
  
  const handleSaveAsDraft = () => {
    toast.info("Notes saved as draft");
    setLastSaved(new Date());
  };
  
  const addMedication = () => {
    if (newMedication) {
      const medicationEntry = dosage 
        ? `${newMedication} ${dosage}` 
        : newMedication;
        
      setMedications([...medications, medicationEntry]);
      setNewMedication('');
      setDosage('');
      
      // Add to treatment plan
      setTreatmentPlan(prev => {
        const addition = `\n- ${medicationEntry}`;
        return prev ? prev + addition : `Prescribed Medications:${addition}`;
      });
      
      toast.success(`Added ${medicationEntry} to treatment plan`);
    }
  };
  
  const addIcdCode = () => {
    if (newIcdCode && !icdCodes.includes(newIcdCode)) {
      setIcdCodes([...icdCodes, newIcdCode]);
      setNewIcdCode('');
      toast.success(`Added ICD code: ${newIcdCode}`);
    }
  };
  
  const insertMedicalTerm = (term: string) => {
    setNotes(prev => prev + (prev.endsWith(' ') ? '' : ' ') + term);
  };
  
  // Filter medical terms based on search
  const filteredTerms = MEDICAL_TERMS.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Consultation Notes: {patient.name}</span>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleExportNotes}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="soap">SOAP Note</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="terminology">Terminology</TabsTrigger>
          </TabsList>
          
          <TabsContent value="soap" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => addTemplate('subjective')}>+ Subjective</Button>
              <Button variant="outline" size="sm" onClick={() => addTemplate('objective')}>+ Objective</Button>
              <Button variant="outline" size="sm" onClick={() => addTemplate('assessment')}>+ Assessment</Button>
              <Button variant="outline" size="sm" onClick={() => addTemplate('plan')}>+ Plan</Button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-xs flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-1"
                    checked={autoSaveEnabled}
                    onChange={e => setAutoSaveEnabled(e.target.checked)}
                  />
                  Auto-save
                </label>
              </div>
            </div>
            
            <Textarea 
              className="w-full min-h-[300px]"
              placeholder="Enter detailed consultation notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </TabsContent>
          
          <TabsContent value="diagnosis" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Diagnosis</label>
              <Textarea 
                placeholder="Enter primary diagnosis" 
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">ICD-10 Codes</label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter ICD-10 code" 
                  value={newIcdCode}
                  onChange={(e) => setNewIcdCode(e.target.value)}
                />
                <Button variant="outline" onClick={addIcdCode}>Add</Button>
              </div>
              
              <div className="mt-2">
                {icdCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {icdCodes.map((code, index) => (
                      <div key={index} className="flex items-center bg-muted rounded-md px-3 py-1 text-sm">
                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                        {code}
                        <button 
                          className="ml-2 text-muted-foreground hover:text-destructive"
                          onClick={() => setIcdCodes(icdCodes.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No ICD-10 codes added</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Differential Diagnosis</label>
              <Textarea 
                placeholder="List differential diagnoses to consider..."
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="treatment" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Treatment Plan</label>
              <Textarea 
                className="w-full min-h-[150px]"
                placeholder="Detail the treatment approach..."
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Prescribed Medications</label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Medication name" 
                  list="common-medications"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                />
                <datalist id="common-medications">
                  {COMMON_MEDICATIONS.map((med, i) => (
                    <option key={i} value={med} />
                  ))}
                </datalist>
                <Input 
                  placeholder="Dosage" 
                  className="max-w-[150px]"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
                <Button variant="outline" onClick={addMedication}>Add</Button>
              </div>
              
              {medications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((medication, index) => (
                      <TableRow key={index}>
                        <TableCell>{medication}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMedications(medications.filter((_, i) => i !== index));
                              toast.info("Medication removed");
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="bg-muted p-2 rounded-md min-h-[60px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No medications prescribed</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Follow-up</label>
              <div className="flex space-x-2">
                <Input type="number" placeholder="Number" className="max-w-[100px]" />
                <select className="rounded-md border p-2">
                  <option>Days</option>
                  <option>Weeks</option>
                  <option>Months</option>
                </select>
                <Button variant="outline" onClick={() => toast.success("Follow-up scheduled")}>
                  Schedule
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Available Templates</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                  <div>
                    <p className="font-medium">Follow-up Visit Template</p>
                    <p className="text-xs text-muted-foreground">Standard template for follow-up appointments</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setNotes("Follow-up Visit\n\nSubjective: Patient reports...\nObjective: Vital signs stable...\nAssessment: Condition improved...\nPlan: Continue current medication...");
                    setActiveTab("soap");
                    toast.success("Template loaded");
                  }}>
                    <Upload className="h-4 w-4 mr-1" /> Load
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                  <div>
                    <p className="font-medium">Chronic Condition Management</p>
                    <p className="text-xs text-muted-foreground">For ongoing management of chronic conditions</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setNotes("Chronic Condition Management\n\nSubjective: Patient reports current symptoms...\nObjective: Review of vitals and test results...\nAssessment: Current status of condition...\nPlan: Medication adjustments, lifestyle recommendations...");
                    setActiveTab("soap");
                    toast.success("Template loaded");
                  }}>
                    <Upload className="h-4 w-4 mr-1" /> Load
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                  <div>
                    <p className="font-medium">Mental Health Assessment</p>
                    <p className="text-xs text-muted-foreground">Comprehensive mental health evaluation template</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setNotes("Mental Health Assessment\n\nSubjective: Patient mood and self-reported symptoms...\nObjective: Mental status examination...\nAssessment: Diagnostic impression...\nPlan: Therapeutic interventions, medication if applicable...");
                    setActiveTab("soap");
                    toast.success("Template loaded");
                  }}>
                    <Upload className="h-4 w-4 mr-1" /> Load
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium">Save Current Note as Template</h3>
              <div className="flex space-x-2">
                <Input placeholder="Template name" />
                <Button variant="outline" onClick={() => toast.success("Template saved for future use")}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="terminology" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Medical Terminology Lookup</h3>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medical terms..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-4 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead>Definition</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTerms.length > 0 ? (
                      filteredTerms.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.term}</TableCell>
                          <TableCell>{item.definition}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => insertMedicalTerm(item.term)}
                            >
                              <ClipboardCheck className="h-4 w-4 mr-1" /> Insert
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          No results found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={handleSaveAsDraft}>
          <FileText className="h-4 w-4 mr-1" /> Save as Draft
        </Button>
        <Button onClick={handleSaveNotes} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save & Complete"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConsultationNotes;
