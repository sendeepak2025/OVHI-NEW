
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  status: string;
  prescribedBy: string;
  patientId?: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  provider: string;
  status: string;
  notes: string;
  method: string;
  providerId?: string;
  patientId?: string;
  locationId?: string;
  reason?: string;
}

export interface VitalSigns {
  date: string;
  bp: string;
  pulse: number;
  temp: number;
  weight: number;
  height: string;
  bmi: number;
  respiratory: number;
  o2: number;
  patientId?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  provider: string;
  description: string;
  details: any;
  file: string;
  patientId?: string;
}

export interface InsuranceClaim {
  id: string;
  date: string;
  service: string;
  provider: string;
  billed: string;
  insurance: string;
  patient: string;
  status: string;
  claimNumber: string;
}

export interface Referral {
  id: string;
  date: string;
  specialistType: string;
  specialist: string;
  reason: string;
  status: string;
  referredBy: string;
  notes?: string;
  appointmentDate?: string;
  authorizationNumber?: string;
  sessionCount?: string;
}

export interface CarePlanTask {
  id: string;
  task: string;
  frequency: string;
  status: string;
  assigned: string;
  goal: string;
  type: string;
  completed?: string;
  due?: string;
  notes?: string;
  progress?: number;
  completedDate?: string | null;
}
