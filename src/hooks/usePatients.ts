// Custom hook for patient management with mock API
// Replace API calls with real Node.js/MySQL endpoints later

import { useState, useEffect } from 'react';
import { patientsApi, showApiLoading, hideApiLoading } from '@/services/mockApi';
import { toast } from 'sonner';

export const usePatients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all patients
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await patientsApi.getAll();
      
      if (response.success && response.data) {
        setPatients(response.data);
      } else {
        setError(response.error || 'Failed to fetch patients');
        toast.error(response.error || 'Failed to fetch patients');
      }
    } catch (err) {
      const errorMessage = 'Network error - unable to fetch patients';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create new patient
  const createPatient = async (patientData: any): Promise<boolean> => {
    showApiLoading('Creating patient...');
    
    try {
      const response = await patientsApi.create(patientData);
      
      if (response.success) {
        toast.success('Patient created successfully');
        await fetchPatients(); // Refresh the list
        return true;
      } else {
        toast.error(response.error || 'Failed to create patient');
        return false;
      }
    } catch (err) {
      toast.error('Network error - unable to create patient');
      return false;
    } finally {
      hideApiLoading();
    }
  };

  // Load patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient
  };
};