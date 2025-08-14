
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Shield, Users } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/utils/formatHelpers';

const PatientMedical: React.FC = () => {
  const { patients } = useData();
  const patient = patients[0]; // Demo patient

  if (!patient) {
    return <div>No patient data available</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.allergies?.map((allergy, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{allergy.allergen}</h4>
                      <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                    </div>
                    <Badge variant={allergy.severity === 'Severe' ? 'destructive' : 
                                 allergy.severity === 'Moderate' ? 'secondary' : 'outline'}>
                      {allergy.severity}
                    </Badge>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No known allergies</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Immunizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.immunizations?.map((immunization, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-semibold">{immunization.vaccine}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(immunization.date)} - {immunization.provider}
                  </p>
                </div>
              )) || <p className="text-muted-foreground">No immunization records</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Family History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.familyHistory?.map((history, index) => (
              <div key={index} className="border rounded-lg p-3">
                <h4 className="font-semibold">{history.condition}</h4>
                <p className="text-sm text-muted-foreground">{history.relation}</p>
              </div>
            )) || <p className="text-muted-foreground">No family history recorded</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Current Diagnoses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patient.diagnosis?.map((diagnosis, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{diagnosis.diagnosis}</h4>
                    <p className="text-sm text-muted-foreground">ICD-10: {diagnosis.icd10}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(diagnosis.date)}</p>
                  </div>
                  <Badge variant={diagnosis.status === 'Active' ? 'default' : 'secondary'}>
                    {diagnosis.status}
                  </Badge>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No current diagnoses</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientMedical;
