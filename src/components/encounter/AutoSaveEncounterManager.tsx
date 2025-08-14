import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, Save, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface EncounterData {
  id?: string;
  patientId: string;
  providerId: string;
  appointmentId?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnoses: any[];
  procedures: any[];
  vitals?: any;
  status: 'draft' | 'in-progress' | 'completed';
  lastSaved?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AutoSaveEncounterManagerProps {
  patientId: string;
  providerId: string;
  appointmentId?: string;
  encounterData: EncounterData;
  onDataChange: (data: EncounterData) => void;
  autoSaveInterval?: number; // in milliseconds
  children: React.ReactNode;
}

const AutoSaveEncounterManager: React.FC<AutoSaveEncounterManagerProps> = ({
  patientId,
  providerId,
  appointmentId,
  encounterData,
  onDataChange,
  autoSaveInterval = 30000, // 30 seconds default
  children
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save encounter to local storage and backend
  const saveEncounter = useCallback(async (data: EncounterData, isAutoSave = false) => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const encounterToSave = {
        ...data,
        id: data.id || `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId,
        providerId,
        appointmentId,
        updatedAt: new Date(),
        createdAt: data.createdAt || new Date()
      };

      // Save to localStorage first
      const localKey = `encounter_${patientId}_${encounterToSave.id}`;
      localStorage.setItem(localKey, JSON.stringify(encounterToSave));

      // Save patient encounters index
      const patientEncountersKey = `patient_encounters_${patientId}`;
      const existingEncounters = JSON.parse(localStorage.getItem(patientEncountersKey) || '[]');
      const updatedEncounters = existingEncounters.filter((e: any) => e.id !== encounterToSave.id);
      updatedEncounters.push({
        id: encounterToSave.id,
        createdAt: encounterToSave.createdAt,
        updatedAt: encounterToSave.updatedAt,
        status: encounterToSave.status,
        appointmentId: encounterToSave.appointmentId
      });
      localStorage.setItem(patientEncountersKey, JSON.stringify(updatedEncounters));

      // Try to sync with backend if online
      if (isOnline) {
        try {
          // Mock API call - replace with actual API endpoint
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Encounter saved to backend:', encounterToSave);
        } catch (apiError) {
          console.warn('Failed to sync with backend, saved locally:', apiError);
        }
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (!isAutoSave) {
        toast.success('Encounter saved successfully');
      }

      onDataChange(encounterToSave);

    } catch (error) {
      console.error('Error saving encounter:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save encounter');
      
      if (!isAutoSave) {
        toast.error('Failed to save encounter');
      }
    } finally {
      setIsSaving(false);
    }
  }, [patientId, providerId, appointmentId, isOnline, isSaving, onDataChange]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !isOnline) return;

    const autoSaveTimer = setTimeout(() => {
      saveEncounter(encounterData, true);
    }, autoSaveInterval);

    return () => clearTimeout(autoSaveTimer);
  }, [encounterData, hasUnsavedChanges, isOnline, autoSaveInterval, saveEncounter]);

  // Track changes
  useEffect(() => {
    const hasContent = encounterData.subjective || encounterData.objective || 
                     encounterData.assessment || encounterData.plan ||
                     encounterData.diagnoses.length > 0 || encounterData.procedures.length > 0;
    
    if (hasContent && !isSaving) {
      setHasUnsavedChanges(true);
    }
  }, [encounterData, isSaving]);

  // Load existing encounter on mount
  useEffect(() => {
    const loadExistingEncounter = () => {
      const patientEncountersKey = `patient_encounters_${patientId}`;
      const encounters = JSON.parse(localStorage.getItem(patientEncountersKey) || '[]');
      
      // Find the most recent draft or in-progress encounter
      const activeEncounter = encounters
        .filter((e: any) => e.status === 'draft' || e.status === 'in-progress')
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      if (activeEncounter) {
        const localKey = `encounter_${patientId}_${activeEncounter.id}`;
        const encounterData = localStorage.getItem(localKey);
        
        if (encounterData) {
          const parsed = JSON.parse(encounterData);
          onDataChange(parsed);
          setLastSaved(new Date(parsed.updatedAt));
          toast.info('Loaded existing encounter draft');
        }
      }
    };

    loadExistingEncounter();
  }, [patientId, onDataChange]);

  const handleManualSave = () => {
    saveEncounter(encounterData, false);
  };

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return 'Never saved';
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <div className="space-y-4">
      {/* Auto-save status bar */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Saving...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Unsaved changes</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      Saved {getTimeSinceLastSave()}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-muted-foreground">Not saved</span>
                  </>
                )}
              </div>

              {saveError && (
                <Badge variant="destructive" className="text-xs">
                  Save Error
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                <Save className="h-4 w-4 mr-1" />
                Save Now
              </Button>
            </div>
          </div>

          {!isOnline && (
            <div className="mt-2 text-sm text-muted-foreground">
              Working offline. Changes will sync when connection is restored.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Children components */}
      {children}
    </div>
  );
};

export default AutoSaveEncounterManager;