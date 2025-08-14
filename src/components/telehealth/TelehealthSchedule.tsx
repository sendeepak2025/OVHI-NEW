
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, Search, VideoIcon, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, isToday, isTomorrow, isSameDay } from "date-fns";

// Mock data for scheduled telehealth appointments
const SCHEDULED_APPOINTMENTS = [
  {
    id: 'a1',
    patient: {
      id: 'p1',
      name: 'Emma Thompson',
      age: 42,
      avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
    },
    date: addDays(new Date(), 0),
    time: '14:30',
    duration: '30 minutes',
    reason: 'Follow-up checkup',
    status: 'confirmed'
  },
  {
    id: 'a2',
    patient: {
      id: 'p2',
      name: 'James Wilson',
      age: 65,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    date: addDays(new Date(), 0),
    time: '16:00',
    duration: '45 minutes',
    reason: 'Medication review',
    status: 'confirmed'
  },
  {
    id: 'a3',
    patient: {
      id: 'p3',
      name: 'Sophia Chen',
      age: 35,
      avatar: 'https://randomuser.me/api/portraits/women/49.jpg',
    },
    date: addDays(new Date(), 1),
    time: '09:15',
    duration: '30 minutes',
    reason: 'Prescription renewal',
    status: 'pending'
  },
  {
    id: 'a4',
    patient: {
      id: 'p4',
      name: 'Robert Garcia',
      age: 58,
      avatar: 'https://randomuser.me/api/portraits/men/17.jpg',
    },
    date: addDays(new Date(), 2),
    time: '11:30',
    duration: '30 minutes',
    reason: 'Blood pressure review',
    status: 'confirmed'
  },
  {
    id: 'a5',
    patient: {
      id: 'p1',
      name: 'Emma Thompson',
      age: 42,
      avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
    },
    date: addDays(new Date(), 5),
    time: '13:45',
    duration: '30 minutes',
    reason: 'Follow-up checkup',
    status: 'pending'
  }
];

// Get status badge - moved outside of the component to be accessible by both components
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmed</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
    default:
      return null;
  }
};

interface TelehealthScheduleProps {
  onStartConsultation: (patient: any) => void;
}

const TelehealthSchedule: React.FC<TelehealthScheduleProps> = ({ onStartConsultation }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduleView, setScheduleView] = useState('upcoming');
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Helper function for formatting date display
  const formatAppointmentDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  // Filter appointments based on the schedule view and selected date
  const filteredAppointments = SCHEDULED_APPOINTMENTS.filter(appointment => {
    if (scheduleView === 'day' && date) {
      return isSameDay(appointment.date, date);
    }
    if (scheduleView === 'upcoming') {
      return appointment.date >= new Date();
    }
    return true;
  }).sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    return a.time.localeCompare(b.time);
  });

  // Start consultation if appointment is today
  const handleStartConsultation = (appointment: any) => {
    if (isToday(appointment.date)) {
      onStartConsultation(appointment.patient);
    } else {
      toast.error("Cannot start a consultation for a future appointment", {
        description: "This appointment is scheduled for " + formatAppointmentDate(appointment.date)
      });
    }
  };

  // Handle appointment confirmation
  const handleConfirmAppointment = (appointmentId: string) => {
    toast.success("Appointment confirmed", {
      description: "The patient will be notified via email"
    });
    // In a real app, we would update the appointment status in the database
  };

  // Handle appointment cancellation
  const handleCancelAppointment = (appointmentId: string) => {
    toast.info("Appointment cancelled", {
      description: "The patient will be notified via email"
    });
    // In a real app, we would update the appointment status in the database
  };

  // Handle appointment reschedule
  const handleRescheduleAppointment = (appointmentId: string) => {
    setShowRescheduleDialog(true);
    setSelectedAppointment(SCHEDULED_APPOINTMENTS.find(a => a.id === appointmentId));
  };

  // Submit reschedule request
  const submitReschedule = () => {
    toast.success("Appointment rescheduled", {
      description: "The patient will be notified of the change"
    });
    setShowRescheduleDialog(false);
    // In a real app, we would update the appointment in the database
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Telehealth Schedule</CardTitle>
          <CardDescription>
            View and manage your upcoming telehealth appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={scheduleView} onValueChange={setScheduleView} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="day">Day View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="day" className="mt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-[350px]">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-4">
                    {date ? formatAppointmentDate(date) : 'Select a date'}
                  </h3>
                  {filteredAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {filteredAppointments.map(appointment => (
                        <AppointmentCard 
                          key={appointment.id}
                          appointment={appointment}
                          onStartConsultation={handleStartConsultation}
                          onConfirm={() => handleConfirmAppointment(appointment.id)}
                          onCancel={() => handleCancelAppointment(appointment.id)}
                          onReschedule={() => handleRescheduleAppointment(appointment.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/20 rounded-lg">
                      <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No appointments scheduled for this day</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-4">
              <div className="space-y-6">
                {(() => {
                  // Group appointments by date
                  const groupedAppointments: Record<string, any[]> = {};
                  
                  filteredAppointments.forEach(appointment => {
                    const dateKey = appointment.date.toDateString();
                    if (!groupedAppointments[dateKey]) {
                      groupedAppointments[dateKey] = [];
                    }
                    groupedAppointments[dateKey].push(appointment);
                  });
                  
                  // Render groups
                  return Object.keys(groupedAppointments).map(dateKey => (
                    <div key={dateKey}>
                      <h3 className="font-semibold text-lg mb-3">
                        {formatAppointmentDate(new Date(dateKey))}
                      </h3>
                      <div className="space-y-3">
                        {groupedAppointments[dateKey].map(appointment => (
                          <AppointmentCard 
                            key={appointment.id}
                            appointment={appointment}
                            onStartConsultation={handleStartConsultation}
                            onConfirm={() => handleConfirmAppointment(appointment.id)}
                            onCancel={() => handleCancelAppointment(appointment.id)}
                            onReschedule={() => handleRescheduleAppointment(appointment.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ));
                })()}
                
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No upcoming appointments scheduled</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <span>Reschedule appointment with {selectedAppointment.patient.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Date</label>
              <Calendar
                mode="single"
                selected={selectedAppointment?.date}
                className="rounded-md border max-w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Time</label>
              <select className="w-full rounded-md border p-2">
                <option>09:00 AM</option>
                <option>09:30 AM</option>
                <option>10:00 AM</option>
                <option>10:30 AM</option>
                <option>11:00 AM</option>
                <option>11:30 AM</option>
                <option>01:00 PM</option>
                <option>01:30 PM</option>
                <option>02:00 PM</option>
                <option>02:30 PM</option>
                <option>03:00 PM</option>
                <option>03:30 PM</option>
                <option>04:00 PM</option>
                <option>04:30 PM</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>Cancel</Button>
            <Button onClick={submitReschedule}>Confirm Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Sub-component for appointment card
const AppointmentCard = ({ 
  appointment, 
  onStartConsultation,
  onConfirm,
  onCancel,
  onReschedule
}: { 
  appointment: any; 
  onStartConsultation: (appointment: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}) => {
  const isAppointmentToday = isToday(appointment.date);
  
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={appointment.patient.avatar} alt={appointment.patient.name} />
            <AvatarFallback>
              {appointment.patient.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{appointment.patient.name}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{appointment.time} ({appointment.duration})</span>
            </div>
          </div>
        </div>
        <div>{getStatusBadge(appointment.status)}</div>
      </div>
      
      <p className="text-sm mt-2 mb-3">
        <span className="font-medium">Reason:</span> {appointment.reason}
      </p>
      
      <div className="flex flex-wrap justify-end gap-2 mt-2">
        {appointment.status === 'pending' && (
          <>
            <Button variant="outline" size="sm" onClick={onConfirm}>
              <Check className="h-4 w-4 mr-1" /> Confirm
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </>
        )}
        <Button variant="outline" size="sm" onClick={onReschedule}>
          <CalendarIcon className="h-4 w-4 mr-1" /> Reschedule
        </Button>
        {isAppointmentToday && (
          <Button size="sm" onClick={() => onStartConsultation(appointment)}>
            <VideoIcon className="h-4 w-4 mr-1" /> Start Consultation
          </Button>
        )}
      </div>
    </div>
  );
};

export default TelehealthSchedule;
