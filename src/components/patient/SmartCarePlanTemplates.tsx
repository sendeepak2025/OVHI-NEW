import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CarePlanTemplate {
  id: string;
  name: string;
  condition: string;
  program: 'RPM' | 'CCM' | 'PCM';
  tasks: TemplateTask[];
  estimatedTime: number;
  billingCodes: string[];
  description: string;
}

interface TemplateTask {
  title: string;
  description: string;
  frequency: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimatedDuration: number;
  billingCode?: string;
}

interface SmartCarePlanTemplatesProps {
  patientConditions: string[];
  enrolledPrograms: string[];
  onApplyTemplate: (template: CarePlanTemplate) => void;
}

const SmartCarePlanTemplates: React.FC<SmartCarePlanTemplatesProps> = ({
  patientConditions,
  enrolledPrograms,
  onApplyTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CarePlanTemplate | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Pre-built templates for common conditions
  const templates: CarePlanTemplate[] = [
    {
      id: 'hypertension-rpm',
      name: 'Hypertension RPM Protocol',
      condition: 'Hypertension',
      program: 'RPM',
      description: 'Comprehensive remote monitoring for blood pressure management',
      estimatedTime: 25,
      billingCodes: ['99453', '99454', '99457', '99458'],
      tasks: [
        {
          title: 'Daily Blood Pressure Monitoring',
          description: 'Patient takes BP readings twice daily using connected device',
          frequency: 'Daily',
          priority: 'high',
          category: 'monitoring',
          estimatedDuration: 5,
          billingCode: '99454'
        },
        {
          title: 'Weekly Provider Review',
          description: 'Review blood pressure trends and adjust treatment',
          frequency: 'Weekly',
          priority: 'medium',
          category: 'care_coordination',
          estimatedDuration: 15,
          billingCode: '99457'
        },
        {
          title: 'Medication Adherence Check',
          description: 'Verify patient medication compliance and address barriers',
          frequency: 'Biweekly',
          priority: 'medium',
          category: 'medication_management',
          estimatedDuration: 10
        },
        {
          title: 'Alert Response Protocol',
          description: 'Respond to abnormal BP readings within 24 hours',
          frequency: 'As needed',
          priority: 'urgent',
          category: 'care_coordination',
          estimatedDuration: 20,
          billingCode: '99458'
        }
      ]
    },
    {
      id: 'diabetes-ccm',
      name: 'Diabetes CCM Care Plan',
      condition: 'Diabetes',
      program: 'CCM',
      description: 'Comprehensive chronic care management for diabetes patients',
      estimatedTime: 30,
      billingCodes: ['99490', '99491'],
      tasks: [
        {
          title: 'Monthly Care Coordination',
          description: 'Coordinate care between providers and specialists',
          frequency: 'Monthly',
          priority: 'high',
          category: 'care_coordination',
          estimatedDuration: 20,
          billingCode: '99490'
        },
        {
          title: 'Medication Review & Reconciliation',
          description: 'Review all medications for interactions and effectiveness',
          frequency: 'Monthly',
          priority: 'high',
          category: 'medication_management',
          estimatedDuration: 15
        },
        {
          title: 'HbA1c Monitoring',
          description: 'Track quarterly HbA1c levels and trends',
          frequency: 'Quarterly',
          priority: 'medium',
          category: 'laboratory',
          estimatedDuration: 10
        },
        {
          title: 'Diabetic Education Reinforcement',
          description: 'Provide ongoing education on diabetes self-management',
          frequency: 'Monthly',
          priority: 'medium',
          category: 'preventive_care',
          estimatedDuration: 15
        },
        {
          title: 'Care Plan Updates',
          description: 'Update comprehensive care plan based on progress',
          frequency: 'Quarterly',
          priority: 'medium',
          category: 'care_coordination',
          estimatedDuration: 25,
          billingCode: '99491'
        }
      ]
    },
    {
      id: 'heart-failure-pcm',
      name: 'Heart Failure PCM Protocol',
      condition: 'Heart Disease',
      program: 'PCM',
      description: 'Principal care management for heart failure patients',
      estimatedTime: 35,
      billingCodes: ['99424', '99425', '99426'],
      tasks: [
        {
          title: 'Intensive Monthly Assessment',
          description: 'Comprehensive assessment of heart failure status',
          frequency: 'Monthly',
          priority: 'high',
          category: 'care_coordination',
          estimatedDuration: 30,
          billingCode: '99424'
        },
        {
          title: 'Daily Weight Monitoring',
          description: 'Patient tracks daily weight for fluid retention',
          frequency: 'Daily',
          priority: 'high',
          category: 'monitoring',
          estimatedDuration: 5
        },
        {
          title: 'Medication Optimization',
          description: 'Optimize heart failure medications based on response',
          frequency: 'Monthly',
          priority: 'high',
          category: 'medication_management',
          estimatedDuration: 20,
          billingCode: '99425'
        },
        {
          title: 'Symptom Tracking',
          description: 'Monitor shortness of breath, fatigue, and other symptoms',
          frequency: 'Weekly',
          priority: 'medium',
          category: 'monitoring',
          estimatedDuration: 10
        },
        {
          title: 'Emergency Response Planning',
          description: 'Update emergency protocols and patient education',
          frequency: 'Quarterly',
          priority: 'medium',
          category: 'preventive_care',
          estimatedDuration: 15
        }
      ]
    }
  ];

  // Filter templates based on patient conditions and enrolled programs
  const getRelevantTemplates = () => {
    return templates.filter(template => {
      const hasCondition = patientConditions.some(condition => 
        template.condition.toLowerCase().includes(condition.toLowerCase()) ||
        condition.toLowerCase().includes(template.condition.toLowerCase())
      );
      const isEnrolledInProgram = enrolledPrograms.includes(template.program);
      return hasCondition || isEnrolledInProgram;
    });
  };

  const relevantTemplates = getRelevantTemplates();

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onApplyTemplate(selectedTemplate);
      setShowDialog(false);
      setSelectedTemplate(null);
      toast.success(`Applied ${selectedTemplate.name} template successfully`);
    }
  };

  const getProgramColor = (program: string) => {
    switch (program) {
      case 'RPM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CCM': return 'bg-green-100 text-green-800 border-green-200';
      case 'PCM': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Smart Care Plan Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {relevantTemplates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No relevant templates found for current conditions and programs.</p>
            <p className="text-sm mt-2">Templates will appear based on patient diagnoses and enrolled programs.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {relevantTemplates.map((template) => (
              <div 
                key={template.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowDialog(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      <Badge className={getProgramColor(template.program)}>
                        {template.program}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {template.estimatedTime} min/month
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {template.tasks.length} tasks
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {template.billingCodes.join(', ')}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply Care Plan Template</DialogTitle>
              <DialogDescription>
                Review the template details before applying to the patient's care plan.
              </DialogDescription>
            </DialogHeader>
            
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                  <Badge className={getProgramColor(selectedTemplate.program)}>
                    {selectedTemplate.program}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">{selectedTemplate.description}</p>
                
                <div className="grid grid-cols-3 gap-4 p-3 bg-accent/30 rounded-lg">
                  <div className="text-center">
                    <div className="font-semibold">{selectedTemplate.tasks.length}</div>
                    <div className="text-sm text-muted-foreground">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{selectedTemplate.estimatedTime} min</div>
                    <div className="text-sm text-muted-foreground">Monthly Time</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{selectedTemplate.billingCodes.length}</div>
                    <div className="text-sm text-muted-foreground">CPT Codes</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tasks to be added:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedTemplate.tasks.map((task, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{task.title}</span>
                          <Badge variant="outline" className={
                            task.priority === 'urgent' ? 'border-red-200 text-red-700' :
                            task.priority === 'high' ? 'border-orange-200 text-orange-700' :
                            task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                            'border-green-200 text-green-700'
                          }>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Frequency: {task.frequency}</span>
                          <span>Duration: {task.estimatedDuration}min</span>
                          {task.billingCode && <span>CPT: {task.billingCode}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyTemplate}>
                Apply Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SmartCarePlanTemplates;