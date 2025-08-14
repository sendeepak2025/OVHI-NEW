
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, Search, VideoIcon, FileText, Folder } from "lucide-react";
import { format } from "date-fns";

// Mock data for consultation history
const HISTORY_DATA = [
  {
    id: 'h1',
    patient: {
      id: 'p1',
      name: 'Emma Thompson',
      age: 42,
      avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
    },
    date: new Date(2023, 8, 15, 10, 30),
    duration: '25 minutes',
    reason: 'Follow-up checkup',
    diagnosis: 'Hypertension, well-controlled',
    notes: 'Patient reports improved energy levels. Blood pressure readings have been consistently within normal range.',
    recordings: true
  },
  {
    id: 'h2',
    patient: {
      id: 'p2',
      name: 'James Wilson',
      age: 65,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    date: new Date(2023, 8, 10, 14, 15),
    duration: '40 minutes',
    reason: 'Chest pain evaluation',
    diagnosis: 'Stable angina',
    notes: 'Patient experiencing chest pain on exertion. EKG results reviewed. Adjusted medication dosage.',
    recordings: true
  },
  {
    id: 'h3',
    patient: {
      id: 'p3',
      name: 'Sophia Chen',
      age: 35,
      avatar: 'https://randomuser.me/api/portraits/women/49.jpg',
    },
    date: new Date(2023, 8, 5, 9, 0),
    duration: '15 minutes',
    reason: 'Prescription renewal',
    diagnosis: 'Allergic rhinitis',
    notes: 'Patient reports good response to current medication. Prescription renewed for 3 months.',
    recordings: false
  },
  {
    id: 'h4',
    patient: {
      id: 'p4',
      name: 'Robert Garcia',
      age: 58,
      avatar: 'https://randomuser.me/api/portraits/men/17.jpg',
    },
    date: new Date(2023, 7, 25, 11, 30),
    duration: '30 minutes',
    reason: 'Blood pressure review',
    diagnosis: 'Hypertension, moderately controlled',
    notes: 'Patient\'s blood pressure readings still elevated. Increased medication dosage and recommended dietary modifications.',
    recordings: true
  },
  {
    id: 'h5',
    patient: {
      id: 'p1',
      name: 'Emma Thompson',
      age: 42,
      avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
    },
    date: new Date(2023, 7, 1, 13, 45),
    duration: '20 minutes',
    reason: 'Medication side effects',
    diagnosis: 'Hypertension, medication adjustment needed',
    notes: 'Patient experiencing dizziness from current medication. Switched to alternative medication with lower side effect profile.',
    recordings: false
  }
];

interface TelehealthHistoryProps {
  onStartConsultation: (patient: any) => void;
}

const TelehealthHistory: React.FC<TelehealthHistoryProps> = ({ onStartConsultation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeHistoryTab, setActiveHistoryTab] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

  // Filter consultations based on search term and active tab
  const filteredConsultations = HISTORY_DATA.filter(consultation => {
    const matchesSearch = consultation.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          consultation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeHistoryTab === 'all') return matchesSearch;
    if (activeHistoryTab === 'recent') return matchesSearch && new Date(consultation.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    if (activeHistoryTab === 'recorded') return matchesSearch && consultation.recordings;
    
    return matchesSearch;
  });

  const handleViewDetails = (consultation: any) => {
    setSelectedConsultation(consultation);
  };

  const handleStartFollowUp = (patient: any) => {
    onStartConsultation(patient);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultation History</CardTitle>
        <CardDescription>
          View past telehealth consultations and access recordings
        </CardDescription>
        <div className="flex items-center space-x-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, reason, or diagnosis..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeHistoryTab} onValueChange={setActiveHistoryTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Consultations</TabsTrigger>
            <TabsTrigger value="recent">Recent (7 Days)</TabsTrigger>
            <TabsTrigger value="recorded">With Recordings</TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedConsultation ? (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => setSelectedConsultation(null)}
            >
              Back to List
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedConsultation.patient.avatar} alt={selectedConsultation.patient.name} />
                <AvatarFallback>
                  {selectedConsultation.patient.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedConsultation.patient.name}</h3>
                <p className="text-sm text-muted-foreground">Age: {selectedConsultation.patient.age}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Date & Time</h4>
                <p className="text-muted-foreground flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" /> {format(selectedConsultation.date, 'PPP')}
                </p>
                <p className="text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> {format(selectedConsultation.date, 'p')}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Duration</h4>
                <p className="text-muted-foreground">{selectedConsultation.duration}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Reason for Visit</h4>
              <p className="text-muted-foreground">{selectedConsultation.reason}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Diagnosis</h4>
              <p className="text-muted-foreground">{selectedConsultation.diagnosis}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Consultation Notes</h4>
              <div className="p-3 border rounded-md bg-muted/50 text-sm">
                {selectedConsultation.notes}
              </div>
            </div>
            
            {selectedConsultation.recordings && (
              <div>
                <h4 className="font-medium mb-1">Recordings</h4>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <VideoIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Consultation Recording</span>
                  </div>
                  <Button variant="outline" size="sm">Play</Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Notes
              </Button>
              <Button onClick={() => handleStartFollowUp(selectedConsultation.patient)}>
                <VideoIcon className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.length > 0 ? (
              filteredConsultations.map(consultation => (
                <div 
                  key={consultation.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={consultation.patient.avatar} alt={consultation.patient.name} />
                        <AvatarFallback>
                          {consultation.patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{consultation.patient.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {format(consultation.date, 'PPP')} at {format(consultation.date, 'p')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {consultation.duration}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <p className="text-xs font-medium">Reason:</p>
                      <p className="text-xs text-muted-foreground">{consultation.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Diagnosis:</p>
                      <p className="text-xs text-muted-foreground">{consultation.diagnosis}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex space-x-1">
                      {consultation.recordings && (
                        <Badge variant="secondary" className="text-xs">
                          <VideoIcon className="h-3 w-3 mr-1" /> Recording
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(consultation)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Folder className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No consultations found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TelehealthHistory;
