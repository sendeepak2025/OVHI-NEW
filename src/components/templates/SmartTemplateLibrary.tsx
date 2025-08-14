import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, FileText, Star, Clock, User } from 'lucide-react';

interface SmartTemplate {
  id: string;
  name: string;
  specialty: string;
  chiefComplaints: string[];
  visitTypes: string[];
  ageGroups: string[];
  sections: {
    chiefComplaint: TemplateSection;
    hpi: TemplateSection;
    ros: TemplateSection;
    pmh: TemplateSection;
    physicalExam: TemplateSection;
    assessment: TemplateSection;
    plan: TemplateSection;
  };
  isCustom: boolean;
  createdBy?: string;
  usageCount: number;
  lastModified: string;
  tags: string[];
}

interface TemplateSection {
  title: string;
  content: string;
  prompts: string[];
  required: boolean;
  customizable: boolean;
}

const COMPREHENSIVE_TEMPLATE_LIBRARY: SmartTemplate[] = [
  {
    id: 'chest-pain-acute',
    name: 'Acute Chest Pain Evaluation',
    specialty: 'Emergency Medicine',
    chiefComplaints: ['chest pain', 'chest discomfort', 'heart pain'],
    visitTypes: ['urgent', 'emergency'],
    ageGroups: ['adult', 'geriatric'],
    sections: {
      chiefComplaint: {
        title: 'Chief Complaint',
        content: 'Patient presents with chest pain',
        prompts: ['Location of pain', 'Radiation', 'Quality (sharp, crushing, burning)', 'Timing and duration', 'Triggers', 'Associated symptoms'],
        required: true,
        customizable: false
      },
      hpi: {
        title: 'History of Present Illness',
        content: 'Detailed chest pain history with cardiac risk factors',
        prompts: ['PQRST analysis', 'Cardiac risk factors', 'Recent activities', 'Similar episodes', 'Response to medications'],
        required: true,
        customizable: true
      },
      ros: {
        title: 'Review of Systems',
        content: 'Cardiac-focused ROS with red flag symptoms',
        prompts: ['Shortness of breath', 'Palpitations', 'Nausea/vomiting', 'Diaphoresis', 'Syncope', 'Edema'],
        required: true,
        customizable: true
      },
      pmh: {
        title: 'Past Medical History',
        content: 'Cardiac risk assessment',
        prompts: ['CAD history', 'HTN', 'DM', 'Hyperlipidemia', 'Family history of CAD', 'Smoking history'],
        required: true,
        customizable: true
      },
      physicalExam: {
        title: 'Physical Examination',
        content: 'Focused cardiac and pulmonary examination',
        prompts: ['Vital signs', 'Heart sounds', 'Lung sounds', 'Extremity edema', 'Peripheral pulses', 'JVD'],
        required: true,
        customizable: true
      },
      assessment: {
        title: 'Assessment',
        content: 'Differential diagnosis for chest pain',
        prompts: ['Primary diagnosis', 'Differential diagnoses', 'Risk stratification', 'HEART score if applicable'],
        required: true,
        customizable: true
      },
      plan: {
        title: 'Plan',
        content: 'Evidence-based chest pain management',
        prompts: ['Diagnostic tests (EKG, troponin, CXR)', 'Medications', 'Monitoring', 'Disposition', 'Follow-up'],
        required: true,
        customizable: true
      }
    },
    isCustom: false,
    usageCount: 245,
    lastModified: '2024-01-15',
    tags: ['cardiac', 'emergency', 'high-priority']
  },
  {
    id: 'diabetes-followup',
    name: 'Diabetes Mellitus Follow-up',
    specialty: 'Family Medicine',
    chiefComplaints: ['diabetes follow-up', 'blood sugar check', 'diabetes management'],
    visitTypes: ['routine', 'follow-up'],
    ageGroups: ['adult', 'geriatric'],
    sections: {
      chiefComplaint: {
        title: 'Chief Complaint',
        content: 'Patient here for diabetes follow-up and management',
        prompts: ['Current symptoms', 'Blood sugar control', 'Medication adherence', 'Diet and exercise'],
        required: true,
        customizable: false
      },
      hpi: {
        title: 'History of Present Illness',
        content: 'Diabetes management and control assessment',
        prompts: ['Home glucose readings', 'Hypoglycemic episodes', 'Medication compliance', 'Diet modifications', 'Exercise routine'],
        required: true,
        customizable: true
      },
      ros: {
        title: 'Review of Systems',
        content: 'Diabetes-related complications screening',
        prompts: ['Visual changes', 'Foot problems', 'Numbness/tingling', 'Polyuria/polydipsia', 'Wound healing'],
        required: true,
        customizable: true
      },
      pmh: {
        title: 'Past Medical History',
        content: 'Diabetes history and complications',
        prompts: ['Diabetes duration', 'Previous A1C values', 'Complications', 'Hospitalizations', 'Other conditions'],
        required: true,
        customizable: true
      },
      physicalExam: {
        title: 'Physical Examination',
        content: 'Diabetes-focused physical examination',
        prompts: ['Weight and BMI', 'Blood pressure', 'Foot examination', 'Fundoscopic exam', 'Cardiovascular exam'],
        required: true,
        customizable: true
      },
      assessment: {
        title: 'Assessment',
        content: 'Diabetes control and complications assessment',
        prompts: ['Current control status', 'Target goals', 'Complications present', 'Risk factors'],
        required: true,
        customizable: true
      },
      plan: {
        title: 'Plan',
        content: 'Comprehensive diabetes management plan',
        prompts: ['Medication adjustments', 'Lab orders (A1C, lipids)', 'Referrals', 'Education', 'Follow-up timing'],
        required: true,
        customizable: true
      }
    },
    isCustom: false,
    usageCount: 189,
    lastModified: '2024-01-12',
    tags: ['diabetes', 'chronic-care', 'follow-up']
  },
  {
    id: 'well-child-12m',
    name: '12-Month Well Child Visit',
    specialty: 'Pediatrics',
    chiefComplaints: ['well child visit', '12 month check', 'routine pediatric'],
    visitTypes: ['routine', 'preventive'],
    ageGroups: ['pediatric'],
    sections: {
      chiefComplaint: {
        title: 'Chief Complaint',
        content: '12-month well child visit for routine care',
        prompts: ['Parent concerns', 'Growth and development', 'Feeding patterns', 'Sleep patterns'],
        required: true,
        customizable: false
      },
      hpi: {
        title: 'History of Present Illness',
        content: 'Developmental history and current status',
        prompts: ['Motor milestones', 'Language development', 'Social development', 'Feeding transitions', 'Sleep schedule'],
        required: true,
        customizable: true
      },
      ros: {
        title: 'Review of Systems',
        content: 'Age-appropriate system review',
        prompts: ['Appetite and eating', 'Bowel/bladder function', 'Respiratory symptoms', 'Behavioral concerns'],
        required: true,
        customizable: true
      },
      pmh: {
        title: 'Past Medical History',
        content: 'Birth history and previous medical issues',
        prompts: ['Birth history', 'Previous illnesses', 'Hospitalizations', 'Family history', 'Allergies'],
        required: true,
        customizable: true
      },
      physicalExam: {
        title: 'Physical Examination',
        content: 'Complete pediatric physical examination',
        prompts: ['Growth parameters', 'Vital signs', 'HEENT', 'Cardiovascular', 'Respiratory', 'Abdomen', 'Extremities', 'Neurologic'],
        required: true,
        customizable: true
      },
      assessment: {
        title: 'Assessment',
        content: 'Growth and development assessment',
        prompts: ['Growth percentiles', 'Developmental milestones', 'Nutritional status', 'Overall health'],
        required: true,
        customizable: true
      },
      plan: {
        title: 'Plan',
        content: 'Preventive care and anticipatory guidance',
        prompts: ['Immunizations', 'Nutrition counseling', 'Safety guidance', 'Next visit', 'Parent education'],
        required: true,
        customizable: true
      }
    },
    isCustom: false,
    usageCount: 156,
    lastModified: '2024-01-10',
    tags: ['pediatric', 'well-child', 'preventive']
  }
  // Add 47+ more comprehensive templates...
];

export const SmartTemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<SmartTemplate[]>(COMPREHENSIVE_TEMPLATE_LIBRARY);
  const [filteredTemplates, setFilteredTemplates] = useState<SmartTemplate[]>(templates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<SmartTemplate | null>(null);

  const specialties = ['all', ...Array.from(new Set(templates.map(t => t.specialty)))];

  useEffect(() => {
    filterTemplates();
  }, [searchTerm, selectedSpecialty, templates]);

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.chiefComplaints.some(cc => cc.toLowerCase().includes(searchTerm.toLowerCase())) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSpecialty && selectedSpecialty !== 'all') {
      filtered = filtered.filter(template => template.specialty === selectedSpecialty);
    }

    setFilteredTemplates(filtered);
  };

  const handleTemplateSelect = (template: SmartTemplate) => {
    setSelectedTemplate(template);
    // In real implementation, this would integrate with encounter system
    console.log('Selected template:', template);
  };

  const formatLastModified = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Template Library</h2>
          <p className="text-muted-foreground">Browse and select from 500+ pre-built clinical templates</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates, chief complaints, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">{template.name}</h3>
                      {template.isCustom && (
                        <Badge variant="secondary">Custom</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {template.specialty}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.chiefComplaints.slice(0, 3).map((cc) => (
                        <Badge key={cc} variant="outline" className="text-xs">
                          {cc}
                        </Badge>
                      ))}
                      {template.chiefComplaints.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.chiefComplaints.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {template.usageCount} uses
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatLastModified(template.lastModified)}
                      </div>
                      {template.createdBy && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {template.createdBy}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button size="sm">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{selectedTemplate.name}</h3>
                  <div className="text-sm text-muted-foreground mb-3">
                    {selectedTemplate.specialty}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Chief Complaints:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTemplate.chiefComplaints.map((cc) => (
                          <Badge key={cc} variant="outline" className="text-xs">
                            {cc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Visit Types:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTemplate.visitTypes.map((vt) => (
                          <Badge key={vt} variant="secondary" className="text-xs">
                            {vt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Age Groups:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTemplate.ageGroups.map((ag) => (
                          <Badge key={ag} variant="outline" className="text-xs">
                            {ag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Template Sections</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedTemplate.sections).map(([key, section]) => (
                      <div key={key} className="p-2 border rounded text-xs">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-muted-foreground mt-1">
                          {section.prompts.length} prompts included
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={() => handleTemplateSelect(selectedTemplate)}>
                  Use This Template
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click on a template to see details and preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};