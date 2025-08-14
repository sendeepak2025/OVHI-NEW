
import { Appointment } from '../types/medicalTypes';

export const appointmentData: Appointment[] = [
  {
    id: '1',
    date: '2025-03-20',
    time: '10:30 AM',
    type: 'Follow-up',
    provider: 'Dr. Sarah Johnson',
    providerId: 'prov-1',
    status: 'Scheduled',
    notes: 'Regular follow-up for hypertension',
    method: 'In-person',
    patientId: '1',
    locationId: 'loc-1',
  },
  {
    id: '2',
    date: '2025-02-15',
    time: '2:00 PM',
    type: 'Consultation',
    provider: 'Dr. Sarah Johnson',
    providerId: 'prov-1',
    status: 'Completed',
    notes: 'Initial consultation for headaches',
    method: 'Telehealth',
    patientId: '1',
    locationId: 'loc-2',
  },
  {
    id: '3',
    date: '2025-01-10',
    time: '11:15 AM',
    type: 'Lab Review',
    provider: 'Dr. Sarah Johnson',
    providerId: 'prov-1',
    status: 'Completed',
    notes: 'Review of annual blood work',
    method: 'In-person',
    patientId: '2',
    locationId: 'loc-1',
  },
];
