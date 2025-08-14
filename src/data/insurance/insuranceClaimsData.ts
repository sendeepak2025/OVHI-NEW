
import { InsuranceClaim } from '../types/medicalTypes';

export const insuranceClaimsData: InsuranceClaim[] = [
  {
    id: 'CLM001',
    date: '2025-02-15',
    service: 'Annual Physical',
    provider: 'Dr. Sarah Johnson',
    billed: '$350.00',
    insurance: '$280.00',
    patient: '$70.00',
    status: 'Paid',
    claimNumber: 'INS12345678'
  },
  {
    id: 'CLM002',
    date: '2025-01-22',
    service: 'Lab Work - CBC, Metabolic Panel',
    provider: 'City General Lab',
    billed: '$220.00',
    insurance: '$176.00',
    patient: '$44.00',
    status: 'Paid',
    claimNumber: 'INS23456789'
  },
  {
    id: 'CLM003',
    date: '2024-12-10',
    service: 'Cardiology Consultation',
    provider: 'Dr. Amanda Cardiologist',
    billed: '$450.00',
    insurance: '$360.00',
    patient: '$90.00',
    status: 'Paid',
    claimNumber: 'INS34567890'
  },
  {
    id: 'CLM004',
    date: '2024-11-05',
    service: 'MRI - Left Knee',
    provider: 'Metro Imaging Center',
    billed: '$1,200.00',
    insurance: '$960.00',
    patient: '$240.00',
    status: 'Processing',
    claimNumber: 'INS45678901'
  }
];
