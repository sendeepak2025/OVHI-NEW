
import { 
  PatientType, 
  Medication, 
  Appointment, 
  VitalSigns, 
  MedicalRecord,
  ProviderType,
  LocationType
} from '@/types/dataTypes';

/**
 * Utility functions to manage data relationships across the application
 */

// Get complete patient information with all related data
export const getCompletePatientData = (
  patientId: string, 
  patientList: PatientType[], 
  medicationList: Medication[], 
  appointmentList: Appointment[],
  vitalsList: VitalSigns[],
  recordsList: MedicalRecord[]
) => {
  const patient = patientList.find(p => p.id === patientId);
  
  if (!patient) return null;
  
  // Get related data
  const medications = medicationList.filter(med => med.patientId === patientId);
  const appointments = appointmentList.filter(apt => apt.patientId === patientId);
  const vitals = vitalsList.filter(vital => vital.patientId === patientId);
  const records = recordsList.filter(record => record.patientId === patientId);
  
  // Return consolidated patient data
  return {
    ...patient,
    relatedData: {
      medications,
      appointments,
      vitals,
      records
    }
  };
};

// Get complete appointment data with related patient and provider
export const getCompleteAppointmentData = (
  appointmentId: string,
  appointmentList: Appointment[],
  patientList: PatientType[],
  providerList: ProviderType[],
  locationList: LocationType[]
) => {
  const appointment = appointmentList.find(apt => apt.id === appointmentId);
  
  if (!appointment) return null;
  
  // Get related data
  const patient = patientList.find(p => p.id === appointment.patientId);
  const provider = providerList.find(p => p.id === appointment.providerId);
  const location = locationList.find(l => l.id === appointment.locationId);
  
  // Return consolidated appointment data
  return {
    ...appointment,
    patient,
    provider,
    location
  };
};

// Get complete telehealth session data
export const getCompleteTelehealthData = (
  sessionId: string,
  appointmentList: Appointment[],
  patientList: PatientType[],
  providerList: ProviderType[]
) => {
  const appointment = appointmentList.find(apt => apt.id === sessionId && apt.method === 'Telehealth');
  
  if (!appointment) return null;
  
  // Get related data
  const patient = patientList.find(p => p.id === appointment.patientId);
  const provider = providerList.find(p => p.id === appointment.providerId);
  
  // Return consolidated telehealth data
  return {
    sessionId,
    appointment,
    patient,
    provider,
    status: appointment.status,
    scheduledTime: appointment.time,
    scheduledDate: appointment.date
  };
};

// Get complete medication data with patient and prescriber
export const getCompleteMedicationData = (
  medicationId: string,
  medicationList: Medication[],
  patientList: PatientType[],
  providerList: ProviderType[]
) => {
  const medication = medicationList.find(med => med.id === medicationId);
  
  if (!medication) return null;
  
  // Get related data
  const patient = patientList.find(p => p.id === medication.patientId);
  const prescriber = providerList.find(p => p.name === medication.prescribedBy);
  
  // Return consolidated medication data
  return {
    ...medication,
    patient,
    prescriber
  };
};

// Check if a patient has upcoming telehealth appointments
export const hasUpcomingTelehealthAppointments = (
  patientId: string,
  appointmentList: Appointment[]
) => {
  const now = new Date();
  const upcomingAppointments = appointmentList.filter(apt => 
    apt.patientId === patientId &&
    apt.method === 'Telehealth' &&
    apt.status !== 'Completed' &&
    new Date(apt.date + ' ' + apt.time) > now
  );
  
  return upcomingAppointments.length > 0;
};

// Associate medical record with appointment
export const associateMedicalRecordWithAppointment = (
  recordId: string,
  appointmentId: string,
  medicalRecords: MedicalRecord[],
  appointments: Appointment[]
) => {
  const record = medicalRecords.find(r => r.id === recordId);
  const appointment = appointments.find(a => a.id === appointmentId);
  
  if (!record || !appointment) return null;
  
  // In a real app, we would update the database
  return {
    ...record,
    appointmentId,
    date: appointment.date,
    provider: appointment.provider
  };
};

// Associate prescription with telehealth session
export const associatePrescriptionWithTelehealth = (
  medicationId: string,
  telehealthSessionId: string,
  medications: Medication[],
  appointments: Appointment[]
) => {
  const medication = medications.find(m => m.id === medicationId);
  const session = appointments.find(a => a.id === telehealthSessionId && a.method === 'Telehealth');
  
  if (!medication || !session) return null;
  
  // In a real app, we would update the database
  return {
    ...medication,
    prescriptionSource: 'Telehealth',
    telehealthSessionId,
    datePrescribed: session.date
  };
};
