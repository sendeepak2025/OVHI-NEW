
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart,
  Pill,
  Shield,
  Activity
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate, getStatusColor } from '@/utils/formatHelpers';

const PatientDashboard: React.FC = () => {
  const { patients } = useData();
  
  // For demo purposes, using first patient. In real app, get from auth context
  const patient = patients[0];
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Patient Data</h2>
          <p className="text-muted-foreground">Unable to load patient information.</p>
        </div>
      </div>
    );
  }

  const primaryInsurance = patient.insurance?.find(ins => ins.type === 'primary');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" alt={patient.name} />
            <AvatarFallback className="text-xl">{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {patient.name}</h1>
            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
            <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(patient.nextAppointment)}</div>
            <p className="text-xs text-muted-foreground">
              with {patient.primaryDoctor}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.currentMedications?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Current prescriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.condition}</div>
            <p className="text-xs text-muted-foreground">
              Primary condition
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primaryInsurance ? 'Active' : 'None'}</div>
            <p className="text-xs text-muted-foreground">
              {primaryInsurance?.provider || 'No insurance'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age:</span>
              <span>{patient.age} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender:</span>
              <span>{patient.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date of Birth:</span>
              <span>{formatDate(patient.birthDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Height:</span>
              <span>{patient.height}"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span>{patient.weight} lbs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BMI:</span>
              <span>{patient.bmi}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <span>{patient.address}</span>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Emergency Contact</p>
              <p className="text-sm text-muted-foreground">{patient.emergencyContact}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Current Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.currentMedications?.map((med, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{med.name}</h4>
                    <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                    <p className="text-xs text-muted-foreground">By {med.prescribedBy}</p>
                  </div>
                  <Badge variant={med.status === 'Active' ? 'default' : 'secondary'}>
                    {med.status}
                  </Badge>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No current medications</p>}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Last Visit</p>
                <p className="text-sm text-muted-foreground">Routine checkup with {patient.primaryDoctor}</p>
              </div>
              <span className="text-sm text-muted-foreground">{formatDate(patient.lastVisit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Next Appointment</p>
                <p className="text-sm text-muted-foreground">Follow-up appointment</p>
              </div>
              <span className="text-sm text-muted-foreground">{formatDate(patient.nextAppointment)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;
