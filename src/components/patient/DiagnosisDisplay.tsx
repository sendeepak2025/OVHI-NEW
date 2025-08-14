
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Search } from 'lucide-react';
import { SmartDiagnosisPicker } from '@/components/provider/SmartDiagnosisPicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DiagnosisItem {
  code: string;
  description: string;
  category: string;
}

interface DiagnosisDisplayProps {
  diagnoses?: DiagnosisItem[];
  onEdit?: () => void;
  onDiagnosesChange?: (diagnoses: DiagnosisItem[]) => void;
  specialty?: string;
  patientHistory?: DiagnosisItem[];
}

const DiagnosisDisplay: React.FC<DiagnosisDisplayProps> = ({ 
  diagnoses = [], 
  onEdit, 
  onDiagnosesChange,
  specialty = 'general',
  patientHistory = []
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDiagnosisChange = (newDiagnoses: DiagnosisItem[]) => {
    onDiagnosesChange?.(newDiagnoses);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Diagnosis</CardTitle>
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Diagnoses</DialogTitle>
              </DialogHeader>
              <SmartDiagnosisPicker
                selectedDiagnoses={diagnoses}
                onDiagnosisChange={handleDiagnosisChange}
                specialty={specialty}
                patientHistory={patientHistory}
              />
            </DialogContent>
          </Dialog>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {diagnoses.length > 0 ? (
          <div className="space-y-2">
            {diagnoses.map((diagnosis, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="font-medium">{diagnosis.code}</div>
                <div className="text-sm text-muted-foreground">{diagnosis.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No diagnosis information available
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosisDisplay;
