// Core data types for the application

// Patient type
export interface PatientType {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  // Other patient fields...
}

// Updated Patient interface to match the API response
export interface Patient {
  patientId: number | string; // Allow both types for compatibility
  firstname?: string;
  middlename?: string;
  lastname?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  gender?: string;
  ethnicity?: string;
  lastVisit?: string;
  emergencyContact?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bloodPressure?: number;
  heartRate?: number;
  temperature?: number;
  status?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  service_type?: any;
  patientService?: string | number[];
  enrollDate?: string;
  preferredLanguage?: string;
  allergies?: Array<{
    allergen: string;
    category: string;
    reaction: string;
    severity?: string;
  }>;
  insurance?: Array<{
    type: "primary" | "secondary";
    company: string;
    plan: string;
    policyNumber: string;
    groupNumber: string;
    effectiveDate: string;
    expirationDate: string;
    patient_insurance_id?: number;
  }>;
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    refills: string;
    startDate: string;
    endDate?: string;
    status: string;
    id?: number;
  }>;
  diagnosis?: Array<{
    id: string;
    date: string;
    icd10: string;
    diagnosis: string;
    status: string;
    type: string;
  }>;
  notes?: Array<{ note: string; created?: string }> | string;
  immunizations?: Array<{
    vaccine: string;
    date: string;
    provider: string;
  }>;
  
  created?: string;
}

// Appointment type
export interface AppointmentType {
  id: string;
  patientId: string;
  providerId: string;
  locationId: string;
  date: string;
  time: string;
  type: string;
  method: string;
  status: string;
  notes?: string;
  duration: string;
  hasBilling: boolean;
  provider?: string; // Added for compatibility
}

// Provider type
export interface ProviderType {
  id: string;
  name: string;
  role: string;
  specialty: string;
  color: string;
  availability?: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
  };
}

// Location type
export interface LocationType {
  id: string;
  name: string;
  address: string;
  phone: string;
  color: string;
}

// Medication type
export interface MedicationType {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  refills: number;
  instructions: string;
  status: string;
}

// Medical record type
export interface MedicalRecordType {
  id: string;
  patientId: string;
  date: string;
  type: string;
  provider: string;
  description: string;
  attachmentUrl?: string;
  appointmentId?: string;
  details?: any;
  file?: string;
}

// Vital signs type
export interface VitalSignsType {
  id?: string;
  patientId: string;
  date: string;
  bp: string;
  pulse: number;
  temp: number;
  respRate: number;
  o2Sat: number;
  height: number;
  weight: number;
  bmi: number;
  respiratory?: number;
  o2?: number;
}

// Telehealth session type
export interface TelehealthSessionType {
  id: string;
  appointmentId: string;
  patientId: string;
  providerId: string;
  scheduledTime: string;
  scheduledDate: string;
  status: string;
  duration?: number;
  transcription?: string;
  summary?: string;
}

// Billing record type
export interface BillingRecordType {
  id: string;
  appointmentId: string;
  patientId: string;
  providerId: string;
  date: string;
  amount: number;
  insuranceBilled: boolean;
  insuranceProvider?: string;
  copayAmount?: number;
  status: string;
  codes: string[];
}

// Relationship types
export interface MedicationTelehealthRelation {
  medicationId: string;
  telehealthSessionId: string;
  prescribedDuring: boolean;
}

export interface AppointmentMedicalRecordRelation {
  appointmentId: string;
  recordId: string;
  createdDuring: boolean;
}

export interface PatientProviderRelation {
  patientId: string;
  providerId: string;
  relationshipType: "primary" | "specialist" | "consulting";
  startDate: string;
  endDate?: string;
}

// Export additional types from medicalData.ts to make them compatible with our data context
export interface Medication {
  id: string;
  patientId: string; // Making this required to match usage in DataContext
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  status: string;
  prescribedBy: string;
  instructions?: string;
  refills?: number;
}

export interface Appointment {
  id: string;
  patientId: string; // Making this required to match usage in DataContext
  providerId: string; // Making this required to match usage in DataContext
  locationId: string; // Making this required to match usage in DataContext
  date: string;
  time: string;
  type: string;
  provider: string;
  status: string;
  notes: string;
  method: string;
  duration?: string;
  hasBilling?: boolean;
}

export interface VitalSigns {
  id?: string;
  patientId: string; // Making this required to match usage in DataContext
  date: string;
  bp: string;
  pulse: number;
  temp: number;
  weight: number;
  height: string;
  bmi: number;
  respiratory: number;
  o2: number;
  respRate?: number;
  o2Sat?: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string; // Making this required to match usage in DataContext
  date: string;
  type: string;
  provider: string;
  description: string;
  details: any;
  file: string;
  attachmentUrl?: string;
  appointmentId?: string;
}

// Patient timing data for CCM billing
export interface PatientTiming {
  totalMinutes: number;
  totalAmount: number;
  entries: Array<{
    id: string;
    date: string;
    duration: number;
    activity: string;
    billable: boolean;
    provider: string;
    notes?: string;
  }>;
}

// Task interface with duration property
export interface Task {
  id: string;
  task_description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_to: string;
  patient_id: string;
  due_date: string;
  category: string;
  type: string;
  duration: number;
  notes?: string;
  completed?: boolean;
  program_type?: string;
}

// SmartIntake field interface
export interface SmartIntakeField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

// Insurance entry type
export interface InsuranceEntry {
  type: "primary" | "secondary";
  company: string;
  plan: string;
  policyNumber: string;
  groupNumber: string;
  effectiveDate: string;
  expirationDate: string;
  patient_insurance_id?: number;
}

// CCM Task Tracking Props
export interface CCMTaskTrackingProps {
  patientId: string;
  providerId: string;
  patientName?: string;
  onTimeUpdate?: (minutes: number) => void;
  childComponent?: React.ReactNode;
}

// Encounter types
export interface Encounter {
  id: string;
  patient_id: string;
  provider_id: string;
  template_id: string;
  date: string;
  type: string;
  status: string;
  notes?: string;
  created?: string;
  updated: string;
}

// Enhanced encounter data type for tables
export interface EncounterData {
  _id: string;
  patient_id: any;
  provider_id: string;
  template_id: string;
  provider: any;
  templateId?: {
    template_id: number;
    template_name: string;
  };
  encounter_id: any;
  encounter_type: string;
  reason_for_visit: string;
  notes: string;
  procedure_codes: string;
  diagnosis_codes: string;
  follow_up_plan: string;
  status: "pending" | "completed" | "cancelled";
  created: string;
  updated: string;
  updatedAt: string;
}

// Enhanced encounter data type for the patient encounter component
export interface PatientEncounterData {
  _id: string;
  patient_id: any;
  provider_id: string;
  template_id: string;
  provider: any;
  templateId?: {
    template_id: number;
    template_name: string;
  };
  encounter_id: any;
  encounter_type: string;
  reason_for_visit: string;
  notes: string;
  procedure_codes: string;
  diagnosis_codes: string;
  follow_up_plan: string;
  status: "pending" | "completed" | "cancelled";
  created: string;
  updated: string;
  updatedAt: string;
}
