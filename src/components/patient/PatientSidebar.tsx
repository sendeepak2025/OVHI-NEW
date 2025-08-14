import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, FileText, Share2, Printer } from 'lucide-react';
import { Patient } from '@/data/patientData'; // Assuming Patient type is defined here
import { getStatusColor } from '@/utils/formatHelpers'; // Assuming this utility exists

interface PatientSidebarProps {
  patient: Patient;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ patient }) => {
  // Find primary and secondary insurance if they exist
  const primaryInsurance = patient.insurance?.find(ins => ins.type === 'primary');
  const secondaryInsurance = patient.insurance?.find(ins => ins.type === 'secondary');

  // Calculate age from birthDate
  const birthDate = patient.birthDate ? new Date(patient.birthDate) : null;
  const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : 'N/A';

  // Get primary diagnosis
  const primaryDiagnosis = patient.diagnosis?.[0]?.diagnosis;

  // Get primary doctor (assuming there's a field for this, otherwise it will be 'N/A')
  // This field was not in the provided data, so it will display 'N/A' unless you add it to your Patient type
  const primaryDoctor = 'N/A'; // You'll need to map this from your patient data if available

  return (
    <Card className="md:col-span-1">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
     
          <h2 className="text-xl font-bold">{`${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}`}</h2>
          <p className="text-muted-foreground">{age} years, {patient.gender}</p>
          {patient.status && (
            <Badge className={getStatusColor(patient.status)}>
              {patient.status}
            </Badge>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          {primaryDiagnosis && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Diagnosis</p>
              <p>{primaryDiagnosis}</p>
            </div>
          )}
      
          {patient.phone && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{patient.phone}</p>
            </div>
          )}
          {patient.email && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{patient.email}</p>
            </div>
          )}
          {patient.address && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p>{patient.address}</p>
            </div>
          )}
          {primaryInsurance && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Insurance</p>
              <p>{primaryInsurance.company || 'N/A'}</p>
            </div>
          )}
        
          {patient.emergencyContact && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
              <p>{patient.emergencyContact}</p>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="mr-2 h-4 w-4" /> Message Patient
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" /> View Full History
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Share2 className="mr-2 h-4 w-4" /> Share Patient Record
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Printer className="mr-2 h-4 w-4" /> Print Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSidebar;