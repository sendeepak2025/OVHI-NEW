import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Save, Eye, Settings, FileText, Stethoscope } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TemplateSection {
  id: string;
  title: string;
  content: string;
  prompts: string[];
  required: boolean;
  customizable: boolean;
  order: number;
}

interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  specialty: string;
  chiefComplaints: string[];
  visitTypes: string[];
  ageGroups: string[];
  sections: TemplateSection[];
  isActive: boolean;
  createdBy: string;
  tags: string[];
}

const DEFAULT_SECTIONS = [
  { id: 'cc', title: 'Chief Complaint', required: true },
  { id: 'hpi', title: 'History of Present Illness', required: true },
  { id: 'ros', title: 'Review of Systems', required: false },
  { id: 'pmh', title: 'Past Medical History', required: false },
  { id: 'medications', title: 'Current Medications', required: false },
  { id: 'allergies', title: 'Allergies', required: false },
  { id: 'social', title: 'Social History', required: false },
  { id: 'family', title: 'Family History', required: false },
  { id: 'physical', title: 'Physical Examination', required: true },
  { id: 'assessment', title: 'Assessment', required: true },
  { id: 'plan', title: 'Plan', required: true }
];

const SPECIALTIES = [
  'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Cardiology',
  'Neurology', 'Orthopedics', 'Dermatology', 'Psychiatry', 'Emergency Medicine',
  'Urgent Care', 'Endocrinology', 'Gastroenterology', 'Pulmonology'
];

const VISIT_TYPES = ['Routine', 'Follow-up', 'Urgent', 'Emergency', 'Consultation', 'Preventive'];
const AGE_GROUPS = ['Pediatric (0-17)', 'Adult (18-64)', 'Geriatric (65+)'];

export const CustomTemplateBuilder: React.FC = () => {
  const [template, setTemplate] = useState<CustomTemplate>({
    id: '',
    name: '',
    description: '',
    specialty: '',
    chiefComplaints: [],
    visitTypes: [],
    ageGroups: [],
    sections: [],
    isActive: true,
    createdBy: 'Current User',
    tags: []
  });

  const [activeSection, setActiveSection] = useState<string>('');
  const [newComplaint, setNewComplaint] = useState('');
  const [newTag, setNewTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const addSection = (sectionType: string) => {
    const defaultSection = DEFAULT_SECTIONS.find(s => s.id === sectionType);
    if (!defaultSection) return;

    const newSection: TemplateSection = {
      id: `${sectionType}-${Date.now()}`,
      title: defaultSection.title,
      content: '',
      prompts: [],
      required: defaultSection.required,
      customizable: true,
      order: template.sections.length
    };

    setTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSection(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const removeSection = (sectionId: string) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
    if (activeSection === sectionId) {
      setActiveSection('');
    }
  };

  const addPrompt = (sectionId: string, prompt: string) => {
    if (!prompt.trim()) return;
    
    updateSection(sectionId, {
      prompts: [...(template.sections.find(s => s.id === sectionId)?.prompts || []), prompt.trim()]
    });
  };

  const removePrompt = (sectionId: string, promptIndex: number) => {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      prompts: section.prompts.filter((_, index) => index !== promptIndex)
    });
  };

  const addChiefComplaint = () => {
    if (newComplaint.trim() && !template.chiefComplaints.includes(newComplaint.trim())) {
      setTemplate(prev => ({
        ...prev,
        chiefComplaints: [...prev.chiefComplaints, newComplaint.trim()]
      }));
      setNewComplaint('');
    }
  };

  const removeChiefComplaint = (complaint: string) => {
    setTemplate(prev => ({
      ...prev,
      chiefComplaints: prev.chiefComplaints.filter(c => c !== complaint)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !template.tags.includes(newTag.trim())) {
      setTemplate(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTemplate(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSaveTemplate = () => {
    if (!template.name || !template.specialty || template.sections.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in template name, specialty, and add at least one section.",
        variant: "destructive"
      });
      return;
    }

    // In real implementation, save to API
    console.log('Saving template:', template);
    
    toast({
      title: "Template Saved",
      description: "Your custom template has been saved successfully.",
    });
  };

  const activeTemplateSection = template.sections.find(s => s.id === activeSection);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Custom Template Builder</h2>
          <p className="text-muted-foreground">Create personalized encounter templates for your practice</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button onClick={handleSaveTemplate} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Template Preview: {template.name || 'Untitled Template'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.sections.map((section) => (
              <div key={section.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{section.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{section.content}</p>
                {section.prompts.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium">Prompts:</span>
                    {section.prompts.map((prompt, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground">• {prompt}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Configuration */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Template Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="targeting">Targeting</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={template.name}
                        onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Diabetes Follow-up"
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Primary Specialty</Label>
                      <Select
                        value={template.specialty}
                        onValueChange={(value) => setTemplate(prev => ({ ...prev, specialty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={template.description}
                      onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe when this template should be used..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Chief Complaints</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newComplaint}
                        onChange={(e) => setNewComplaint(e.target.value)}
                        placeholder="Add chief complaint"
                        onKeyPress={(e) => e.key === 'Enter' && addChiefComplaint()}
                      />
                      <Button onClick={addChiefComplaint} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.chiefComplaints.map((complaint) => (
                        <Badge key={complaint} variant="secondary" className="cursor-pointer">
                          {complaint}
                          <button
                            onClick={() => removeChiefComplaint(complaint)}
                            className="ml-1 text-xs hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-xs hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sections" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Template Sections</h4>
                    <Select onValueChange={addSection}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Add section" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_SECTIONS.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    {template.sections.map((section, index) => (
                      <div
                        key={section.id}
                        className={`border rounded-lg p-3 cursor-pointer hover:shadow-sm ${
                          activeSection === section.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{index + 1}.</span>
                            <span className="font-medium">{section.title}</span>
                            {section.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSection(section.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {section.content && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {section.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="targeting" className="space-y-4">
                  <div>
                    <Label>Visit Types</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {VISIT_TYPES.map((visitType) => (
                        <div key={visitType} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={visitType}
                            checked={template.visitTypes.includes(visitType)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTemplate(prev => ({
                                  ...prev,
                                  visitTypes: [...prev.visitTypes, visitType]
                                }));
                              } else {
                                setTemplate(prev => ({
                                  ...prev,
                                  visitTypes: prev.visitTypes.filter(vt => vt !== visitType)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={visitType} className="text-sm">{visitType}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Age Groups</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {AGE_GROUPS.map((ageGroup) => (
                        <div key={ageGroup} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={ageGroup}
                            checked={template.ageGroups.includes(ageGroup)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTemplate(prev => ({
                                  ...prev,
                                  ageGroups: [...prev.ageGroups, ageGroup]
                                }));
                              } else {
                                setTemplate(prev => ({
                                  ...prev,
                                  ageGroups: prev.ageGroups.filter(ag => ag !== ageGroup)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={ageGroup} className="text-sm">{ageGroup}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Active Template</Label>
                      <p className="text-sm text-muted-foreground">Make this template available for use</p>
                    </div>
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={(checked) => setTemplate(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Section Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Section Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTemplateSection ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sectionTitle">Section Title</Label>
                    <Input
                      id="sectionTitle"
                      value={activeTemplateSection.title}
                      onChange={(e) => updateSection(activeSection, { title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sectionContent">Content/Instructions</Label>
                    <Textarea
                      id="sectionContent"
                      value={activeTemplateSection.content}
                      onChange={(e) => updateSection(activeSection, { content: e.target.value })}
                      placeholder="Instructions for this section..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Documentation Prompts</Label>
                    <div className="space-y-2 mt-2">
                      {activeTemplateSection.prompts.map((prompt, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={prompt}
                            onChange={(e) => {
                              const newPrompts = [...activeTemplateSection.prompts];
                              newPrompts[index] = e.target.value;
                              updateSection(activeSection, { prompts: newPrompts });
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePrompt(activeSection, index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPrompt(activeSection, '')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Prompt
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Required Section</Label>
                      <Switch
                        checked={activeTemplateSection.required}
                        onCheckedChange={(checked) => updateSection(activeSection, { required: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Customizable</Label>
                      <Switch
                        checked={activeTemplateSection.customizable}
                        onCheckedChange={(checked) => updateSection(activeSection, { customizable: checked })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select a section to edit its content and prompts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};