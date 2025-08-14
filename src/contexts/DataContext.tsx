
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { patientData } from '@/data/patientData';
import { appointmentData } from '@/data/appointments/appointmentData';
import { medicationData } from '@/data/medication/medicationData';
import { vitalSignsData } from '@/data/vitals/vitalSignsData';
import { medicalRecordsData } from '@/data/records/medicalRecordsData';
import { carePlanTasksData } from '@/data/carePlan/carePlanTasksData';
import { insuranceClaimsData } from '@/data/insurance/insuranceClaimsData';
import { referralsData } from '@/data/referrals/referralsData';

interface DataContextType {
  patients: any[];
  appointments: any[];
  medications: any[];
  vitalSigns: any[];
  medicalRecords: any[];
  carePlanTasks: any[];
  insuranceClaims: any[];
  referrals: any[];
  providers: any[];
  locations: any[];
  addPatient: (patient: any) => void;
  updatePatient: (patient: any) => void;
  getPatientById: (id: string) => any;
  getVitalsForPatient: (patientId: string) => any[];
  getMedicalRecordsForPatient: (patientId: string) => any[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState(patientData);
  const [appointments] = useState(appointmentData);
  const [medications] = useState(medicationData);
  const [vitalSigns] = useState(vitalSignsData);
  const [medicalRecords] = useState(medicalRecordsData);
  const [carePlanTasks] = useState(carePlanTasksData);
  const [insuranceClaims] = useState(insuranceClaimsData);
  const [referrals] = useState(referralsData);
  const [providers] = useState([]);
  const [locations] = useState([]);

  const addPatient = (patient: any) => {
    setPatients(prev => [...prev, patient]);
  };

  const updatePatient = (updatedPatient: any) => {
    setPatients(prev => prev.map(patient => 
      patient.id === updatedPatient.id ? updatedPatient : patient
    ));
  };

  const getPatientById = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  const getVitalsForPatient = (patientId: string) => {
    return vitalSigns.filter((vital: any) => vital.patientId === patientId);
  };

  const getMedicalRecordsForPatient = (patientId: string) => {
    return medicalRecords.filter((record: any) => record.patientId === patientId);
  };

  const value = {
    patients,
    appointments,
    medications,
    vitalSigns,
    medicalRecords,
    carePlanTasks,
    insuranceClaims,
    referrals,
    providers,
    locations,
    addPatient,
    updatePatient,
    getPatientById,
    getVitalsForPatient,
    getMedicalRecordsForPatient,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
