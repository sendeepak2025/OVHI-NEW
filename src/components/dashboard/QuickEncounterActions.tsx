import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, User, Clock, Stethoscope } from 'lucide-react';
import SmartEncounterBuilder from '../encounter/SmartEncounterBuilder';
import ManualEncounterBuilder from '../encounter/ManualEncounterBuilder';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  condition: string;
}

interface QuickEncounterActionsProps {
  recentPatients: Patient[];
  onEncounterComplete: (encounterData: any) => void;
}

const QuickEncounterActions: React.FC<QuickEncounterActionsProps> = ({
  recentPatients,
  onEncounterComplete
}) => {
  const [showEncounterDialog, setShowEncounterDialog] = useState(false);
  const [showManualEncounterDialog, setShowManualEncounterDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleStartEncounter = (patient: Patient | null = null) => {
    setSelectedPatient(patient);
    setShowEncounterDialog(true);
  };

  const handleEncounterComplete = (encounterData: any) => {
    setShowEncounterDialog(false);
    setSelectedPatient(null);
    onEncounterComplete(encounterData);
  };

  const handleManualEncounterComplete = (encounterData: any) => {
    setShowManualEncounterDialog(false);
    setSelectedPatient(null);
    onEncounterComplete(encounterData);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Patient Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Quick Start Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Smart Encounter */}
              <Dialog open={showEncounterDialog} onOpenChange={setShowEncounterDialog}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => handleStartEncounter()} 
                    className="w-full bg-primary hover:bg-primary/90 h-12"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Smart Encounter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Smart Encounter Builder</DialogTitle>
                  </DialogHeader>
                  <div className="h-full overflow-y-auto">
                    {showEncounterDialog && (
                      <SmartEncounterBuilder
                        patientId={selectedPatient?.id || ''}
                        providerId="current-provider"
                        specialty={selectedPatient?.condition || 'primary-care'}
                        appointmentType="consultation"
                        patientIntakeData={selectedPatient}
                        onEncounterComplete={handleEncounterComplete}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Manual Encounter */}
              <Dialog open={showManualEncounterDialog} onOpenChange={setShowManualEncounterDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full border-dashed border-2 hover:bg-muted/50 h-12"
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Manual Encounter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Manual Encounter Builder</DialogTitle>
                  </DialogHeader>
                  <div className="h-full overflow-y-auto">
                    {showManualEncounterDialog && (
                      <ManualEncounterBuilder
                        patientId={selectedPatient?.id || ''}
                        providerId="current-provider"
                        specialty={selectedPatient?.condition || 'primary-care'}
                        appointmentType="consultation"
                        patientData={selectedPatient}
                        onEncounterComplete={handleManualEncounterComplete}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Recent Patients Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentPatients.slice(0, 4).map((patient) => (
                <div key={patient.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <h4 className="font-medium text-sm">{patient.name}</h4>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Age: {patient.age}</p>
                      <p>Condition: {patient.condition}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last visit: {patient.lastVisit}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleStartEncounter(patient)}
                    >
                      Start Encounter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

    </>
  );
};

export default QuickEncounterActions;