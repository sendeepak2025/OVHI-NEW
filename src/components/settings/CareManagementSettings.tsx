import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save, Heart, Monitor, Calendar, ArrowRightLeft, Clock } from "lucide-react";

interface CareManagementConfig {
  ccm: {
    enabled: boolean;
    monthlyTimeRequirement: string;
    billingCpt: string;
    defaultTemplate: string;
    specialtySpecific: Record<string, any>;
  };
  rpm: {
    enabled: boolean;
    devices: string[];
    transmissionFrequency: string;
    billingCpt: string;
    monitoringParameters: string[];
  };
  pcm: {
    enabled: boolean;
    monthlyTimeRequirement: string;
    billingCpt: string;
    comprehensiveCareRequired: boolean;
  };
  tcm: {
    enabled: boolean;
    transitionTypes: string[];
    contactTimeframes: string[];
    billingCpts: string[];
  };
  awv: {
    enabled: boolean;
    assessmentType: string;
    preventiveServices: string[];
    riskAssessment: boolean;
  };
}

const CCM_TEMPLATES_BY_SPECIALTY = {
  'Primary Care': {
    commonConditions: ['Diabetes', 'Hypertension', 'Hyperlipidemia', 'COPD', 'CHF'],
    monthlyTasks: [
      'Medication reconciliation and adherence review',
      'Vital signs monitoring and trend analysis',
      'Care plan updates and goal setting',
      'Provider communication and coordination',
      'Patient education and self-management support'
    ],
    cptCodes: ['99490', '99491', '99487', '99489']
  },
  'Cardiology': {
    commonConditions: ['CHF', 'CAD', 'Arrhythmias', 'Hypertension', 'Cardiomyopathy'],
    monthlyTasks: [
      'Cardiac medication optimization',
      'Heart failure symptoms monitoring',
      'Exercise tolerance assessment',
      'Dietary sodium and fluid management',
      'Cardiology follow-up coordination'
    ],
    cptCodes: ['99490', '99491', '99487', '99489']
  },
  'Mental Health': {
    commonConditions: ['Depression', 'Anxiety', 'Bipolar Disorder', 'PTSD', 'Substance Use'],
    monthlyTasks: [
      'Mental health screening and assessment',
      'Medication adherence and side effect monitoring',
      'Crisis intervention planning',
      'Therapy coordination and referrals',
      'Social support system evaluation'
    ],
    cptCodes: ['99484', '99492', '99493', '99494']
  },
  'Neurology': {
    commonConditions: ['Epilepsy', 'Parkinsons', 'Multiple Sclerosis', 'Stroke', 'Dementia'],
    monthlyTasks: [
      'Neurological medication management',
      'Seizure or symptom tracking',
      'Cognitive function assessment',
      'Mobility and safety evaluation',
      'Specialist coordination and follow-up'
    ],
    cptCodes: ['99490', '99491', '99487', '99489']
  }
};

const RPM_PARAMETERS_BY_SPECIALTY = {
  'Primary Care': ['Blood Pressure', 'Weight', 'Blood Glucose', 'Oxygen Saturation', 'Heart Rate'],
  'Cardiology': ['Blood Pressure', 'Weight', 'Heart Rate', 'Heart Rhythm', 'Exercise Tolerance'],
  'Mental Health': ['Mood Tracking', 'Sleep Quality', 'Medication Adherence', 'Activity Level'],
  'Neurology': ['Seizure Activity', 'Medication Levels', 'Cognitive Function', 'Mobility'],
  'Urgent Care': ['Vital Signs', 'Symptom Tracking', 'Recovery Progress']
};

const CareManagementSettings: React.FC = () => {
  const [config, setConfig] = useState<CareManagementConfig>({
    ccm: {
      enabled: false,
      monthlyTimeRequirement: '20 minutes',
      billingCpt: '99490',
      defaultTemplate: 'Primary Care',
      specialtySpecific: {}
    },
    rpm: {
      enabled: false,
      devices: [],
      transmissionFrequency: 'Daily',
      billingCpt: '99457',
      monitoringParameters: []
    },
    pcm: {
      enabled: false,
      monthlyTimeRequirement: '30 minutes',
      billingCpt: '99424',
      comprehensiveCareRequired: true
    },
    tcm: {
      enabled: false,
      transitionTypes: [],
      contactTimeframes: [],
      billingCpts: []
    },
    awv: {
      enabled: false,
      assessmentType: 'Initial',
      preventiveServices: [],
      riskAssessment: true
    }
  });

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Primary Care');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigChange = (section: keyof CareManagementConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayToggle = (section: keyof CareManagementConfig, field: string, item: string) => {
    setConfig(prev => {
      const currentArray = (prev[section] as any)[field] || [];
      const updatedArray = currentArray.includes(item)
        ? currentArray.filter((i: string) => i !== item)
        : [...currentArray, item];
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updatedArray
        }
      };
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Care management settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save care management settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Care Management Configuration</h2>
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Specialty Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Specialty Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Configure care management for specialty</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CCM_TEMPLATES_BY_SPECIALTY).map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CCM Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Chronic Care Management (CCM)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ccm-enabled"
              checked={config.ccm.enabled}
              onCheckedChange={(checked) => handleConfigChange('ccm', 'enabled', checked)}
            />
            <Label htmlFor="ccm-enabled">Enable CCM Services</Label>
          </div>

          {config.ccm.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Time Requirement</Label>
                  <Select 
                    value={config.ccm.monthlyTimeRequirement}
                    onValueChange={(value) => handleConfigChange('ccm', 'monthlyTimeRequirement', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20 minutes">20 minutes (99490)</SelectItem>
                      <SelectItem value="40 minutes">40 minutes (99491)</SelectItem>
                      <SelectItem value="60 minutes">60 minutes (99487)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Billing Code</Label>
                  <Input value={config.ccm.billingCpt} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Common Conditions for {selectedSpecialty}</Label>
                <div className="flex flex-wrap gap-2">
                  {CCM_TEMPLATES_BY_SPECIALTY[selectedSpecialty as keyof typeof CCM_TEMPLATES_BY_SPECIALTY]?.commonConditions.map((condition) => (
                    <Badge key={condition} variant="secondary">{condition}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Monthly Care Tasks</Label>
                <div className="space-y-2">
                  {CCM_TEMPLATES_BY_SPECIALTY[selectedSpecialty as keyof typeof CCM_TEMPLATES_BY_SPECIALTY]?.monthlyTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RPM Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Remote Patient Monitoring (RPM)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rpm-enabled"
              checked={config.rpm.enabled}
              onCheckedChange={(checked) => handleConfigChange('rpm', 'enabled', checked)}
            />
            <Label htmlFor="rpm-enabled">Enable RPM Services</Label>
          </div>

          {config.rpm.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Transmission Frequency</Label>
                  <Select 
                    value={config.rpm.transmissionFrequency}
                    onValueChange={(value) => handleConfigChange('rpm', 'transmissionFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="As Needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Billing Code</Label>
                  <Input value={config.rpm.billingCpt} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Monitoring Parameters for {selectedSpecialty}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {RPM_PARAMETERS_BY_SPECIALTY[selectedSpecialty as keyof typeof RPM_PARAMETERS_BY_SPECIALTY]?.map((parameter) => (
                    <div key={parameter} className="flex items-center space-x-2">
                      <Checkbox
                        id={parameter}
                        checked={config.rpm.monitoringParameters.includes(parameter)}
                        onCheckedChange={() => handleArrayToggle('rpm', 'monitoringParameters', parameter)}
                      />
                      <Label htmlFor={parameter} className="text-sm">{parameter}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PCM Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Principal Care Management (PCM)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pcm-enabled"
              checked={config.pcm.enabled}
              onCheckedChange={(checked) => handleConfigChange('pcm', 'enabled', checked)}
            />
            <Label htmlFor="pcm-enabled">Enable PCM Services</Label>
          </div>

          {config.pcm.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Time Requirement</Label>
                  <Select 
                    value={config.pcm.monthlyTimeRequirement}
                    onValueChange={(value) => handleConfigChange('pcm', 'monthlyTimeRequirement', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 minutes">30 minutes (99424)</SelectItem>
                      <SelectItem value="60 minutes">60 minutes (99425)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Billing Code</Label>
                  <Input value={config.pcm.billingCpt} disabled />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comprehensive-care"
                  checked={config.pcm.comprehensiveCareRequired}
                  onCheckedChange={(checked) => handleConfigChange('pcm', 'comprehensiveCareRequired', checked)}
                />
                <Label htmlFor="comprehensive-care">Require comprehensive care plan</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TCM Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transitional Care Management (TCM)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tcm-enabled"
              checked={config.tcm.enabled}
              onCheckedChange={(checked) => handleConfigChange('tcm', 'enabled', checked)}
            />
            <Label htmlFor="tcm-enabled">Enable TCM Services</Label>
          </div>

          {config.tcm.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>Transition Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Hospital Discharge', 'SNF Discharge', 'Emergency Department', 'Observation Stay'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={config.tcm.transitionTypes.includes(type)}
                        onCheckedChange={() => handleArrayToggle('tcm', 'transitionTypes', type)}
                      />
                      <Label htmlFor={type} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contact Timeframes</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['2 business days (99495)', '14 days (99496)'].map((timeframe) => (
                    <div key={timeframe} className="flex items-center space-x-2">
                      <Checkbox
                        id={timeframe}
                        checked={config.tcm.contactTimeframes.includes(timeframe)}
                        onCheckedChange={() => handleArrayToggle('tcm', 'contactTimeframes', timeframe)}
                      />
                      <Label htmlFor={timeframe} className="text-sm">{timeframe}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AWV Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Annual Wellness Visit (AWV)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="awv-enabled"
              checked={config.awv.enabled}
              onCheckedChange={(checked) => handleConfigChange('awv', 'enabled', checked)}
            />
            <Label htmlFor="awv-enabled">Enable AWV Services</Label>
          </div>

          {config.awv.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>Assessment Type</Label>
                <Select 
                  value={config.awv.assessmentType}
                  onValueChange={(value) => handleConfigChange('awv', 'assessmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial">Initial AWV (G0438)</SelectItem>
                    <SelectItem value="Subsequent">Subsequent AWV (G0439)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preventive Services</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Mammography', 'Colonoscopy', 'Bone Density', 'Cardiovascular Screening'].map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={config.awv.preventiveServices.includes(service)}
                        onCheckedChange={() => handleArrayToggle('awv', 'preventiveServices', service)}
                      />
                      <Label htmlFor={service} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="risk-assessment"
                  checked={config.awv.riskAssessment}
                  onCheckedChange={(checked) => handleConfigChange('awv', 'riskAssessment', checked)}
                />
                <Label htmlFor="risk-assessment">Include health risk assessment</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CareManagementSettings;