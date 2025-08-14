
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Provider } from './appointmentData';
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfWeek, addMinutes, addWeeks, subWeeks } from "date-fns";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface ProviderCalendarViewProps {
  providers: Provider[];
  appointments: any[];
  selectedDate: Date;
  onSlotClick?: (date: Date, time: string) => void;
  onAppointmentClick?: (appointment: any) => void;
}

const ProviderCalendarView: React.FC<ProviderCalendarViewProps> = ({ 
  providers, 
  appointments,
  selectedDate,
  onSlotClick,
  onAppointmentClick
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(selectedDate, { weekStartsOn: 0 })
  );

  console.log(appointments)
  // Generate time slots from 8 AM to 6 PM in 30-minute increments
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({
          time: format(new Date().setHours(hour, minute), 'h:mm a'),
          hour,
          minute
        });
      }
    }
    return slots;
  };

  // Generate week days starting from the current week
  const generateWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  const weekDays = generateWeekDays();

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };
  const timeSlots = generateTimeSlots();

  return (
    <Card className="overflow-hidden border shadow-md">
      <CardHeader className="bg-primary/5 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={handlePrevWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </CardTitle>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[calc(100vh-220px)]">
          <div className="min-w-[800px]">
            {/* Header row with dates */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-muted/5 border-b">
              <div className="p-2 border-r text-xs font-medium"></div>
              {weekDays.map((day, idx) => (
                <div 
                  key={idx}
                  className={`p-2 text-center border-r last:border-r-0 ${
                    format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? 'bg-primary/10'
                      : ''
                  }`}
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                  <div className="font-semibold">
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {timeSlots.map((slot, idx) => (
              <div key={idx} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0">
                <div className="p-2 border-r text-xs text-muted-foreground">
                  {slot.time}
                </div>
                {weekDays.map((day, dayIdx) => {
                  const currentDateTime = addMinutes(
                    new Date(day).setHours(slot.hour, slot.minute),
                    0
                  );
                  const appointment = appointments.find(apt => {
                    const aptTime = new Date(apt.date).getTime();
                    const slotTime = new Date(currentDateTime).getTime();
                    return aptTime === slotTime;
                  });

                  return (
                    <div 
                      key={dayIdx}
                      className={`p-1 border-r last:border-r-0 min-h-[50px] cursor-pointer hover:bg-muted/20 transition-colors ${
                        appointment ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        if (!appointment && onSlotClick) {
                          onSlotClick(day, slot.time);
                        }
                      }}
                    >
                      {appointment ? (
                        <div 
                          className="text-xs p-1 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                          style={{ height: '100%' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(appointment);
                          }}
                        >
                          <div className="font-medium">{appointment.patient.name}</div>
                          <div className="text-muted-foreground">
                            {appointment.type}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground/50 p-1 opacity-0 hover:opacity-100 transition-opacity">
                          Click to book
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderCalendarView;
