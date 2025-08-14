
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Phone, Mail, MapPin, FileText, MessageSquare } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

interface PatientProfilePopoverProps {
  patient: {
    id: string;
    name: string;
    age: number;
    waitTime: string;
    appointmentType: string;
    avatar: string;
    status: string;
    checkedInAt: string;
  };
  trigger: React.ReactNode;
}

const PatientProfilePopover: React.FC<PatientProfilePopoverProps> = ({
  patient,
  trigger
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex flex-col">
          <div className="bg-primary/10 p-4 rounded-t-md">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-white">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-primary">{patient.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{patient.age} years old</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                  <span>MRN: #{patient.id}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>Last visit: 02/15/2023</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span>Insurance: Blue Cross</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>Waiting: {patient.waitTime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Appt: {patient.appointmentType}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground" /> 
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3 w-3 text-muted-foreground" /> 
                <span>{patient.name.toLowerCase().replace(' ', '.')}@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>123 Main St, Anytown, CA 90210</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" className="w-full text-xs h-8">View Patient Chart</Button>
              <Button size="sm" variant="outline" className="w-full text-xs h-8">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PatientProfilePopover;
