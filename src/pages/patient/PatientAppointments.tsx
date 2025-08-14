
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Video, Plus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate, getStatusColor } from '@/utils/formatHelpers';

const PatientAppointments: React.FC = () => {
  const { patients } = useData();
  const patient = patients[0]; // Demo patient

  // Mock appointments data for the patient
  const appointments = [
    {
      id: '1',
      date: '2025-03-20',
      time: '10:00 AM',
      type: 'Follow-up',
      provider: patient?.primaryDoctor || 'Dr. Sarah Johnson',
      location: 'Clinic Room 202',
      method: 'In-Person',
      status: 'Scheduled'
    },
    {
      id: '2',
      date: '2025-04-15',
      time: '2:30 PM',
      type: 'Routine Checkup',
      provider: patient?.primaryDoctor || 'Dr. Sarah Johnson',
      location: 'Telehealth',
      method: 'Video Call',
      status: 'Scheduled'
    }
  ];

  const upcomingAppointments = appointments.filter(apt => new Date(apt.date) >= new Date());
  const pastAppointments = appointments.filter(apt => new Date(apt.date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Next Appointment */}
      {patient?.nextAppointment && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-green-600">Next Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-2xl font-bold">{formatDate(patient.nextAppointment)}</p>
                <p className="text-muted-foreground">with {patient.primaryDoctor}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Upcoming</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="font-semibold">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <p className="text-lg font-medium">{appointment.type}</p>
                    <p className="text-muted-foreground">with {appointment.provider}</p>
                    <div className="flex items-center">
                      {appointment.method === 'Video Call' ? (
                        <Video className="h-4 w-4 mr-1 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      )}
                      <span className="text-sm">{appointment.location}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{formatDate(patient?.lastVisit || '2025-03-02')}</p>
                  <p className="text-sm text-muted-foreground">Routine checkup with {patient?.primaryDoctor}</p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientAppointments;
