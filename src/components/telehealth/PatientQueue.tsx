
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, VideoIcon } from "lucide-react";

// Mock data for waiting patients
const WAITING_PATIENTS = [
  {
    id: 'p1',
    name: 'Emma Thompson',
    age: 42,
    waitingTime: '10 minutes',
    reason: 'Follow-up checkup',
    avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
    status: 'Waiting',
    priority: 'Medium'
  },
  {
    id: 'p2',
    name: 'James Wilson',
    age: 65,
    waitingTime: '5 minutes',
    reason: 'Chest pain, heart condition follow-up',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Waiting',
    priority: 'High'
  },
  {
    id: 'p3',
    name: 'Sophia Chen',
    age: 35,
    waitingTime: '20 minutes',
    reason: 'Prescription renewal',
    avatar: 'https://randomuser.me/api/portraits/women/49.jpg',
    status: 'Waiting',
    priority: 'Low'
  },
  {
    id: 'p4',
    name: 'Robert Garcia',
    age: 58,
    waitingTime: '15 minutes',
    reason: 'Blood pressure review',
    avatar: 'https://randomuser.me/api/portraits/men/17.jpg',
    status: 'Preparing',
    priority: 'Medium'
  }
];

interface PatientQueueProps {
  onStartConsultation: (patient: any) => void;
}

const PatientQueue: React.FC<PatientQueueProps> = ({ onStartConsultation }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="outline" className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Medium Priority</Badge>;
      case 'Low':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Virtual Waiting Room</CardTitle>
        <CardDescription>
          Patients awaiting telehealth consultation: {WAITING_PATIENTS.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {WAITING_PATIENTS.map(patient => (
            <div 
              key={patient.id} 
              className="rounded-lg border bg-card p-4 relative shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                    <div className="flex gap-2 mt-1 items-center text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{patient.waitingTime}</span>
                    </div>
                  </div>
                </div>
                <div>{getPriorityBadge(patient.priority)}</div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium">Reason for visit:</p>
                <p className="text-sm text-muted-foreground">{patient.reason}</p>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  className="gap-2" 
                  onClick={() => onStartConsultation(patient)}
                >
                  <VideoIcon className="h-4 w-4" />
                  Start Consultation
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientQueue;
