
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit } from 'lucide-react';
import { Patient } from '@/data/patientData';
import { Medication, Appointment, VitalSigns } from '@/data/medicalData';
import { formatDate, getStatusColor } from '@/utils/formatHelpers';

interface OverviewTabProps {
  patient: Patient;
  medications: Medication[];
  appointments: Appointment[];
  vitalSigns: VitalSigns[];
  onEdit?: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  patient, 
  medications, 
  appointments, 
  vitalSigns,
  onEdit 
}) => {
  const navigate = useNavigate();
  
  
  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Current Medications</CardTitle>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {patient?.currentMedications.slice(0, 3).map((med, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{med.name} {med.dosage}</p>
                  <p className="text-sm text-muted-foreground">{med.frequency}</p>
                </div>
                <Badge className={getStatusColor(med.status)}>{med.status}</Badge>
              </div>
            ))}
          </div>
          <Button variant="link" className="mt-2 p-0" onClick={() => navigate('/medications')}>
            View all medications
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Vital Signs</CardTitle>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blood Pressure</p>
                  <p className="text-lg font-medium">{vitalSigns[0].bp}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Heart Rate</p>
                  <p className="text-lg font-medium">{vitalSigns[0].pulse} bpm</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">BMI</p>
                  <p className="text-lg font-medium">{vitalSigns[0].bmi}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                  <p className="text-lg font-medium">{vitalSigns[0].temp}°F</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Last measured on {formatDate(vitalSigns[0].date)}
              </p>
              <Button variant="link" className="mt-2 p-0">
                View vital history
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {appointments.filter(apt => new Date(apt.date) >= new Date()).map((apt) => (
              <div key={apt.id} className="mb-2 last:mb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{formatDate(apt.date)}, {apt.time}</p>
                    <p className="text-sm text-muted-foreground">{apt.type} ({apt.method})</p>
                  </div>
                  <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                </div>
              </div>
            ))}
            <Button variant="link" className="mt-2 p-0" onClick={() => navigate('/appointments')}>
              Manage appointments
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Allergies & Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.allergies && patient.allergies.map((allergy, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-health-red/10 text-health-red border-health-red mt-0.5">
                    {allergy.severity}
                  </Badge>
                  <div>
                    <p className="font-medium">{allergy.allergen}</p>
                    <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Immunizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patient.immunizations && patient.immunizations.map((immunization, index) => (
                <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                  <p className="font-medium">{immunization.vaccine}</p>
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">{formatDate(immunization.date)}</p>
                    <p className="text-sm text-muted-foreground">{immunization.provider}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Treatment Plan</span>
              <Button variant="ghost" size="sm">
                <PlusCircle className="h-4 w-4 mr-1" /> Update
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Current Treatment Goals</h4>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-1">
                  <li>Blood pressure control (target: &lt;130/80 mmHg)</li>
                  <li>Weight reduction (target: 5% of body weight)</li>
                  <li>Regular physical activity (goal: 30 minutes, 5x weekly)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Recommendations</h4>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-1">
                  <li>Continue current medication regimen</li>
                  <li>Follow DASH diet guidelines</li>
                  <li>Monitor blood pressure daily and log readings</li>
                  <li>Schedule follow-up in 3 months</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
