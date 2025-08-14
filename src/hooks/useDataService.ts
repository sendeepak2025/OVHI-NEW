
import { useData } from '@/contexts/DataContext';
import {
  getCompletePatientData,
  getCompleteAppointmentData,
  getCompleteTelehealthData,
  getCompleteMedicationData,
  hasUpcomingTelehealthAppointments,
  associateMedicalRecordWithAppointment,
  associatePrescriptionWithTelehealth
} from '@/utils/dataRelationships';
import { 
  MedicalRecord, 
  VitalSigns,
  Appointment,
  Medication
} from '@/types/dataTypes';

export const useDataService = () => {
  const dataContext = useData();
  
  // Get complete patient data with all related information
  const getPatientWithRelatedData = (patientId: string) => {
    return getCompletePatientData(
      patientId,
      dataContext.patients,
      dataContext.medications as unknown as Medication[], // Type casting to resolve mismatch
      dataContext.appointments as unknown as Appointment[], // Type casting to resolve mismatch
      dataContext.getVitalsForPatient(patientId) as unknown as VitalSigns[], // Type casting to resolve mismatch
      dataContext.getMedicalRecordsForPatient(patientId) as unknown as MedicalRecord[] // Type casting to resolve mismatch
    );
  };
  
  // Get complete appointment data with related entities
  const getAppointmentWithRelatedData = (appointmentId: string) => {
    return getCompleteAppointmentData(
      appointmentId,
      dataContext.appointments as unknown as Appointment[], // Type casting to resolve mismatch
      dataContext.patients,
      dataContext.providers,
      dataContext.locations
    );
  };
  
  // Get telehealth session with related data
  const getTelehealthSessionWithRelatedData = (sessionId: string) => {
    return getCompleteTelehealthData(
      sessionId,
      dataContext.appointments as unknown as Appointment[], // Type casting to resolve mismatch
      dataContext.patients,
      dataContext.providers
    );
  };
  
  // Get medication with related data
  const getMedicationWithRelatedData = (medicationId: string) => {
    return getCompleteMedicationData(
      medicationId,
      dataContext.medications as unknown as Medication[], // Type casting to resolve mismatch
      dataContext.patients,
      dataContext.providers
    );
  };
  
  // Check if a patient has upcoming telehealth appointments
  const checkForUpcomingTelehealthAppointments = (patientId: string) => {
    return hasUpcomingTelehealthAppointments(patientId, dataContext.appointments as unknown as Appointment[]); // Type casting to resolve mismatch
  };
  
  // Link medical record to an appointment
  const linkMedicalRecordToAppointment = (recordId: string, appointmentId: string) => {
    return associateMedicalRecordWithAppointment(
      recordId,
      appointmentId,
      dataContext.getMedicalRecordsForPatient("") as unknown as MedicalRecord[], // Type casting to resolve mismatch
      dataContext.appointments as unknown as Appointment[] // Type casting to resolve mismatch
    );
  };
  
  // Link prescription to telehealth session
  const linkPrescriptionToTelehealthSession = (medicationId: string, sessionId: string) => {
    return associatePrescriptionWithTelehealth(
      medicationId,
      sessionId,
      dataContext.medications as unknown as Medication[], // Type casting to resolve mismatch
      dataContext.appointments as unknown as Appointment[] // Type casting to resolve mismatch
    );
  };

  return {
    // Original context methods
    ...dataContext,
    
    // Enhanced data relationships
    getPatientWithRelatedData,
    getAppointmentWithRelatedData,
    getTelehealthSessionWithRelatedData,
    getMedicationWithRelatedData,
    checkForUpcomingTelehealthAppointments,
    linkMedicalRecordToAppointment,
    linkPrescriptionToTelehealthSession
  };
};
