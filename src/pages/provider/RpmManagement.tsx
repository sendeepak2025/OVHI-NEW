
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  Plus,
  Smartphone,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Heart,
  Thermometer,
  Scale,
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";
import { rpmService, RPMDevice, RPMMonitoringPlan } from "@/services/rpmService";
import RPMDashboard from "@/components/rpm/RPMDashboard";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  diagnosis: string;
  medicalHistory: string[];
  riskLevel: 'low' | 'medium' | 'high';
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

function RpmManagement() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      diagnosis: "Hypertension",
      medicalHistory: [
        "2020: Diagnosed with Diabetes",
        "2022: Elevated Cholesterol levels found",
        "No known allergies",
      ],
      riskLevel: "high",
      enrollmentDate: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Austin",
      diagnosis: "Diabetes Type 2",
      medicalHistory: [
        "Diabetes since 2018",
        "2021: One episode of diabetic ketoacidosis",
        "Allergic to Penicillin",
      ],
      riskLevel: "medium",
      enrollmentDate: "2024-02-01",
      status: "active"
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("patients");
  const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceType: '',
    deviceModel: '',
    serialNumber: ''
  });

  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [newPatient, setNewPatient] = useState<{
    firstName: string;
    lastName: string;
    diagnosis: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>({
    firstName: '',
    lastName: '',
    diagnosis: '',
    riskLevel: 'medium'
  });

  const enrollPatient = () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.diagnosis) {
      toast.error('Please fill in all required fields');
      return;
    }

    const patient: Patient = {
      id: Date.now().toString(),
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      diagnosis: newPatient.diagnosis,
      medicalHistory: [],
      riskLevel: newPatient.riskLevel,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setPatients(prev => [...prev, patient]);
    
    // Create monitoring plan
    const monitoringPlan: Omit<RPMMonitoringPlan, 'id'> = {
      patientId: patient.id,
      condition: patient.diagnosis,
      devices: [],
      thresholds: getConditionThresholds(patient.diagnosis),
      frequency: getConditionFrequency(patient.diagnosis),
      active: true,
      startDate: new Date()
    };

    rpmService.createMonitoringPlan(monitoringPlan);

    toast.success(`${patient.firstName} ${patient.lastName} enrolled in RPM program`);
    setNewPatient({ firstName: '', lastName: '', diagnosis: '', riskLevel: 'medium' });
    setShowAddPatientDialog(false);
  };

  const addDevice = () => {
    if (!selectedPatient || !newDevice.deviceType || !newDevice.deviceModel || !newDevice.serialNumber) {
      toast.error('Please fill in all device fields');
      return;
    }

    const deviceId = rpmService.registerDevice({
      patientId: selectedPatient.id,
      deviceType: newDevice.deviceType as RPMDevice['deviceType'],
      deviceModel: newDevice.deviceModel,
      serialNumber: newDevice.serialNumber,
      status: 'active',
      lastSyncTime: new Date(),
      batteryLevel: 100
    });

    toast.success(`Device ${newDevice.deviceModel} added successfully`);
    setNewDevice({ deviceType: '', deviceModel: '', serialNumber: '' });
    setShowAddDeviceDialog(false);

    // Simulate some readings for demo
    setTimeout(() => {
      simulateDeviceReadings(selectedPatient.id, deviceId, newDevice.deviceType as RPMDevice['deviceType']);
    }, 1000);
  };

  const simulateDeviceReadings = (patientId: string, deviceId: string, deviceType: RPMDevice['deviceType']) => {
    // Generate sample readings based on device type
    const sampleData = getSampleReadingData(deviceType);
    
    // Create multiple readings over time
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const readingData = addRandomVariation(sampleData);
        rpmService.processReading(patientId, deviceId, readingData);
      }, i * 2000);
    }
  };

  const getSampleReadingData = (deviceType: RPMDevice['deviceType']) => {
    switch (deviceType) {
      case 'blood_pressure':
        return { systolic: 130, diastolic: 85, pulse: 72 };
      case 'glucometer':
        return { glucose: 120, unit: 'mg/dL' };
      case 'scale':
        return { weight: 175, unit: 'lbs', bmi: 25.2 };
      case 'pulse_oximeter':
        return { spo2: 98, heartRate: 75 };
      case 'thermometer':
        return { temperature: 98.6, unit: 'F' };
      default:
        return {};
    }
  };

  const addRandomVariation = (baseData: any) => {
    const varied = { ...baseData };
    
    Object.keys(varied).forEach(key => {
      if (typeof varied[key] === 'number') {
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        varied[key] = Math.round(varied[key] * (1 + variation));
      }
    });
    
    return varied;
  };

  const getConditionThresholds = (condition: string) => {
    const thresholds: any = {
      'blood_pressure': {
        systolic: { min: 90, max: 140, target: 120 },
        diastolic: { min: 60, max: 90, target: 80 }
      }
    };

    switch (condition.toLowerCase()) {
      case 'hypertension':
        return {
          blood_pressure: thresholds.blood_pressure
        };
      case 'diabetes':
      case 'diabetes type 2':
        return {
          glucometer: {
            glucose: { min: 70, max: 180, target: 100 }
          }
        };
      default:
        return {};
    }
  };

  const getConditionFrequency = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'hypertension':
        return {
          blood_pressure: { required: 2, window: 'daily' }
        };
      case 'diabetes':
      case 'diabetes type 2':
        return {
          glucometer: { required: 3, window: 'daily' }
        };
      default:
        return {};
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'blood_pressure': return <Heart className="h-4 w-4" />;
      case 'glucometer': return <Activity className="h-4 w-4" />;
      case 'scale': return <Scale className="h-4 w-4" />;
      case 'pulse_oximeter': return <Stethoscope className="h-4 w-4" />;
      case 'thermometer': return <Thermometer className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Remote Patient Monitoring</h1>
          <p className="text-muted-foreground">
            Comprehensive RPM program with automated monitoring and care coordination
          </p>
        </div>
        <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Enroll Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enroll New RPM Patient</DialogTitle>
              <DialogDescription>
                Add a new patient to the Remote Patient Monitoring program
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="diagnosis">Primary Condition</Label>
                <Input
                  id="diagnosis"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="e.g., Hypertension, Diabetes Type 2"
                />
              </div>
              <div>
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select 
                  value={newPatient.riskLevel} 
                  onValueChange={(value) => 
                    setNewPatient(prev => ({ ...prev, riskLevel: value as 'low' | 'medium' | 'high' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={enrollPatient}>Enroll Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Devices</p>
                <p className="text-2xl font-bold">
                  {patients.reduce((total, patient) => 
                    total + rpmService.getPatientDevices(patient.id).length, 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">
                  {patients.reduce((total, patient) => 
                    total + rpmService.getPatientAlerts(patient.id, true).length, 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold">
                  {patients.filter(p => p.riskLevel === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patients">Patient Management</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Population Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RPM Patient List</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedPatient?.id === patient.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {patient.diagnosis}
                            </p>
                          </div>
                          <Badge variant={getRiskColor(patient.riskLevel)}>
                            {patient.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Enrolled: {patient.enrollmentDate}</span>
                          <span>
                            Devices: {rpmService.getPatientDevices(patient.id).length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedPatient.diagnosis} • {selectedPatient.riskLevel.toUpperCase()} Risk
                      </p>
                      
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          onClick={() => setActiveTab("monitoring")}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          View Live Monitoring
                        </Button>
                        
                        <Dialog open={showAddDeviceDialog} onOpenChange={setShowAddDeviceDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Monitoring Device
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Monitoring Device</DialogTitle>
                              <DialogDescription>
                                Register a new RPM device for {selectedPatient.firstName} {selectedPatient.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="deviceType">Device Type</Label>
                                <Select 
                                  value={newDevice.deviceType} 
                                  onValueChange={(value) => setNewDevice(prev => ({ ...prev, deviceType: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select device type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="blood_pressure">Blood Pressure Monitor</SelectItem>
                                    <SelectItem value="glucometer">Blood Glucose Meter</SelectItem>
                                    <SelectItem value="scale">Digital Scale</SelectItem>
                                    <SelectItem value="pulse_oximeter">Pulse Oximeter</SelectItem>
                                    <SelectItem value="thermometer">Digital Thermometer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="deviceModel">Device Model</Label>
                                <Input
                                  id="deviceModel"
                                  value={newDevice.deviceModel}
                                  onChange={(e) => setNewDevice(prev => ({ ...prev, deviceModel: e.target.value }))}
                                  placeholder="e.g., Omron BP742N"
                                />
                              </div>
                              <div>
                                <Label htmlFor="serialNumber">Serial Number</Label>
                                <Input
                                  id="serialNumber"
                                  value={newDevice.serialNumber}
                                  onChange={(e) => setNewDevice(prev => ({ ...prev, serialNumber: e.target.value }))}
                                  placeholder="Device serial number"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={addDevice}>Add Device</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" className="w-full">
                          <Clock className="h-4 w-4 mr-2" />
                          View Time Tracking
                        </Button>
                        
                        <Button variant="outline" className="w-full">
                          <Target className="h-4 w-4 mr-2" />
                          Adjust Care Plan
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Registered Devices</h4>
                      <div className="space-y-2">
                        {rpmService.getPatientDevices(selectedPatient.id).map((device) => (
                          <div key={device.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(device.deviceType)}
                              <span>{device.deviceModel}</span>
                            </div>
                            <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                              {device.status.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                        {rpmService.getPatientDevices(selectedPatient.id).length === 0 && (
                          <p className="text-sm text-muted-foreground">No devices registered</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a patient to view actions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          {selectedPatient ? (
            <RPMDashboard 
              patientId={selectedPatient.id}
              patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a patient to view live monitoring</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Population Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Adherence Rate</span>
                    <span className="font-semibold">82%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Patients Meeting Goals</span>
                    <span className="font-semibold">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Hospital Readmission Rate</span>
                    <span className="font-semibold">8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost Savings per Patient</span>
                    <span className="font-semibold">$2,400</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      High Risk
                    </span>
                    <span>{patients.filter(p => p.riskLevel === 'high').length} patients</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      Medium Risk
                    </span>
                    <span>{patients.filter(p => p.riskLevel === 'medium').length} patients</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Low Risk
                    </span>
                    <span>{patients.filter(p => p.riskLevel === 'low').length} patients</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RpmManagement;
