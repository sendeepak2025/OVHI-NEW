import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { updateSettingsApi } from "@/services/operations/settings";
import { 
  Heart, 
  Brain, 
  Stethoscope, 
  Activity, 
  Clock, 
  DollarSign, 
  FileText, 
  Settings,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';

interface SpecialtyTemplate {
  id: string;
  name: string;
  specialty: string;
  visitType: string;
  duration: number;
  cptCode: string;
  charge: number;
  soapStructure: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  automationRules: {
    timeBasedCpt: boolean;
    modifierAssignment: boolean;
    billingOptimization: boolean;
  };
}

interface SpecialtyConfig {
  primarySpecialty: string;
  secondarySpecialties: string[];
  templates: SpecialtyTemplate[];
  billingRules: {
    timeBasedSelection: boolean;
    automaticModifiers: boolean;
    chargeOptimization: boolean;
  };
}

const MEDICAL_SPECIALTIES = [
  {
    id: 'primary_care',
    name: 'Primary Care',
    icon: Stethoscope,
    description: 'Family Medicine, Internal Medicine, Preventive Care',
    templates: [
      {
        id: 'pc_new_patient',
        name: 'New Patient Comprehensive',
        visitType: 'New Patient',
        duration: 60,
        cptCode: '99205',
        charge: 148.00,
        soapStructure: {
          subjective: 'Chief complaint, HPI, ROS, PMH, FH, SH',
          objective: 'Vital signs, physical exam by systems',
          assessment: 'Clinical impression, diagnosis codes',
          plan: 'Treatment plan, medications, follow-up'
        }
      },
      {
        id: 'pc_established',
        name: 'Established Patient Follow-up',
        visitType: 'Established',
        duration: 30,
        cptCode: '99214',
        charge: 109.00,
        soapStructure: {
          subjective: 'Interval history, current symptoms',
          objective: 'Focused physical exam',
          assessment: 'Assessment of current conditions',
          plan: 'Medication adjustments, next steps'
        }
      },
      {
        id: 'pc_annual',
        name: 'Annual Wellness Visit',
        visitType: 'Preventive',
        duration: 45,
        cptCode: 'G0438',
        charge: 180.00,
        soapStructure: {
          subjective: 'Health risk assessment, screening history',
          objective: 'Vital signs, BMI, cognitive assessment',
          assessment: 'Risk stratification, health status',
          plan: 'Preventive care plan, screenings'
        }
      }
    ]
  },
  {
    id: 'mental_health',
    name: 'Mental Health',
    icon: Brain,
    description: 'Psychiatry, Psychology, Behavioral Health',
    templates: [
      {
        id: 'mh_initial_eval',
        name: 'Initial Psychiatric Evaluation',
        visitType: 'Initial Evaluation',
        duration: 90,
        cptCode: '90791',
        charge: 200.00,
        soapStructure: {
          subjective: 'Chief complaint, psychiatric history, substance use',
          objective: 'Mental status exam, appearance, behavior',
          assessment: 'DSM-5 diagnosis, risk assessment',
          plan: 'Treatment plan, medications, therapy referrals'
        }
      },
      {
        id: 'mh_psychotherapy',
        name: 'Psychotherapy Session',
        visitType: 'Therapy',
        duration: 45,
        cptCode: '90834',
        charge: 120.00,
        soapStructure: {
          subjective: 'Current mood, stressors, progress',
          objective: 'Mental status, therapeutic alliance',
          assessment: 'Treatment response, symptom changes',
          plan: 'Therapeutic interventions, homework'
        }
      }
    ]
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: Heart,
    description: 'Cardiovascular Care, Cardiac Procedures',
    templates: [
      {
        id: 'card_consult',
        name: 'Initial Cardiac Consultation',
        visitType: 'Consultation',
        duration: 60,
        cptCode: '99244',
        charge: 280.00,
        soapStructure: {
          subjective: 'Cardiac symptoms, risk factors, family history',
          objective: 'Cardiac exam, EKG review, imaging',
          assessment: 'Cardiac diagnosis, risk stratification',
          plan: 'Diagnostic workup, treatment recommendations'
        }
      },
      {
        id: 'card_echo',
        name: 'Echocardiogram Interpretation',
        visitType: 'Procedure',
        duration: 30,
        cptCode: '93306',
        charge: 150.00,
        soapStructure: {
          subjective: 'Indication for echo, symptoms',
          objective: 'Echo findings, measurements',
          assessment: 'Echo interpretation, cardiac function',
          plan: 'Follow-up recommendations'
        }
      }
    ]
  },
  {
    id: 'urgent_care',
    name: 'Urgent Care',
    icon: Activity,
    description: 'Emergency Care, Minor Procedures, Triage',
    templates: [
      {
        id: 'uc_minor_illness',
        name: 'Minor Illness',
        visitType: 'Urgent',
        duration: 20,
        cptCode: '99213',
        charge: 74.00,
        soapStructure: {
          subjective: 'Acute symptoms, onset, severity',
          objective: 'Focused exam, vital signs',
          assessment: 'Clinical diagnosis',
          plan: 'Treatment, medications, follow-up'
        }
      },
      {
        id: 'uc_laceration',
        name: 'Laceration Repair',
        visitType: 'Procedure',
        duration: 30,
        cptCode: '12001',
        charge: 150.00,
        soapStructure: {
          subjective: 'Mechanism of injury, tetanus status',
          objective: 'Wound assessment, size, depth',
          assessment: 'Wound requiring repair',
          plan: 'Repair technique, wound care'
        }
      }
    ]
  }
];

const SmartSpecialtyManager: React.FC = () => {
  const [specialtyConfig, setSpecialtyConfig] = useState<SpecialtyConfig>({
    primarySpecialty: '',
    secondarySpecialties: [],
    templates: [],
    billingRules: {
      timeBasedSelection: true,
      automaticModifiers: true,
      chargeOptimization: true
    }
  });
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SpecialtyTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SpecialtyTemplate | null>(null);

  useEffect(() => {
    // Load saved specialty configuration on component mount
    const savedConfig = localStorage.getItem('specialtyConfig');
    if (savedConfig) {
      setSpecialtyConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSpecialtySelect = (specialtyId: string) => {
    const specialty = MEDICAL_SPECIALTIES.find(s => s.id === specialtyId);
    if (specialty) {
      const newConfig = {
        ...specialtyConfig,
        primarySpecialty: specialtyId,
        templates: specialty.templates.map(template => ({
          ...template,
          specialty: specialtyId,
          automationRules: {
            timeBasedCpt: true,
            modifierAssignment: true,
            billingOptimization: true
          }
        }))
      };
      setSpecialtyConfig(newConfig);
      setSelectedSpecialty(specialtyId);
      localStorage.setItem('specialtyConfig', JSON.stringify(newConfig));
    }
  };

  const handleSaveConfiguration = async () => {
    setIsLoading(true);
    try {
      await updateSettingsApi(specialtyConfig);
      toast({
        title: "Success",
        description: "Specialty configuration saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateEdit = (template: SpecialtyTemplate, field: string, value: any) => {
    if (!editingTemplate) return;
    
    const updated = { ...editingTemplate, [field]: value };
    setEditingTemplate(updated);
  };

  const saveTemplateEdit = () => {
    if (!editingTemplate) return;
    
    const updatedTemplates = specialtyConfig.templates.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    );
    
    const newConfig = { ...specialtyConfig, templates: updatedTemplates };
    setSpecialtyConfig(newConfig);
    localStorage.setItem('specialtyConfig', JSON.stringify(newConfig));
    setEditingTemplate(null);
    
    toast({
      title: "Template Updated",
      description: "Template has been successfully updated.",
    });
  };

  const selectedSpecialtyData = MEDICAL_SPECIALTIES.find(s => s.id === selectedSpecialty);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Smart Specialty Configuration
          </CardTitle>
          <CardDescription>
            Select your medical specialty to automatically load pre-configured templates, CPT codes, and billing rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="specialty-select">Primary Medical Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={handleSpecialtySelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your medical specialty..." />
                </SelectTrigger>
                <SelectContent>
                  {MEDICAL_SPECIALTIES.map((specialty) => {
                    const IconComponent = specialty.icon;
                    return (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{specialty.name}</div>
                            <div className="text-sm text-muted-foreground">{specialty.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedSpecialtyData && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <selectedSpecialtyData.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{selectedSpecialtyData.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{selectedSpecialtyData.description}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedSpecialtyData.templates.length} Templates</Badge>
                  <Badge variant="outline">Automated Billing</Badge>
                  <Badge variant="outline">Smart CPT Selection</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {specialtyConfig.templates.length > 0 && (
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="billing">Billing Rules</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Encounter Templates</CardTitle>
                <CardDescription>
                  Pre-configured templates with CPT codes and charges for your specialty.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {specialtyConfig.templates.map((template) => (
                    <Card key={template.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription>{template.visitType}</CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setPreviewTemplate(template)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Duration:</span>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.duration} min
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">CPT Code:</span>
                            <Badge variant="outline">{template.cptCode}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Charge:</span>
                            <Badge variant="default">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${template.charge.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing Configuration</CardTitle>
                <CardDescription>
                  Configure automated billing rules for your specialty.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Time-Based CPT Selection</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically select CPT codes based on appointment duration
                    </p>
                  </div>
                  <Switch 
                    checked={specialtyConfig.billingRules.timeBasedSelection}
                    onCheckedChange={(checked) => 
                      setSpecialtyConfig(prev => ({
                        ...prev,
                        billingRules: { ...prev.billingRules, timeBasedSelection: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Automatic Modifiers</Label>
                    <p className="text-sm text-muted-foreground">
                      Apply appropriate billing modifiers based on visit type
                    </p>
                  </div>
                  <Switch 
                    checked={specialtyConfig.billingRules.automaticModifiers}
                    onCheckedChange={(checked) => 
                      setSpecialtyConfig(prev => ({
                        ...prev,
                        billingRules: { ...prev.billingRules, automaticModifiers: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Charge Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize billing codes for maximum reimbursement
                    </p>
                  </div>
                  <Switch 
                    checked={specialtyConfig.billingRules.chargeOptimization}
                    onCheckedChange={(checked) => 
                      setSpecialtyConfig(prev => ({
                        ...prev,
                        billingRules: { ...prev.billingRules, chargeOptimization: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automation Rules</CardTitle>
                <CardDescription>
                  Configure how the system automates template and billing selection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Smart Template Selection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Auto-select based on appointment type</li>
                        <li>• Consider patient history</li>
                        <li>• Match visit duration to CPT codes</li>
                        <li>• Suggest appropriate templates</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        Billing Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Time-based E/M level calculation</li>
                        <li>• Automatic modifier assignment</li>
                        <li>• Revenue optimization alerts</li>
                        <li>• Compliance checking</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveConfiguration} 
          disabled={isLoading || !selectedSpecialty}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>Template Preview</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Visit Type</Label>
                  <p className="text-sm">{previewTemplate.visitType}</p>
                </div>
                <div>
                  <Label>Duration</Label>
                  <p className="text-sm">{previewTemplate.duration} minutes</p>
                </div>
                <div>
                  <Label>CPT Code</Label>
                  <p className="text-sm font-mono">{previewTemplate.cptCode}</p>
                </div>
                <div>
                  <Label>Charge</Label>
                  <p className="text-sm font-semibold">${previewTemplate.charge.toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Subjective</Label>
                  <p className="text-sm text-muted-foreground">{previewTemplate.soapStructure.subjective}</p>
                </div>
                <div>
                  <Label>Objective</Label>
                  <p className="text-sm text-muted-foreground">{previewTemplate.soapStructure.objective}</p>
                </div>
                <div>
                  <Label>Assessment</Label>
                  <p className="text-sm text-muted-foreground">{previewTemplate.soapStructure.assessment}</p>
                </div>
                <div>
                  <Label>Plan</Label>
                  <p className="text-sm text-muted-foreground">{previewTemplate.soapStructure.plan}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Customize template settings and SOAP structure</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editingTemplate.duration}
                    onChange={(e) => handleTemplateEdit(editingTemplate, 'duration', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-charge">Charge ($)</Label>
                  <Input
                    id="edit-charge"
                    type="number"
                    step="0.01"
                    value={editingTemplate.charge}
                    onChange={(e) => handleTemplateEdit(editingTemplate, 'charge', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-subjective">Subjective</Label>
                  <Textarea
                    id="edit-subjective"
                    value={editingTemplate.soapStructure.subjective}
                    onChange={(e) => handleTemplateEdit(editingTemplate, 'soapStructure', {
                      ...editingTemplate.soapStructure,
                      subjective: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-objective">Objective</Label>
                  <Textarea
                    id="edit-objective"
                    value={editingTemplate.soapStructure.objective}
                    onChange={(e) => handleTemplateEdit(editingTemplate, 'soapStructure', {
                      ...editingTemplate.soapStructure,
                      objective: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-assessment">Assessment</Label>
                  <Textarea
                    id="edit-assessment"
                    value={editingTemplate.soapStructure.assessment}
                    onChange={(e) => handleTemplateEdit(editingTemplate, 'soapStructure', {
                      ...editingTemplate.soapStructure,
                      assessment: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-plan">Plan</Label>
                  <Textarea
                    id="edit-plan"
                    value={editingTemplate.soapStructure.plan}
                    onChange={(e) => handleTemplateEdit(editingTemplate, 'soapStructure', {
                      ...editingTemplate.soapStructure,
                      plan: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={saveTemplateEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartSpecialtyManager;