
import { Referral } from '../types/medicalTypes';

export const referralsData: Referral[] = [
  {
    id: 'REF001',
    date: '2025-02-20',
    specialistType: 'Cardiology',
    specialist: 'Dr. Amanda Cardiologist',
    reason: 'Evaluation of heart palpitations',
    status: 'Completed',
    referredBy: 'Dr. Sarah Johnson',
    notes: 'Follow-up in 3 months recommended'
  },
  {
    id: 'REF002',
    date: '2025-03-10',
    specialistType: 'Endocrinology',
    specialist: 'Dr. Robert Endocrine',
    reason: 'Diabetes management review',
    status: 'Scheduled',
    referredBy: 'Dr. Sarah Johnson',
    appointmentDate: '2025-03-25',
    authorizationNumber: 'AUTH987654'
  },
  {
    id: 'REF003',
    date: '2025-01-15',
    specialistType: 'Physical Therapy',
    specialist: 'CityCenter Physical Therapy',
    reason: 'Lower back pain management',
    status: 'In Progress',
    referredBy: 'Dr. Sarah Johnson',
    sessionCount: '6 of 12 completed',
    authorizationNumber: 'AUTH876543'
  }
];
