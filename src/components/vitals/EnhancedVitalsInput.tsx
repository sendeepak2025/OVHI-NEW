import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Thermometer, Activity, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface VitalsData {
  height: number;
  weight: number;
  bmi: number;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  painScale?: number;
}

interface EnhancedVitalsInputProps {
  initialVitals?: Partial<VitalsData>;
  onVitalsChange: (vitals: VitalsData) => void;
  patientAge?: number;
  previousVitals?: VitalsData;
}

const VITAL_RANGES = {
  bloodPressure: {
    normal: ["120/80", "118/78", "122/82", "116/76"],
    elevated: ["130/85", "135/88", "128/84"],
    high: ["145/95", "150/98", "140/92"]
  },
  heartRate: {
    adult: { normal: [60, 100], low: 60, high: 100 },
    elderly: { normal: [60, 90], low: 60, high: 90 }
  },
  temperature: {
    normal: [98.6, 98.4, 98.8, 99.0],
    fever: [100.4, 101.2, 102.0],
    hypothermia: [95.0, 96.5]
  },
  respiratoryRate: {
    adult: { normal: [12, 20], low: 12, high: 20 }
  },
  oxygenSaturation: {
    normal: [98, 99, 100, 97],
    low: [92, 94, 95]
  }
};

const QUICK_VITALS_TEMPLATES = [
  {
    name: "Normal Adult",
    vitals: {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.6,
      oxygenSaturation: 98,
      respiratoryRate: 16,
      painScale: 0
    }
  },
  {
    name: "Hypertensive",
    vitals: {
      bloodPressure: "145/95",
      heartRate: 78,
      temperature: 98.6,
      oxygenSaturation: 98,
      respiratoryRate: 16,
      painScale: 0
    }
  },
  {
    name: "Post-Exercise",
    vitals: {
      bloodPressure: "135/85",
      heartRate: 95,
      temperature: 99.2,
      oxygenSaturation: 97,
      respiratoryRate: 20,
      painScale: 0
    }
  }
];

export const EnhancedVitalsInput: React.FC<EnhancedVitalsInputProps> = ({
  initialVitals = {},
  onVitalsChange,
  patientAge = 45,
  previousVitals
}) => {
  const [vitals, setVitals] = useState<VitalsData>({
    height: 0,
    weight: 0,
    bmi: 0,
    bloodPressure: "",
    heartRate: 0,
    temperature: 0,
    oxygenSaturation: 0,
    respiratoryRate: 0,
    painScale: 0,
    ...initialVitals
  });

  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (vitals.height > 0 && vitals.weight > 0) {
      const heightInches = vitals.height / 2.54;
      const bmi = (vitals.weight / (heightInches * heightInches)) * 703;
      const updatedVitals = { ...vitals, bmi: parseFloat(bmi.toFixed(1)) };
      setVitals(updatedVitals);
      onVitalsChange(updatedVitals);
    }
  }, [vitals.height, vitals.weight]);

  useEffect(() => {
    checkVitalAlerts();
  }, [vitals]);

  const checkVitalAlerts = () => {
    const newAlerts: string[] = [];
    
    // Blood pressure check
    if (vitals.bloodPressure) {
      const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
      if (systolic >= 140 || diastolic >= 90) {
        newAlerts.push("Blood pressure elevated - consider intervention");
      }
    }

    // Heart rate check
    if (vitals.heartRate > 100) {
      newAlerts.push("Tachycardia detected - heart rate > 100 bpm");
    } else if (vitals.heartRate < 60 && vitals.heartRate > 0) {
      newAlerts.push("Bradycardia detected - heart rate < 60 bpm");
    }

    // Temperature check
    if (vitals.temperature >= 100.4) {
      newAlerts.push("Fever detected - temperature ≥ 100.4°F");
    } else if (vitals.temperature <= 95.0 && vitals.temperature > 0) {
      newAlerts.push("Hypothermia risk - temperature ≤ 95°F");
    }

    // Oxygen saturation check
    if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) {
      newAlerts.push("Low oxygen saturation - consider supplemental oxygen");
    }

    setAlerts(newAlerts);
  };

  const updateVital = (field: keyof VitalsData, value: any) => {
    const updatedVitals = { ...vitals, [field]: value };
    setVitals(updatedVitals);
    onVitalsChange(updatedVitals);
  };

  const applyTemplate = (template: typeof QUICK_VITALS_TEMPLATES[0]) => {
    const updatedVitals = { ...vitals, ...template.vitals };
    setVitals(updatedVitals);
    onVitalsChange(updatedVitals);
  };

  const insertQuickValue = (field: keyof VitalsData, values: any[]) => {
    const randomValue = values[Math.floor(Math.random() * values.length)];
    updateVital(field, randomValue);
  };

  const getTrendIndicator = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getVitalStatus = (field: keyof VitalsData, value: any) => {
    switch (field) {
      case 'bloodPressure':
        if (!value) return 'default';
        const [systolic] = value.split('/').map(Number);
        if (systolic >= 140) return 'destructive';
        if (systolic >= 130) return 'outline';
        return 'secondary';
      
      case 'heartRate':
        if (value > 100 || (value < 60 && value > 0)) return 'destructive';
        return 'secondary';
      
      case 'temperature':
        if (value >= 100.4 || (value <= 95 && value > 0)) return 'destructive';
        return 'secondary';
      
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Enhanced Vitals Input
          </CardTitle>
          <div className="flex gap-2">
            {QUICK_VITALS_TEMPLATES.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template)}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {alerts.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {alerts.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Physical Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Physical Measurements</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  value={vitals.height || ''}
                  onChange={(e) => updateVital('height', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 170"
                />
              </div>
              
              <div>
                <Label>Weight (lbs)</Label>
                <Input
                  type="number"
                  value={vitals.weight || ''}
                  onChange={(e) => updateVital('weight', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 150"
                />
              </div>
            </div>

            <div>
              <Label>BMI</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={vitals.bmi || ''}
                  readOnly
                  className="bg-muted"
                />
                <Badge variant={vitals.bmi > 30 ? 'destructive' : vitals.bmi > 25 ? 'outline' : 'secondary'}>
                  {vitals.bmi > 30 ? 'Obese' : vitals.bmi > 25 ? 'Overweight' : 'Normal'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vital Signs</h3>

            <div>
              <Label className="flex items-center gap-2">
                Blood Pressure
                {getTrendIndicator(parseInt(vitals.bloodPressure?.split('/')[0] || '0'), 
                  previousVitals ? parseInt(previousVitals.bloodPressure?.split('/')[0] || '0') : undefined)}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={vitals.bloodPressure}
                  onChange={(e) => updateVital('bloodPressure', e.target.value)}
                  placeholder="120/80"
                />
                <Select onValueChange={(value) => updateVital('bloodPressure', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Quick" />
                  </SelectTrigger>
                  <SelectContent>
                    {VITAL_RANGES.bloodPressure.normal.map((bp, i) => (
                      <SelectItem key={i} value={bp}>Normal: {bp}</SelectItem>
                    ))}
                    {VITAL_RANGES.bloodPressure.elevated.map((bp, i) => (
                      <SelectItem key={i} value={bp}>Elevated: {bp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant={getVitalStatus('bloodPressure', vitals.bloodPressure)} className="mt-1">
                {vitals.bloodPressure || 'Not recorded'}
              </Badge>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Heart Rate (bpm)
                {getTrendIndicator(vitals.heartRate, previousVitals?.heartRate)}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={vitals.heartRate || ''}
                  onChange={(e) => updateVital('heartRate', parseInt(e.target.value) || 0)}
                  placeholder="72"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertQuickValue('heartRate', [72, 68, 76, 80])}
                >
                  Normal
                </Button>
              </div>
              <Badge variant={getVitalStatus('heartRate', vitals.heartRate)} className="mt-1">
                {vitals.heartRate ? `${vitals.heartRate} bpm` : 'Not recorded'}
              </Badge>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature (°F)
                {getTrendIndicator(vitals.temperature, previousVitals?.temperature)}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={vitals.temperature || ''}
                  onChange={(e) => updateVital('temperature', parseFloat(e.target.value) || 0)}
                  placeholder="98.6"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertQuickValue('temperature', VITAL_RANGES.temperature.normal)}
                >
                  Normal
                </Button>
              </div>
              <Badge variant={getVitalStatus('temperature', vitals.temperature)} className="mt-1">
                {vitals.temperature ? `${vitals.temperature}°F` : 'Not recorded'}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Additional Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Oxygen Saturation (%)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={vitals.oxygenSaturation || ''}
                onChange={(e) => updateVital('oxygenSaturation', parseInt(e.target.value) || 0)}
                placeholder="98"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertQuickValue('oxygenSaturation', VITAL_RANGES.oxygenSaturation.normal)}
              >
                Normal
              </Button>
            </div>
          </div>

          <div>
            <Label>Respiratory Rate</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={vitals.respiratoryRate || ''}
                onChange={(e) => updateVital('respiratoryRate', parseInt(e.target.value) || 0)}
                placeholder="16"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateVital('respiratoryRate', 16)}
              >
                Normal
              </Button>
            </div>
          </div>

          <div>
            <Label>Pain Scale (0-10)</Label>
            <Select onValueChange={(value) => updateVital('painScale', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select pain level" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} - {i === 0 ? 'No pain' : i <= 3 ? 'Mild' : i <= 6 ? 'Moderate' : 'Severe'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};