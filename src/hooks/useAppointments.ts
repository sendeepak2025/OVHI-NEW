// Custom hook for appointment management with mock API
// Replace API calls with real Node.js/MySQL endpoints later

import { useState, useEffect } from 'react';
import { appointmentsApi, showApiLoading, hideApiLoading } from '@/services/mockApi';
import { toast } from 'sonner';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await appointmentsApi.getAll();
      
      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        setError(response.error || 'Failed to fetch appointments');
        toast.error(response.error || 'Failed to fetch appointments');
      }
    } catch (err) {
      const errorMessage = 'Network error - unable to fetch appointments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create new appointment
  const createAppointment = async (appointmentData: any): Promise<boolean> => {
    showApiLoading('Creating appointment...');
    
    try {
      const response = await appointmentsApi.create(appointmentData);
      
      if (response.success) {
        toast.success('Appointment created successfully');
        await fetchAppointments(); // Refresh the list
        return true;
      } else {
        toast.error(response.error || 'Failed to create appointment');
        return false;
      }
    } catch (err) {
      toast.error('Network error - unable to create appointment');
      return false;
    } finally {
      hideApiLoading();
    }
  };

  // Update existing appointment
  const updateAppointment = async (id: string, appointmentData: any): Promise<boolean> => {
    showApiLoading('Updating appointment...');
    
    try {
      const response = await appointmentsApi.update(id, appointmentData);
      
      if (response.success) {
        toast.success('Appointment updated successfully');
        await fetchAppointments(); // Refresh the list
        return true;
      } else {
        toast.error(response.error || 'Failed to update appointment');
        return false;
      }
    } catch (err) {
      toast.error('Network error - unable to update appointment');
      return false;
    } finally {
      hideApiLoading();
    }
  };

  // Delete appointment
  const deleteAppointment = async (id: string): Promise<boolean> => {
    showApiLoading('Deleting appointment...');
    
    try {
      const response = await appointmentsApi.delete(id);
      
      if (response.success) {
        toast.success('Appointment deleted successfully');
        await fetchAppointments(); // Refresh the list
        return true;
      } else {
        toast.error(response.error || 'Failed to delete appointment');
        return false;
      }
    } catch (err) {
      toast.error('Network error - unable to delete appointment');
      return false;
    } finally {
      hideApiLoading();
    }
  };

  // Load appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};