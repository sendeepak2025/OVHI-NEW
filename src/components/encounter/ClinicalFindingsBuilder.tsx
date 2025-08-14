import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  Wind, 
  Eye, 
  Ear, 
  Brain, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Camera,
  Thermometer,
  Gauge
} from "lucide-react";
import { toast } from "sonner";

interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number; timestamp: Date };
  heartRate: { value: number; rhythm: string; timestamp: Date };
  temperature: { value: number; method: string; timestamp: Date };
  respiratoryRate: { value: number; quality: string; timestamp: Date };
  oxygenSaturation: { value: number; onRoom: boolean; timestamp: Date };
  pain: { score: number; location: string; quality: string; timestamp: Date };
}

interface PhysicalExamFinding {
  system: string;
  finding: string;
  status: 'normal' | 'abnormal' | 'not-examined';
  details?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  images?: string[];
}

interface ClinicalFindingsBuilderProps {
  initialFindings?: PhysicalExamFinding[];
  vitals?: Partial<VitalSigns>;
  onFindingsUpdate: (findings: PhysicalExamFinding[]) => void;
  onVitalsUpdate: (vitals: Partial<VitalSigns>) => void;
  patientAge?: number;
  patientGender?: string;
}

const BODY_SYSTEMS = [
  { id: 'general', name: 'General Appearance', icon: Activity },
  { id: 'heent', name: 'HEENT', icon: Eye },
  { id: 'cardiovascular', name: 'Cardiovascular', icon: Heart },
  { id: 'respiratory', name: 'Respiratory', icon: Wind },
  { id: 'abdominal', name: 'Abdominal', icon: Activity },
  { id: 'musculoskeletal', name: 'Musculoskeletal', icon: Activity },
  { id: 'neurological', name: 'Neurological', icon: Brain },
  { id: 'psychiatric', name: 'Psychiatric', icon: Brain },
  { id: 'skin', name: 'Skin', icon: Activity }
];

const SYSTEM_FINDINGS = {
  general: [
    'Well-appearing', 'Ill-appearing', 'Alert and oriented', 'In no acute distress',
    'Diaphoretic', 'Pale', 'Flushed', 'Cachectic', 'Obese'
  ],
  cardiovascular: [
    'Regular rate and rhythm', 'Irregular rhythm', 'Tachycardia', 'Bradycardia',
    'Murmur present', 'S3 gallop', 'S4 gallop', 'Peripheral edema', 'No murmurs'
  ],
  respiratory: [
    'Clear to auscultation bilaterally', 'Wheezes', 'Crackles', 'Rhonchi',
    'Diminished breath sounds', 'Tachypnea', 'Use of accessory muscles'
  ],
  neurological: [
    'Alert and oriented x3', 'Cranial nerves intact', 'Motor strength 5/5',
    'Reflexes 2+ and symmetric', 'Sensation intact', 'Gait steady'
  ]
};

const VITAL_RANGES = {
  bloodPressure: {
    normal: { systolic: [90, 120], diastolic: [60, 80] },
    elevated: { systolic: [120, 129], diastolic: [60, 80] },
    high: { systolic: [130, 180], diastolic: [80, 120] }
  },
  heartRate: {
    normal: [60, 100],
    tachycardia: [100, 150],
    bradycardia: [40, 60]
  },
  temperature: {
    normal: [97.0, 99.5],
    fever: [99.5, 104.0],
    hypothermia: [90.0, 97.0]
  }
};

export const ClinicalFindingsBuilder: React.FC<ClinicalFindingsBuilderProps> = ({
  initialFindings = [],
  vitals = {},
  onFindingsUpdate,
  onVitalsUpdate,
  patientAge = 0,
  patientGender = ''
}) => {
  const [findings, setFindings] = useState<PhysicalExamFinding[]>(initialFindings);
  const [selectedSystem, setSelectedSystem] = useState('general');
  const [customFinding, setCustomFinding] = useState('');
  const [vitalSigns, setVitalSigns] = useState<Partial<VitalSigns>>(vitals);

  const getVitalStatus = useCallback((vital: string, value: number) => {
    switch (vital) {
      case 'systolic':
        if (value >= 180) return { status: 'critical', color: 'destructive' };
        if (value >= 130) return { status: 'high', color: 'destructive' };
        if (value >= 120) return { status: 'elevated', color: 'warning' };
        return { status: 'normal', color: 'success' };
      case 'heartRate':
        if (value > 150 || value < 40) return { status: 'critical', color: 'destructive' };
        if (value > 100 || value < 60) return { status: 'abnormal', color: 'warning' };
        return { status: 'normal', color: 'success' };
      default:
        return { status: 'normal', color: 'success' };
    }
  }, []);

  const addFinding = useCallback((system: string, finding: string, status: 'normal' | 'abnormal') => {
    const newFinding: PhysicalExamFinding = {
      system,
      finding,
      status,
      details: '',
    };
    
    const updatedFindings = [...findings.filter(f => f.finding !== finding), newFinding];
    setFindings(updatedFindings);
    onFindingsUpdate(updatedFindings);
  }, [findings, onFindingsUpdate]);

  const removeFinding = useCallback((finding: string) => {
    const updatedFindings = findings.filter(f => f.finding !== finding);
    setFindings(updatedFindings);
    onFindingsUpdate(updatedFindings);
  }, [findings, onFindingsUpdate]);

  const addCustomFinding = useCallback(() => {
    if (customFinding.trim()) {
      addFinding(selectedSystem, customFinding.trim(), 'abnormal');
      setCustomFinding('');
    }
  }, [customFinding, selectedSystem, addFinding]);

  const updateVital = useCallback((vitalType: string, value: any) => {
    const updatedVitals = {
      ...vitalSigns,
      [vitalType]: { ...value, timestamp: new Date() }
    };
    setVitalSigns(updatedVitals);
    onVitalsUpdate(updatedVitals);
  }, [vitalSigns, onVitalsUpdate]);

  const generateSystemSummary = useCallback((systemId: string) => {
    const systemFindings = findings.filter(f => f.system === systemId);
    const abnormalFindings = systemFindings.filter(f => f.status === 'abnormal');
    
    if (abnormalFindings.length === 0) {
      return `${BODY_SYSTEMS.find(s => s.id === systemId)?.name}: Normal examination`;
    }
    
    return `${BODY_SYSTEMS.find(s => s.id === systemId)?.name}: ${abnormalFindings.map(f => f.finding).join(', ')}`;
  }, [findings]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Clinical Findings Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vitals" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
              <TabsTrigger value="physical">Physical Exam</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="vitals" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Blood Pressure */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium">Blood Pressure</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Systolic"
                      type="number"
                      value={vitalSigns.bloodPressure?.systolic || ''}
                      onChange={(e) => updateVital('bloodPressure', {
                        systolic: parseInt(e.target.value) || 0,
                        diastolic: vitalSigns.bloodPressure?.diastolic || 0
                      })}
                    />
                    <Input
                      placeholder="Diastolic"
                      type="number"
                      value={vitalSigns.bloodPressure?.diastolic || ''}
                      onChange={(e) => updateVital('bloodPressure', {
                        systolic: vitalSigns.bloodPressure?.systolic || 0,
                        diastolic: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  {vitalSigns.bloodPressure && (
                    <Badge variant={getVitalStatus('systolic', vitalSigns.bloodPressure.systolic).color as any}>
                      {vitalSigns.bloodPressure.systolic}/{vitalSigns.bloodPressure.diastolic} mmHg
                    </Badge>
                  )}
                </Card>

                {/* Heart Rate */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium">Heart Rate</h4>
                  </div>
                  <Input
                    placeholder="BPM"
                    type="number"
                    value={vitalSigns.heartRate?.value || ''}
                    onChange={(e) => updateVital('heartRate', {
                      value: parseInt(e.target.value) || 0,
                      rhythm: 'regular'
                    })}
                    className="mb-2"
                  />
                  <Select
                    value={vitalSigns.heartRate?.rhythm || 'regular'}
                    onValueChange={(value) => updateVital('heartRate', {
                      value: vitalSigns.heartRate?.value || 0,
                      rhythm: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                      <SelectItem value="tachycardia">Tachycardia</SelectItem>
                      <SelectItem value="bradycardia">Bradycardia</SelectItem>
                    </SelectContent>
                  </Select>
                  {vitalSigns.heartRate && (
                    <Badge variant={getVitalStatus('heartRate', vitalSigns.heartRate.value).color as any} className="mt-2">
                      {vitalSigns.heartRate.value} BPM
                    </Badge>
                  )}
                </Card>

                {/* Temperature */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">Temperature</h4>
                  </div>
                  <Input
                    placeholder="°F"
                    type="number"
                    step="0.1"
                    value={vitalSigns.temperature?.value || ''}
                    onChange={(e) => updateVital('temperature', {
                      value: parseFloat(e.target.value) || 0,
                      method: 'oral'
                    })}
                    className="mb-2"
                  />
                  <Select
                    value={vitalSigns.temperature?.method || 'oral'}
                    onValueChange={(value) => updateVital('temperature', {
                      value: vitalSigns.temperature?.value || 0,
                      method: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="rectal">Rectal</SelectItem>
                      <SelectItem value="axillary">Axillary</SelectItem>
                      <SelectItem value="temporal">Temporal</SelectItem>
                    </SelectContent>
                  </Select>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="physical" className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* System Selection */}
                <div className="lg:w-1/3">
                  <h4 className="font-medium mb-3">Body Systems</h4>
                  <div className="space-y-2">
                    {BODY_SYSTEMS.map((system) => {
                      const systemFindings = findings.filter(f => f.system === system.id);
                      const hasAbnormal = systemFindings.some(f => f.status === 'abnormal');
                      const Icon = system.icon;
                      
                      return (
                        <Button
                          key={system.id}
                          variant={selectedSystem === system.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedSystem(system.id)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {system.name}
                          {hasAbnormal && (
                            <AlertCircle className="h-3 w-3 ml-auto text-destructive" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Findings for Selected System */}
                <div className="lg:w-2/3">
                  <h4 className="font-medium mb-3">
                    {BODY_SYSTEMS.find(s => s.id === selectedSystem)?.name} Examination
                  </h4>
                  
                  {/* Quick Findings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {SYSTEM_FINDINGS[selectedSystem]?.map((finding) => {
                      const isSelected = findings.some(f => f.finding === finding);
                      return (
                        <Button
                          key={finding}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => 
                            isSelected 
                              ? removeFinding(finding)
                              : addFinding(selectedSystem, finding, 'normal')
                          }
                        >
                          {finding}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Custom Finding */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add custom finding..."
                      value={customFinding}
                      onChange={(e) => setCustomFinding(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomFinding()}
                    />
                    <Button onClick={addCustomFinding}>Add</Button>
                  </div>

                  {/* Selected Findings for This System */}
                  <div className="space-y-2">
                    {findings
                      .filter(f => f.system === selectedSystem)
                      .map((finding, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            {finding.status === 'normal' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>{finding.finding}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFinding(finding.finding)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Physical Examination Summary</h4>
                <div className="space-y-2">
                  {BODY_SYSTEMS.map((system) => (
                    <div key={system.id} className="p-3 border rounded">
                      <p className="text-sm">{generateSystemSummary(system.id)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Vital Signs Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vitalSigns.bloodPressure && (
                    <div className="flex justify-between">
                      <span>Blood Pressure:</span>
                      <Badge variant="outline">
                        {vitalSigns.bloodPressure.systolic}/{vitalSigns.bloodPressure.diastolic} mmHg
                      </Badge>
                    </div>
                  )}
                  {vitalSigns.heartRate && (
                    <div className="flex justify-between">
                      <span>Heart Rate:</span>
                      <Badge variant="outline">
                        {vitalSigns.heartRate.value} BPM ({vitalSigns.heartRate.rhythm})
                      </Badge>
                    </div>
                  )}
                  {vitalSigns.temperature && (
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <Badge variant="outline">
                        {vitalSigns.temperature.value}°F ({vitalSigns.temperature.method})
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalFindingsBuilder;