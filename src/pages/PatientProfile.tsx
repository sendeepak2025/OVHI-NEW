import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientProfileDashboard } from '@/components/patient/PatientProfileDashboard';
import { MedicalRecordsFaxManager } from '@/components/patient/MedicalRecordsFaxManager';
import { PatientCommunicationCenter } from '@/components/patient/PatientCommunicationCenter';
import { MedicalRecordsManager } from '@/components/patient/MedicalRecordsManager';
import { useData } from '@/contexts/DataContext';
import { FileText, MessageSquare, Send } from 'lucide-react';

const PatientProfile: React.FC = () => {
  const { id } = useParams();
  const { getPatientById, getMedicalRecordsForPatient } = useData();
  const [isFaxManagerOpen, setIsFaxManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const patient = getPatientById(id || '1');
  const medicalRecords = getMedicalRecordsForPatient(id || '1');

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'send-fax':
        setIsFaxManagerOpen(true);
        break;
      case 'send-message':
        setActiveTab('communication');
        break;
      default:
        console.log('Action clicked:', action);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Patient Profile</h1>
          <p className="text-muted-foreground">
            Comprehensive patient management with fax and communication tools
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsFaxManagerOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Fax
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('communication')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Communication
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PatientProfileDashboard 
            patient={patient}
            onActionClick={handleActionClick}
          />
        </TabsContent>

        <TabsContent value="communication">
          <PatientCommunicationCenter 
            patient={patient}
          />
        </TabsContent>

        <TabsContent value="records">
          <MedicalRecordsManager
            records={medicalRecords}
            patientId={id || '1'}
            onEdit={() => console.log('Edit medical records')}
            onFaxRecord={(recordId) => {
              console.log('Fax record:', recordId);
              setIsFaxManagerOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <MedicalRecordsFaxManager
        patient={patient}
        medicalRecords={medicalRecords}
        open={isFaxManagerOpen}
        onOpenChange={setIsFaxManagerOpen}
      />
    </div>
  );
};

export default PatientProfile;