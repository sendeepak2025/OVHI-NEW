
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Thermometer, Weight, Ruler } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/utils/formatHelpers';

const PatientVitals: React.FC = () => {
  const { patients } = useData();
  const patient = patients[0]; // Demo patient

  if (!patient) {
    return <div>No patient data available</div>;
  }

  // Mock vital signs data
  const vitalSigns = [
    {
      date: '2025-03-02',
      bloodPressure: '135/85',
      heartRate: '72',
      temperature: '98.6',
      weight: patient.weight,
      height: patient.height,
      bmi: patient.bmi
    },
    {
      date: '2025-02-15',
      bloodPressure: '140/90',
      heartRate: '75',
      temperature: '98.4',
      weight: patient.weight + 2,
      height: patient.height,
      bmi: patient.bmi + 0.3
    }
  ];

  const getVitalStatus = (type: string, value: string | number) => {
    if (type === 'bloodPressure') {
      const [systolic] = value.toString().split('/').map(Number);
      if (systolic >= 140) return 'High';
      if (systolic >= 120) return 'Elevated';
      return 'Normal';
    }
    if (type === 'heartRate') {
      const rate = Number(value);
      if (rate > 100 || rate < 60) return 'Abnormal';
      return 'Normal';
    }
    return 'Normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Elevated': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Abnormal': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Vital Signs</h1>

      {/* Current Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitalSigns[0].bloodPressure}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                mmHg
              </p>
              <Badge className={getStatusColor(getVitalStatus('bloodPressure', vitalSigns[0].bloodPressure))}>
                {getVitalStatus('bloodPressure', vitalSigns[0].bloodPressure)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitalSigns[0].heartRate}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                bpm
              </p>
              <Badge className={getStatusColor(getVitalStatus('heartRate', vitalSigns[0].heartRate))}>
                {getVitalStatus('heartRate', vitalSigns[0].heartRate)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitalSigns[0].temperature}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                °F
              </p>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Normal
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.weight}</div>
            <p className="text-xs text-muted-foreground">
              lbs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Height</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.height}"</div>
            <p className="text-xs text-muted-foreground">
              inches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.bmi}</div>
            <p className="text-xs text-muted-foreground">
              kg/m²
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vitals History */}
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vitalSigns.map((vital, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold">{formatDate(vital.date)}</h4>
                  <Badge variant="outline">Recorded</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Blood Pressure</p>
                    <p className="font-medium">{vital.bloodPressure} mmHg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Heart Rate</p>
                    <p className="font-medium">{vital.heartRate} bpm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Temperature</p>
                    <p className="font-medium">{vital.temperature}°F</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-medium">{vital.weight} lbs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientVitals;
