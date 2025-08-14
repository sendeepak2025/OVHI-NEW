import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Video, User, CalendarClock, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getUpcomingAppintmentAPI } from "@/services/operations/appointment";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-health-blue/20 text-health-blue-dark border-health-blue/30";
    case "checked-in":
      return "bg-health-green/20 text-health-green-dark border-health-green/30";
    case "completed":
      return "bg-muted text-muted-foreground border-input";
    case "cancelled":
      return "bg-health-red/20 text-health-red-dark border-health-red/30";
    default:
      return "bg-secondary border-secondary text-secondary-foreground";
  }
};

const getAppointmentIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "telehealth":
      return <Video className="h-3 w-3" />;
    case "in-person":
      return <User className="h-3 w-3" />;
    default:
      return <CalendarClock className="h-3 w-3" />;
  }
};

const UpcomingAppointments: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchAppintment = async () => {
    const response = await getUpcomingAppintmentAPI(user?.id, token);
    if (Array.isArray(response)) {
      const sorted = response
        .filter((a) => new Date(a.date) > new Date()) // optional: future only
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      setAppointments(sorted.slice(0, 3));
    }
  };

  useEffect(() => {
    fetchAppintment();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 xs:pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg xs:text-xl">
              Upcoming Appointments
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm">
              Your schedule for today and tomorrow
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size={isMobile ? "icon" : "sm"}
            onClick={() => navigate("/appointments")}
            aria-label="View all appointments"
          >
            {isMobile ? <Calendar className="h-4 w-4" /> : "View all"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming appointments.
          </p>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-3 border rounded-md flex justify-between items-start"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{appointment.patient.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{appointment.patient.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(appointment.date).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  {getAppointmentIcon(appointment.type)}
                  <span>{appointment.type}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;
