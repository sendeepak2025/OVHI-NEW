"use client";

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Video, DollarSign, MapPin, CalendarClock } from 'lucide-react';
import AppointmentBillingButton from './AppointmentBillingButton';
import { BillingDetails } from '@/utils/billingUtils';
import { NavigateFunction } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import  EnhancedSoapNotesEditor  from "@/components/encounter/EnhancedSoapNotesEditor";
import { createEncounterApi } from "@/services/operations/encounter";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { QuickDiagnosisWidget } from "@/components/provider/QuickDiagnosisWidget";

interface AppointmentCardProps {
  appointment: {
    id: string;
    patient: { id: string; name: string };
    reason?: string;
    date: Date;
    duration: string;
    type: string;
    status: string;
    hasBilling: boolean;
    providerId: string;
    locationId: string;
    template?: { // Make template optional
      soap_structure?: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
      };
    };
  };
  provider: { name: string; role?: string; specialty?: string; color?: string };
  location: { name: string; address?: string };
  onBillingCreated: (billingData: BillingDetails) => void;
  navigate: NavigateFunction;
  onAppointmentClick?: (appointment: any) => void;
  onStartEncounter?: (appointment: any) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  provider,
  location,
  onBillingCreated,
  navigate,
  onAppointmentClick,
  onStartEncounter
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  console.log(appointment)

  const [soapNotes, setSoapNotes] = useState({
    subjective: appointment.template?.soap_structure?.subjective || '',
    objective: appointment.template?.soap_structure?.objective || '',
    assessment: appointment.template?.soap_structure?.assessment || '',
    plan: appointment.template?.soap_structure?.plan || '',
  });

  const handleSoapChange = (notes: typeof soapNotes) => {
    setSoapNotes(notes);
  };

  const handleSaveEncounter = async () => {
    setIsLoading(true);
    try {
      const encounterData = {
        patient_id: appointment.patient.id,
        provider_id: appointment.providerId,
        appointment_id: appointment.id,
        encounter_type: "Standard Visit",
        reason_for_visit: "Appointment encounter",
        notes: JSON.stringify(soapNotes),
        status: "completed"
      };

      const result = await createEncounterApi(encounterData, token);

      if (result) {
        toast.success("Encounter saved successfully!");
        setIsDialogOpen(false);
        // Navigate to the encounter details or refresh appointment
      } else {
        toast.error("Failed to save encounter");
      }
    } catch (error) {
      console.error('Error saving encounter:', error);
      toast.error("Failed to save encounter");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'scheduled':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Telehealth' ? <Video className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'Telehealth'
      ? 'bg-blue-50 border-blue-200 text-blue-700'
      : 'bg-purple-50 border-purple-200 text-purple-700';
  };

  return (
    <div
      className="p-3 border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-card animate-fadeIn"
    >
      <div className="flex items-center justify-between">
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 cursor-pointer" >
              <div className="text-center sm:text-left sm:min-w-[70px] bg-primary/5 p-1.5 rounded-md">
                <div className="text-xs text-muted-foreground">
                  {appointment.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <span className="font-medium text-base">{formatTime(appointment.date)}</span>
              </div>
              <div>
                <h3 className="font-medium text-base flex items-center gap-1">
                  {appointment.patient.name}
                  <div className="inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: provider.color || '#4f46e5' }}>
                  </div>
                </h3>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="right" className="p-3">
            <div className="space-y-2">
              <h4 className="font-semibold">{appointment.patient.name}</h4>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{appointment.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Dr. {provider.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{location.name}</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={`${getStatusColor(appointment.status)} px-2 py-0.5 text-xs`}>
                {appointment.status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Appointment Status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mt-2 flex flex-wrap gap-y-1 gap-x-2 text-xs">
        <Badge variant="outline" className={`flex items-center gap-1 py-0.5 ${getTypeColor(appointment.type)}`}>
          {getTypeIcon(appointment.type)}
          <span>{appointment.type}</span>
        </Badge>

        <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 border-gray-200 py-0.5">
          <Clock className="h-3 w-3" />
          <span>{appointment.duration}</span>
        </Badge>
      </div>

      <div className="mt-2.5 px-2.5 py-2 bg-muted/5 rounded-lg border border-dashed">
        <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Dr. {provider.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{location.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            <span>{appointment.date.toLocaleDateString()}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-dashed">
          <QuickDiagnosisWidget
            onDiagnosisAdd={(diagnosis) => {
              console.log('Quick diagnosis added:', diagnosis);
              toast.success(`Added diagnosis: ${diagnosis.description}`);
            }}
            patientId={appointment.patient.id}
            compact={true}
            showFavorites={false}
            showRecent={true}
          />
        </div>
      </div>

      <div className="flex justify-end mt-3 pt-2 border-t gap-2">
        {/* {appointment.type === 'Telehealth' && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Video className="mr-1 h-3 w-3" />
            Start Session
          </Button>
        )} */}



        <div>
          <Button onClick={(e) => {
         
            onAppointmentClick?.(appointment);
          }}>Details</Button>
        </div>
        {(appointment.status === 'Pending' || appointment.status === 'scheduled') && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
            onClick={() => onStartEncounter?.(appointment)}
          >
            Smart Encounter
          </Button>
        )}

        {appointment.hasBilling ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            onClick={() => navigate('/billing')}
          >
            <DollarSign className="h-3 w-3" />
            View Billing
          </Button>
        ) : (
          <AppointmentBillingButton
            appointmentId={appointment.id}
            patientId={appointment.patient.id}
            patientName={appointment.patient.name}
            onBillingCreated={onBillingCreated}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
