
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Appointment } from '@/data/medicalData';
import { formatDate, getStatusColor } from '@/utils/formatHelpers';

interface AppointmentsTabProps {
  appointments: Appointment[];
  onEdit?: () => void;
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ appointments, onEdit }) => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Appointment History</CardTitle>
            <CardDescription>Past and upcoming patient appointments</CardDescription>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>{formatDate(apt.date)}</TableCell>
                  <TableCell>{apt.time}</TableCell>
                  <TableCell>{apt.type}</TableCell>
                  <TableCell>{apt.provider}</TableCell>
                  <TableCell>{apt.method}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{apt.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => navigate('/appointments')}>
            View All Appointments
          </Button>
          <Button onClick={() => navigate('/appointments/new')}>
            <CalendarIcon className="h-4 w-4 mr-1" /> Schedule Appointment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AppointmentsTab;
