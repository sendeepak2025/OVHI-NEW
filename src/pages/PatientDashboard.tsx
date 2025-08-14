
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart,
  Pill,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  Activity
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate, getStatusColor } from '@/utils/formatHelpers';

const PatientDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPatientById } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  
  const patient = getPatientById(id || '');
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground">The requested patient could not be found.</p>
        </div>
      </div>
    );
  }

  const primaryInsurance = patient.insurance.find(ins => ins.type === 'primary');
  const secondaryInsurance = patient.insurance.find(ins => ins.type === 'secondary');

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" alt={patient.name} />
            <AvatarFallback className="text-xl">{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
            <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Edit Patient</Button>
          <Button>Schedule Appointment</Button>
        </div>
      </div>

      <Separator />

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
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
                  <span className="text-muted-foreground">DOB:</span>
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

            {/* Contact Info */}
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

            {/* Medical Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Medical Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Primary Condition</p>
                  <p className="text-sm">{patient.condition}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Primary Doctor</p>
                  <p className="text-sm">{patient.primaryDoctor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Visit</p>
                  <p className="text-sm">{formatDate(patient.lastVisit)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Next Appointment</p>
                  <p className="text-sm">{formatDate(patient.nextAppointment)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.currentMedications.map((med, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p>{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
                    <p>{formatDate(patient.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p>{patient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p>{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Marital Status</p>
                    <p>{patient.maritalStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Language</p>
                    <p>{patient.preferredLanguage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ethnicity</p>
                    <p>{patient.ethnicity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                    <p>{patient.occupation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employment & Pharmacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employer</p>
                  <p>{patient.employer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preferred Pharmacy</p>
                  <p>{patient.preferredPharmacy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                  <p>{patient.emergencyContact}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Social History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tobacco Use</p>
                  <p>{patient.socialHistory.tobacco}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alcohol Use</p>
                  <p>{patient.socialHistory.alcohol}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exercise</p>
                  <p>{patient.socialHistory.exercise}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diet</p>
                  <p>{patient.socialHistory.diet}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Tab */}
        <TabsContent value="medical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.allergies.map((allergy, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{allergy.allergen}</h4>
                          <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                        </div>
                        <Badge variant={allergy.severity === 'Severe' ? 'destructive' : 
                                     allergy.severity === 'Moderate' ? 'secondary' : 'outline'}>
                          {allergy.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Immunizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.immunizations.map((immunization, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h4 className="font-semibold">{immunization.vaccine}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(immunization.date)} - {immunization.provider}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Family History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.familyHistory.map((history, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <h4 className="font-semibold">{history.condition}</h4>
                    <p className="text-sm text-muted-foreground">{history.relation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Diagnoses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.diagnosis.map((diagnosis, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{diagnosis.diagnosis}</h4>
                        <p className="text-sm text-muted-foreground">ICD-10: {diagnosis.icd10}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(diagnosis.date)}</p>
                      </div>
                      <Badge variant={diagnosis.status === 'Active' ? 'default' : 'secondary'}>
                        {diagnosis.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-6">
          {primaryInsurance && (
            <Card>
              <CardHeader>
                <CardTitle>Primary Insurance</CardTitle>
                <p className="text-sm text-muted-foreground">{primaryInsurance.provider} - {primaryInsurance.planName}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                    <p>{primaryInsurance.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Group Number</p>
                    <p>{primaryInsurance.groupNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscriber</p>
                    <p>{primaryInsurance.subscriberName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscriber ID</p>
                    <p>{primaryInsurance.subscriberID}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Effective Date</p>
                    <p>{formatDate(primaryInsurance.effectiveDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiration Date</p>
                    <p>{formatDate(primaryInsurance.expirationDate)}</p>
                  </div>
                </div>
                {primaryInsurance.copay && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Copay Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Primary Care</p>
                        <p className="text-sm font-semibold">{primaryInsurance.copay.primaryCare}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Specialist</p>
                        <p className="text-sm font-semibold">{primaryInsurance.copay.specialist}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Emergency</p>
                        <p className="text-sm font-semibold">{primaryInsurance.copay.emergency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Urgent Care</p>
                        <p className="text-sm font-semibold">{primaryInsurance.copay.urgent}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {secondaryInsurance && (
            <Card>
              <CardHeader>
                <CardTitle>Secondary Insurance</CardTitle>
                <p className="text-sm text-muted-foreground">{secondaryInsurance.provider} - {secondaryInsurance.planName}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                    <p>{secondaryInsurance.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Group Number</p>
                    <p>{secondaryInsurance.groupNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscriber</p>
                    <p>{secondaryInsurance.subscriberName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Coverage Details</p>
                    <p>{secondaryInsurance.coverageDetails}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.currentMedications.map((med, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold">{med.name}</h4>
                        <p className="text-muted-foreground">{med.dosage} - {med.frequency}</p>
                      </div>
                      <Badge variant={med.status === 'Active' ? 'default' : 'secondary'}>
                        {med.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Prescribed By</p>
                        <p>{med.prescribedBy}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p>{formatDate(med.startDate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.notes.map((note, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Clinical Note</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(note.date)}</p>
                    </div>
                    <p className="text-sm">{note.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Consent Forms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.consentForms.map((form, index) => (
                  <div key={index} className="flex justify-between items-center border rounded-lg p-3">
                    <div>
                      <h4 className="font-semibold">{form.name}</h4>
                      <p className="text-sm text-muted-foreground">Signed: {formatDate(form.signed)}</p>
                    </div>
                    <Badge variant="outline">Signed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDashboard;
