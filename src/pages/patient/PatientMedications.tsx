
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Download, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate, getStatusColor } from '@/utils/formatHelpers';

const PatientMedications: React.FC = () => {
  const { patients } = useData();
  const patient = patients[0]; // Demo patient

  if (!patient) {
    return <div>No patient data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Medications</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download List
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Refill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patient.currentMedications?.map((med, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  {med.name}
                </CardTitle>
                <Badge className={getStatusColor(med.status)}>
                  {med.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dosage</p>
                  <p className="text-lg font-semibold">{med.dosage}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                  <p>{med.frequency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prescribed By</p>
                  <p>{med.prescribedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(med.startDate)}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    Request Refill
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || <p className="text-muted-foreground">No medications found</p>}
      </div>
    </div>
  );
};

export default PatientMedications;
