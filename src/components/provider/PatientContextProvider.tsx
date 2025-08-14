import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PatientMedicalHistory {
  diagnoses: string[];
  medications: string[];
  allergies: string[];
  vitals: any[];
  lastEncounter?: any;
  chronicConditions: string[];
  riskFactors: string[];
}

interface PatientContextData {
  patientId: string | null;
  patientHistory: PatientMedicalHistory | null;
  isLoading: boolean;
  autoFillEnabled: boolean;
  smartSuggestions: string[];
  setPatientId: (id: string) => void;
  getAutoFillData: (formType: string) => any;
  toggleAutoFill: () => void;
  addToHistory: (type: string, data: any) => void;
}

const PatientContext = createContext<PatientContextData | undefined>(undefined);

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientContext must be used within a PatientContextProvider');
  }
  return context;
};

interface PatientContextProviderProps {
  children: React.ReactNode;
}

// Mock patient data - in real app, this would come from API
const MOCK_PATIENT_DATA: Record<string, PatientMedicalHistory> = {
  'patient-1': {
    diagnoses: ['I10 - Essential hypertension', 'E11.9 - Type 2 diabetes mellitus'],
    medications: ['Lisinopril 10mg daily', 'Metformin 500mg twice daily'],
    allergies: ['Penicillin - Rash', 'Sulfa drugs - Hives'],
    vitals: [
      { date: '2024-01-15', bp: '140/90', hr: 78, temp: 98.6 },
      { date: '2024-01-01', bp: '138/88', hr: 76, temp: 98.4 }
    ],
    lastEncounter: {
      date: '2024-01-15',
      type: 'Follow-up',
      chiefComplaint: 'Routine diabetes and hypertension management',
      provider: 'Dr. Smith'
    },
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    riskFactors: ['Family history of CAD', 'Sedentary lifestyle', 'Diet non-compliance']
  },
  'patient-2': {
    diagnoses: ['J44.1 - COPD with acute exacerbation'],
    medications: ['Albuterol inhaler PRN', 'Prednisone 20mg daily'],
    allergies: ['NKDA'],
    vitals: [
      { date: '2024-01-10', bp: '130/80', hr: 88, temp: 99.2, o2sat: 92 }
    ],
    lastEncounter: {
      date: '2024-01-10',
      type: 'Acute visit',
      chiefComplaint: 'Shortness of breath, increased cough',
      provider: 'Dr. Johnson'
    },
    chronicConditions: ['COPD'],
    riskFactors: ['Smoking history', 'Environmental exposures']
  }
};

const AUTOFILL_TEMPLATES = {
  encounter: {
    routine_followup: {
      encounterType: 'Follow-up Visit',
      duration: '15 minutes',
      template: 'chronic-care-followup'
    },
    annual_physical: {
      encounterType: 'Annual Physical',
      duration: '45 minutes',
      template: 'comprehensive-exam'
    },
    acute_visit: {
      encounterType: 'Acute Care',
      duration: '20 minutes',
      template: 'problem-focused'
    }
  },
  vitals: {
    default: {
      instructions: 'Review previous vitals and note any significant changes'
    }
  },
  assessment: {
    chronic_conditions: {
      instructions: 'Consider status of chronic conditions and medication compliance'
    }
  }
};

export const PatientContextProvider: React.FC<PatientContextProviderProps> = ({ children }) => {
  const [patientId, setPatientIdState] = useState<string | null>(null);
  const [patientHistory, setPatientHistory] = useState<PatientMedicalHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  const setPatientId = async (id: string) => {
    setIsLoading(true);
    setPatientIdState(id);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const history = MOCK_PATIENT_DATA[id];
      if (history) {
        setPatientHistory(history);
        generateSmartSuggestions(history);
        toast.success('Patient history loaded');
      } else {
        setPatientHistory(null);
        toast.info('No previous history found for this patient');
      }
    } catch (error) {
      toast.error('Failed to load patient history');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSmartSuggestions = (history: PatientMedicalHistory) => {
    const suggestions: string[] = [];
    
    // Based on chronic conditions
    if (history.chronicConditions.includes('Hypertension')) {
      suggestions.push('Check blood pressure control');
      suggestions.push('Review antihypertensive medications');
    }
    
    if (history.chronicConditions.includes('Type 2 Diabetes')) {
      suggestions.push('Review blood glucose logs');
      suggestions.push('Consider HbA1c if due');
      suggestions.push('Assess diabetic complications');
    }
    
    if (history.chronicConditions.includes('COPD')) {
      suggestions.push('Assess respiratory status');
      suggestions.push('Review inhaler technique');
      suggestions.push('Check oxygen saturation');
    }
    
    // Based on last encounter
    if (history.lastEncounter) {
      const daysSinceLastVisit = Math.floor(
        (Date.now() - new Date(history.lastEncounter.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastVisit > 90) {
        suggestions.push('Consider medication review - last visit > 3 months ago');
      }
    }
    
    // Based on vital trends
    if (history.vitals.length >= 2) {
      const latest = history.vitals[0];
      const previous = history.vitals[1];
      
      if (latest.bp && previous.bp) {
        const [latestSys] = latest.bp.split('/').map(Number);
        const [prevSys] = previous.bp.split('/').map(Number);
        
        if (latestSys > prevSys + 10) {
          suggestions.push('Blood pressure trending upward - consider intervention');
        }
      }
    }
    
    setSmartSuggestions(suggestions);
  };

  const getAutoFillData = (formType: string) => {
    if (!autoFillEnabled || !patientHistory) return {};
    
    switch (formType) {
      case 'encounter':
        return {
          patientHistory: patientHistory.diagnoses,
          suggestions: smartSuggestions,
          lastEncounter: patientHistory.lastEncounter,
          chronicConditions: patientHistory.chronicConditions
        };
        
      case 'vitals':
        return {
          previousVitals: patientHistory.vitals[0] || null,
          trendData: patientHistory.vitals.slice(0, 3)
        };
        
      case 'medications':
        return {
          currentMedications: patientHistory.medications,
          allergies: patientHistory.allergies
        };
        
      case 'assessment':
        return {
          existingDiagnoses: patientHistory.diagnoses,
          chronicConditions: patientHistory.chronicConditions,
          riskFactors: patientHistory.riskFactors
        };
        
      default:
        return {};
    }
  };

  const toggleAutoFill = () => {
    setAutoFillEnabled(!autoFillEnabled);
    toast.info(`Auto-fill ${!autoFillEnabled ? 'enabled' : 'disabled'}`);
  };

  const addToHistory = (type: string, data: any) => {
    if (!patientHistory) return;
    
    const updatedHistory = { ...patientHistory };
    
    switch (type) {
      case 'diagnosis':
        updatedHistory.diagnoses = [...updatedHistory.diagnoses, data.description];
        break;
      case 'medication':
        updatedHistory.medications = [...updatedHistory.medications, data.name];
        break;
      case 'vitals':
        updatedHistory.vitals = [data, ...updatedHistory.vitals.slice(0, 4)];
        break;
      case 'encounter':
        updatedHistory.lastEncounter = data;
        break;
    }
    
    setPatientHistory(updatedHistory);
    generateSmartSuggestions(updatedHistory);
  };

  const contextValue: PatientContextData = {
    patientId,
    patientHistory,
    isLoading,
    autoFillEnabled,
    smartSuggestions,
    setPatientId,
    getAutoFillData,
    toggleAutoFill,
    addToHistory
  };

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  );
};