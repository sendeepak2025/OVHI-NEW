import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Activity, 
  FileText, 
  Stethoscope, 
  Clock, 
  MessageSquare,
  Users,
  Calendar,
  Pill,
  TestTube
} from 'lucide-react';

interface PatientSummary {
  id: string;
  name: string;
  age: number;
  lastVisit?: string;
  chronicConditions?: string[];
  upcomingAppointment?: string;
}

interface ProviderQuickActionsProps {
  patient?: PatientSummary;
  onStartEncounter: () => void;
  onAddVitals: () => void;
  onUpdateDiagnosis: () => void;
  onAddMedication: () => void;
  onOrderLabs: () => void;
  onScheduleFollowup: () => void;
  onAddNote: () => void;
}

const QUICK_ACTIONS = [
  {
    id: 'encounter',
    label: 'Start Encounter',
    icon: FileText,
    variant: 'default' as const,
    shortcut: 'Ctrl+E'
  },
  {
    id: 'vitals',
    label: 'Add Vitals',
    icon: Activity,
    variant: 'outline' as const,
    shortcut: 'Ctrl+V'
  },
  {
    id: 'diagnosis',
    label: 'Update Diagnosis',
    icon: Stethoscope,
    variant: 'outline' as const,
    shortcut: 'Ctrl+D'
  },
  {
    id: 'medication',
    label: 'Add Medication',
    icon: Pill,
    variant: 'outline' as const,
    shortcut: 'Ctrl+M'
  },
  {
    id: 'labs',
    label: 'Order Labs',
    icon: TestTube,
    variant: 'outline' as const,
    shortcut: 'Ctrl+L'
  },
  {
    id: 'followup',
    label: 'Schedule Follow-up',
    icon: Calendar,
    variant: 'outline' as const,
    shortcut: 'Ctrl+F'
  }
];

const COMMON_ENCOUNTERS = [
  {
    type: 'Annual Wellness',
    duration: '30 min',
    template: 'wellness-exam',
    color: 'bg-green-100 text-green-800'
  },
  {
    type: 'Follow-up Visit',
    duration: '15 min',
    template: 'followup',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    type: 'Acute Care',
    duration: '20 min',
    template: 'acute-care',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    type: 'Chronic Care',
    duration: '25 min',
    template: 'chronic-care',
    color: 'bg-purple-100 text-purple-800'
  }
];

export const ProviderQuickActions: React.FC<ProviderQuickActionsProps> = ({
  patient,
  onStartEncounter,
  onAddVitals,
  onUpdateDiagnosis,
  onAddMedication,
  onOrderLabs,
  onScheduleFollowup,
  onAddNote
}) => {
  const actionHandlers = {
    encounter: onStartEncounter,
    vitals: onAddVitals,
    diagnosis: onUpdateDiagnosis,
    medication: onAddMedication,
    labs: onOrderLabs,
    followup: onScheduleFollowup
  };

  const handleQuickAction = (actionId: string) => {
    const handler = actionHandlers[actionId as keyof typeof actionHandlers];
    handler?.();
  };

  const getDaysFromLastVisit = () => {
    if (!patient?.lastVisit) return null;
    const lastVisitDate = new Date(patient.lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      {/* Patient Context Card */}
      {patient && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <Badge variant="outline">{patient.age} years old</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {patient.lastVisit && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last visit: {getDaysFromLastVisit()} days ago
                </div>
              )}
              {patient.upcomingAppointment && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Next: {patient.upcomingAppointment}
                </div>
              )}
            </div>
            
            {patient.chronicConditions && patient.chronicConditions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Chronic Conditions:</p>
                <div className="flex flex-wrap gap-1">
                  {patient.chronicConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant}
                  onClick={() => handleQuickAction(action.id)}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.shortcut}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Encounter Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Quick Encounter Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {COMMON_ENCOUNTERS.map((encounter, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={onStartEncounter}
                className="w-full justify-between h-auto p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${encounter.color}`}>
                    {encounter.type}
                  </div>
                  <span className="text-sm text-muted-foreground">{encounter.duration}</span>
                </div>
                <Plus className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Quick Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={onAddNote}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Clinical Note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};