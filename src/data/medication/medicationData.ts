
import { Medication } from '../types/medicalTypes';

export const medicationData: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2025-01-15',
    endDate: null,
    status: 'Active',
    prescribedBy: 'Dr. Sarah Johnson',
    patientId: '1',
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2024-11-10',
    endDate: null,
    status: 'Active',
    prescribedBy: 'Dr. Sarah Johnson',
    patientId: '1',
  },
  {
    id: '3',
    name: 'Simvastatin',
    dosage: '20mg',
    frequency: 'Once daily, at bedtime',
    startDate: '2024-12-05',
    endDate: null,
    status: 'Active',
    prescribedBy: 'Dr. Sarah Johnson',
    patientId: '2',
  },
];
