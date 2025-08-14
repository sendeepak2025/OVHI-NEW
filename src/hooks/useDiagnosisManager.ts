import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface DiagnosisItem {
  id: string;
  code: string;
  description: string;
  category: string;
  status?: 'active' | 'resolved' | 'rule-out' | 'chronic';
  dateAdded?: string;
  addedBy?: string;
  notes?: string;
  billable?: boolean;
  confidence?: number;
}

interface DiagnosisHistory {
  patientId: string;
  diagnoses: DiagnosisItem[];
  lastUpdated: string;
}

interface UseDiagnosisManagerProps {
  patientId?: string;
  encounterId?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export const useDiagnosisManager = ({
  patientId,
  encounterId,
  autoSave = true,
  autoSaveInterval = 2000
}: UseDiagnosisManagerProps = {}) => {
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<DiagnosisItem[]>([]);
  const [patientHistory, setPatientHistory] = useState<DiagnosisItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<DiagnosisItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load patient diagnosis history
  const loadPatientHistory = useCallback(async (patientId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      const storedHistory = localStorage.getItem(`diagnosis_history_${patientId}`);
      if (storedHistory) {
        const history: DiagnosisHistory = JSON.parse(storedHistory);
        setPatientHistory(history.diagnoses);
      }
    } catch (error) {
      console.error('Error loading patient history:', error);
      toast.error('Failed to load patient diagnosis history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load encounter diagnoses
  const loadEncounterDiagnoses = useCallback(async (encounterId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call
      const storedDiagnoses = localStorage.getItem(`encounter_diagnoses_${encounterId}`);
      if (storedDiagnoses) {
        const diagnoses: DiagnosisItem[] = JSON.parse(storedDiagnoses);
        setSelectedDiagnoses(diagnoses);
      }
    } catch (error) {
      console.error('Error loading encounter diagnoses:', error);
      toast.error('Failed to load encounter diagnoses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save diagnoses to storage/API
  const saveDiagnoses = useCallback(async (diagnoses: DiagnosisItem[]) => {
    try {
      if (encounterId) {
        // Save encounter diagnoses
        localStorage.setItem(`encounter_diagnoses_${encounterId}`, JSON.stringify(diagnoses));
      }
      
      if (patientId) {
        // Update patient history
        const currentHistory = localStorage.getItem(`diagnosis_history_${patientId}`);
        const history: DiagnosisHistory = currentHistory 
          ? JSON.parse(currentHistory)
          : { patientId, diagnoses: [], lastUpdated: '' };
        
        // Merge new diagnoses with existing history
        const updatedDiagnoses = [...history.diagnoses];
        diagnoses.forEach(diagnosis => {
          const existingIndex = updatedDiagnoses.findIndex(d => d.code === diagnosis.code);
          if (existingIndex >= 0) {
            updatedDiagnoses[existingIndex] = { ...updatedDiagnoses[existingIndex], ...diagnosis };
          } else {
            updatedDiagnoses.push(diagnosis);
          }
        });
        
        const updatedHistory: DiagnosisHistory = {
          patientId,
          diagnoses: updatedDiagnoses,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(`diagnosis_history_${patientId}`, JSON.stringify(updatedHistory));
        setPatientHistory(updatedHistory.diagnoses);
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Silent save - only show toast for manual saves
      return true;
    } catch (error) {
      console.error('Error saving diagnoses:', error);
      toast.error('Failed to save diagnoses');
      return false;
    }
  }, [patientId, encounterId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && selectedDiagnoses.length > 0 && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveDiagnoses(selectedDiagnoses);
      }, autoSaveInterval);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDiagnoses, autoSave, autoSaveInterval, hasUnsavedChanges, saveDiagnoses]);

  // Load data on component mount
  useEffect(() => {
    if (patientId) {
      loadPatientHistory(patientId);
    }
    if (encounterId) {
      loadEncounterDiagnoses(encounterId);
    }
  }, [patientId, encounterId, loadPatientHistory, loadEncounterDiagnoses]);

  // Load favorites and recently used from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('diagnosis_favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
    
    const storedRecent = localStorage.getItem('diagnosis_recent');
    if (storedRecent) {
      setRecentlyUsed(JSON.parse(storedRecent));
    }
  }, []);

  // Add diagnosis
  const addDiagnosis = useCallback((diagnosis: Partial<DiagnosisItem>) => {
    const newDiagnosis: DiagnosisItem = {
      id: diagnosis.id || Math.random().toString(36).substr(2, 9),
      code: diagnosis.code || '',
      description: diagnosis.description || '',
      category: diagnosis.category || 'General',
      status: diagnosis.status || 'active',
      dateAdded: new Date().toISOString(),
      addedBy: 'current-provider',
      billable: diagnosis.billable ?? true,
      ...diagnosis
    };

    setSelectedDiagnoses(prev => {
      if (prev.find(d => d.code === newDiagnosis.code)) {
        return prev; // Don't add duplicates
      }
      const updated = [...prev, newDiagnosis];
      setHasUnsavedChanges(true);
      
      // Update recently used
      setRecentlyUsed(prevRecent => {
        const filtered = prevRecent.filter(d => d.code !== newDiagnosis.code);
        const updated = [newDiagnosis, ...filtered].slice(0, 10);
        localStorage.setItem('diagnosis_recent', JSON.stringify(updated));
        return updated;
      });
      
      return updated;
    });
  }, []);

  // Remove diagnosis
  const removeDiagnosis = useCallback((id: string) => {
    setSelectedDiagnoses(prev => {
      const updated = prev.filter(d => d.id !== id);
      setHasUnsavedChanges(true);
      return updated;
    });
  }, []);

  // Update diagnosis
  const updateDiagnosis = useCallback((id: string, updates: Partial<DiagnosisItem>) => {
    setSelectedDiagnoses(prev => {
      const updated = prev.map(d => 
        d.id === id ? { ...d, ...updates } : d
      );
      setHasUnsavedChanges(true);
      return updated;
    });
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((code: string) => {
    setFavorites(prev => {
      const updated = prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code];
      localStorage.setItem('diagnosis_favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all diagnoses
  const clearDiagnoses = useCallback(() => {
    setSelectedDiagnoses([]);
    setHasUnsavedChanges(true);
  }, []);

  // Manual save
  const manualSave = useCallback(async () => {
    const success = await saveDiagnoses(selectedDiagnoses);
    if (success) {
      toast.success('Diagnoses saved successfully');
    }
    return success;
  }, [selectedDiagnoses, saveDiagnoses]);

  // Get diagnosis statistics
  const getStatistics = useCallback(() => {
    const total = selectedDiagnoses.length;
    const active = selectedDiagnoses.filter(d => d.status === 'active').length;
    const chronic = selectedDiagnoses.filter(d => d.status === 'chronic').length;
    const resolved = selectedDiagnoses.filter(d => d.status === 'resolved').length;
    const billable = selectedDiagnoses.filter(d => d.billable).length;
    
    const categories = selectedDiagnoses.reduce((acc, diagnosis) => {
      acc[diagnosis.category] = (acc[diagnosis.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      chronic,
      resolved,
      billable,
      categories
    };
  }, [selectedDiagnoses]);

  // Search diagnoses (mock API)
  const searchDiagnoses = useCallback(async (query: string): Promise<DiagnosisItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock search results - replace with actual API call
    const mockResults: DiagnosisItem[] = [
      { id: '1', code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular', billable: true },
      { id: '2', code: 'E11.9', description: 'Type 2 diabetes mellitus', category: 'Endocrine', billable: true },
      { id: '3', code: 'J06.9', description: 'Upper respiratory infection', category: 'Respiratory', billable: true },
    ];
    
    return mockResults.filter(dx =>
      dx.description.toLowerCase().includes(query.toLowerCase()) ||
      dx.code.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  return {
    // State
    selectedDiagnoses,
    patientHistory,
    favorites,
    recentlyUsed,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    
    // Actions
    addDiagnosis,
    removeDiagnosis,
    updateDiagnosis,
    toggleFavorite,
    clearDiagnoses,
    manualSave,
    loadPatientHistory,
    loadEncounterDiagnoses,
    searchDiagnoses,
    
    // Utilities
    getStatistics,
    
    // Setters (for direct control when needed)
    setSelectedDiagnoses: (diagnoses: DiagnosisItem[]) => {
      setSelectedDiagnoses(diagnoses);
      setHasUnsavedChanges(true);
    }
  };
};