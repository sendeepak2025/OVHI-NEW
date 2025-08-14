import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarIcon, Clock, MapPin, User, Phone, Mail, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Provider, Location } from './appointmentData';

interface AppointmentDetailsDialogProps {
  appointment: any | null;
  provider: Provider;
  location: Location;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: (appointment: any) => void;
  onCancel: (appointmentId: string) => void;
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  provider,
  location,
  isOpen,
  onOpenChange,
  onReschedule,
  onCancel
}) => {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  if (!appointment) return null;

  const handleReschedule = () => {
    onReschedule(appointment);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel(appointment.id);
    onOpenChange(false);
    setIsConfirmingCancel(false);
    toast.success('Appointment cancelled successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'Telehealth' 
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Appointment Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Patient Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{appointment.patient.name}</div>
                {appointment.patient.phone && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {appointment.patient.phone}
                  </div>
                )}
                {appointment.patient.email && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {appointment.patient.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Appointment Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {format(appointment.date, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(appointment.date, 'h:mm a')} • {appointment.duration}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Dr. {provider.name}</div>
                <div className="text-sm text-muted-foreground">
                  {provider.specialty}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{location.name}</div>
                <div className="text-sm text-muted-foreground">
                  {location.address}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status and Type */}
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status}
            </Badge>
            <Badge className={getTypeColor(appointment.type)}>
              {appointment.type}
            </Badge>
          </div>

          {/* Reason */}
          {appointment.reason && (
            <div>
              <div className="text-sm font-medium mb-1">Reason for Visit</div>
              <div className="text-sm text-muted-foreground">
                {appointment.reason}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleReschedule}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Reschedule
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this appointment with {appointment.patient.name}? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Cancel Appointment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;