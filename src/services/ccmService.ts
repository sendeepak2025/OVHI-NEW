import { v4 as uuidv4 } from 'uuid';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  contactNumber: string;
  email: string;
  address: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  diagnosis?: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
  };
  appointments: string[];
  carePlans: string[];
  notes: string;
}

export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  contactNumber: string;
  email: string;
  address: string;
  patients: string[];
  appointments: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  date: Date;
  time: string;
  type: 'checkup' | 'consultation' | 'therapy' | 'other';
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
  };
  billingCode: string;
  billingAmount: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: Date;
  endDate: Date | null;
  prescriptionId: string;
  patientId: string;
  providerId: string;
  notes: string;
}

export interface CarePlan {
  id: string;
  patientId: string;
  providerId: string;
  startDate: Date;
  endDate: Date | null;
  goals: string[];
  interventions: string[];
  notes: string;
  status: 'active' | 'inactive' | 'completed';
}

export interface PatientRiskScore {
  id: string;
  patientId: string;
  scoreType: string;
  overallScore: number;
  score: number;
  maxScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high' | 'critical';
  factors: {
    factor: string;
    weight: number;
    description: string;
  }[];
  lastUpdated: Date;
  recommendations: string[];
}

export interface QualityMeasure {
  id: string;
  patientId: string;
  measureName: string;
  measureType: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  isCompliant: boolean;
  lastAssessed: Date;
  nextDue: Date;
}

export interface EnhancedQualityMeasure extends QualityMeasure {
  source: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EnhancedClinicalAlert {
  id: string;
  patientId: string;
  alertType: 'medication' | 'lab' | 'vitals' | 'appointment' | 'quality_measure';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface CCMAssessment {
  id: string;
  patientId: string;
  providerId: string;
  assessmentDate: Date;
  assessmentType: string;
  findings: string;
  recommendations: string;
  nextReviewDate: Date;
}

export interface CCMSuperbill {
  id: string;
  patientId: string;
  providerId: string;
  serviceDate: Date;
  cptCodes: string[];
  timeSpent: number;
  notes: string;
}

export interface CareCoordinationActivity {
  id: string;
  patientId: string;
  type: 'medication_review' | 'specialist_consult' | 'lab_follow_up' | 'patient_education' | 'care_plan_update' | 'family_engagement' | 'discharge_planning';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: Date;
  assignedTo: string;
  assignedBy: string;
  notes: string;
  timeSpent?: number;
  createdAt: Date;
  updatedAt: Date;
  timeTrackingMode?: 'automated' | 'manual';
}

export interface CCMTimeEntry {
  id: string;
  patientId: string;
  providerId: string;
  activityType: 'care_coordination' | 'medication_management' | 'remote_monitoring' | 'other';
  description: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // Duration in minutes
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  notes?: string;
}

class CCMService {
  private patients: Map<string, Patient> = new Map();
  private providers: Map<string, Provider> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private medications: Map<string, Medication> = new Map();
  private carePlans: Map<string, CarePlan> = new Map();
  private riskScores: Map<string, PatientRiskScore> = new Map();
  private careActivities: Map<string, CareCoordinationActivity[]> = new Map();
  private timeEntries: Map<string, CCMTimeEntry> = new Map();
  private qualityMeasures: Map<string, EnhancedQualityMeasure[]> = new Map();
  private clinicalAlerts: Map<string, EnhancedClinicalAlert[]> = new Map();
  private assessments: Map<string, CCMAssessment[]> = new Map();
  private superbills: Map<string, CCMSuperbill[]> = new Map();

  constructor() {
    // Initialize with some dummy data
    this.seedData();
  }

  private seedData() {
    // Create dummy patients
    const patient1: Patient = {
      id: 'patient1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1980-01-01'),
      gender: 'male',
      contactNumber: '123-456-7890',
      email: 'john.doe@example.com',
      address: '123 Main St',
      insuranceProvider: 'Blue Cross',
      insurancePolicyNumber: '12345',
      medicalHistory: ['Hypertension', 'Diabetes'],
      allergies: ['Penicillin'],
      currentMedications: ['Lisinopril', 'Metformin'],
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        weight: 180,
        height: 70,
      },
      appointments: [],
      carePlans: [],
      notes: 'Patient is doing well.',
    };

    const patient2: Patient = {
      id: 'patient2',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'female',
      contactNumber: '987-654-3210',
      email: 'jane.smith@example.com',
      address: '456 Oak Ave',
      insuranceProvider: 'United Health',
      insurancePolicyNumber: '67890',
      medicalHistory: ['Asthma', 'Anxiety'],
      allergies: ['Sulfa'],
      currentMedications: ['Albuterol', 'Sertraline'],
      vitalSigns: {
        bloodPressure: '110/70',
        heartRate: 68,
        temperature: 98.2,
        weight: 150,
        height: 64,
      },
      appointments: [],
      carePlans: [],
      notes: 'Patient reports occasional anxiety.',
    };

    this.patients.set(patient1.id, patient1);
    this.patients.set(patient2.id, patient2);

    // Create dummy providers
    const provider1: Provider = {
      id: 'provider1',
      firstName: 'Alice',
      lastName: 'Johnson',
      specialty: 'Cardiologist',
      contactNumber: '555-123-4567',
      email: 'alice.johnson@example.com',
      address: '789 Pine St',
      patients: [patient1.id],
      appointments: [],
    };

    const provider2: Provider = {
      id: 'provider2',
      firstName: 'Bob',
      lastName: 'Williams',
      specialty: 'Endocrinologist',
      contactNumber: '555-987-6543',
      email: 'bob.williams@example.com',
      address: '321 Elm St',
      patients: [patient2.id],
      appointments: [],
    };

    this.providers.set(provider1.id, provider1);
    this.providers.set(provider2.id, provider2);

    // Create dummy appointments
    const appointment1: Appointment = {
      id: 'appointment1',
      patientId: patient1.id,
      providerId: provider1.id,
      date: new Date('2024-03-15'),
      time: '10:00 AM',
      type: 'checkup',
      notes: 'Routine checkup.',
      status: 'scheduled',
      vitals: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        weight: 180,
      },
      billingCode: '99214',
      billingAmount: 150,
    };

    const appointment2: Appointment = {
      id: 'appointment2',
      patientId: patient2.id,
      providerId: provider2.id,
      date: new Date('2024-03-20'),
      time: '02:00 PM',
      type: 'consultation',
      notes: 'Consultation for anxiety.',
      status: 'scheduled',
      vitals: {
        bloodPressure: '110/70',
        heartRate: 68,
        temperature: 98.2,
        weight: 150,
      },
      billingCode: '99203',
      billingAmount: 200,
    };

    this.appointments.set(appointment1.id, appointment1);
    this.appointments.set(appointment2.id, appointment2);

    // Create dummy medications
    const medication1: Medication = {
      id: 'medication1',
      name: 'Lisinopril',
      dosage: '20mg',
      frequency: 'Once daily',
      route: 'Oral',
      startDate: new Date('2023-01-01'),
      endDate: null,
      prescriptionId: 'prescription1',
      patientId: patient1.id,
      providerId: provider1.id,
      notes: 'For hypertension.',
    };

    const medication2: Medication = {
      id: 'medication2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      route: 'Oral',
      startDate: new Date('2023-01-01'),
      endDate: null,
      prescriptionId: 'prescription2',
      patientId: patient1.id,
      providerId: provider1.id,
      notes: 'For diabetes.',
    };

    this.medications.set(medication1.id, medication1);
    this.medications.set(medication2.id, medication2);

    // Create dummy care plans
    const carePlan1: CarePlan = {
      id: 'carePlan1',
      patientId: patient1.id,
      providerId: provider1.id,
      startDate: new Date('2023-01-01'),
      endDate: null,
      goals: ['Control blood pressure', 'Manage blood sugar'],
      interventions: ['Medication adherence', 'Dietary changes'],
      notes: 'Care plan for hypertension and diabetes.',
      status: 'active',
    };

    const carePlan2: CarePlan = {
      id: 'carePlan2',
      patientId: patient2.id,
      providerId: provider2.id,
      startDate: new Date('2023-01-01'),
      endDate: null,
      goals: ['Reduce anxiety', 'Improve asthma control'],
      interventions: ['Therapy', 'Medication adherence'],
      notes: 'Care plan for anxiety and asthma.',
      status: 'active',
    };

    this.carePlans.set(carePlan1.id, carePlan1);
    this.carePlans.set(carePlan2.id, carePlan2);

    // Create dummy risk scores
    const riskScore1: PatientRiskScore = {
      id: 'risk1',
      patientId: patient1.id,
      scoreType: 'Clinical Risk',
      overallScore: 75,
      score: 75,
      maxScore: 100,
      riskLevel: 'high',
      factors: [
        { factor: 'Medication Adherence', weight: 60, description: 'Patient medication compliance' },
        { factor: 'Clinical Complexity', weight: 80, description: 'Multiple chronic conditions' },
        { factor: 'Social Determinants', weight: 70, description: 'Social risk factors' },
        { factor: 'Recent Utilization', weight: 90, description: 'Healthcare usage patterns' }
      ],
      lastUpdated: new Date(),
      recommendations: ['Increase medication adherence', 'Address social determinants'],
    };

    const riskScore2: PatientRiskScore = {
      id: 'risk2',
      patientId: patient2.id,
      scoreType: 'Clinical Risk',
      overallScore: 45,
      score: 45,
      maxScore: 100,
      riskLevel: 'medium',
      factors: [
        { factor: 'Medication Adherence', weight: 80, description: 'Good medication compliance' },
        { factor: 'Clinical Complexity', weight: 50, description: 'Moderate complexity' },
        { factor: 'Social Determinants', weight: 40, description: 'Low social risk' },
        { factor: 'Recent Utilization', weight: 60, description: 'Normal usage patterns' }
      ],
      lastUpdated: new Date(),
      recommendations: ['Improve medication adherence', 'Address social determinants'],
    };

    this.riskScores.set(riskScore1.patientId, riskScore1);
    this.riskScores.set(riskScore2.patientId, riskScore2);
  }

  // Patient CRUD operations
  getPatient(id: string): Patient | undefined {
    return this.patients.get(id);
  }

  getAllPatients(): Patient[] {
    return Array.from(this.patients.values());
  }

  createPatient(patient: Patient): void {
    this.patients.set(patient.id, patient);
  }

  updatePatient(id: string, updates: Partial<Patient>): void {
    const patient = this.patients.get(id);
    if (patient) {
      this.patients.set(id, { ...patient, ...updates });
    }
  }

  deletePatient(id: string): void {
    this.patients.delete(id);
  }

  // Provider CRUD operations
  getProvider(id: string): Provider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): Provider[] {
    return Array.from(this.providers.values());
  }

  createProvider(provider: Provider): void {
    this.providers.set(provider.id, provider);
  }

  updateProvider(id: string, updates: Partial<Provider>): void {
    const provider = this.providers.get(id);
    if (provider) {
      this.providers.set(id, { ...provider, ...updates });
    }
  }

  deleteProvider(id: string): void {
    this.providers.delete(id);
  }

  // Appointment CRUD operations
  getAppointment(id: string): Appointment | undefined {
    return this.appointments.get(id);
  }

  getAllAppointments(): Appointment[] {
    return Array.from(this.appointments.values());
  }

  createAppointment(appointment: Appointment): void {
    this.appointments.set(appointment.id, appointment);
  }

  updateAppointment(id: string, updates: Partial<Appointment>): void {
    const appointment = this.appointments.get(id);
    if (appointment) {
      this.appointments.set(id, { ...appointment, ...updates });
    }
  }

  deleteAppointment(id: string): void {
    this.appointments.delete(id);
  }

  // Medication CRUD operations
  getMedication(id: string): Medication | undefined {
    return this.medications.get(id);
  }

  getAllMedications(): Medication[] {
    return Array.from(this.medications.values());
  }

  createMedication(medication: Medication): void {
    this.medications.set(medication.id, medication);
  }

  updateMedication(id: string, updates: Partial<Medication>): void {
    const medication = this.medications.get(id);
    if (medication) {
      this.medications.set(id, { ...medication, ...updates });
    }
  }

  deleteMedication(id: string): void {
    this.medications.delete(id);
  }

  // Care Plan CRUD operations
  getCarePlan(id: string): CarePlan | undefined {
    return this.carePlans.get(id);
  }

  getAllCarePlans(): CarePlan[] {
    return Array.from(this.carePlans.values());
  }

  createCarePlan(carePlan: CarePlan): void {
    this.carePlans.set(carePlan.id, carePlan);
  }

  updateCarePlan(id: string, updates: Partial<CarePlan>): void {
    const carePlan = this.carePlans.get(id);
    if (carePlan) {
      this.carePlans.set(id, { ...carePlan, ...updates });
    }
  }

  deleteCarePlan(id: string): void {
    this.carePlans.delete(id);
  }

  // Risk Assessment Methods
  calculatePatientRiskScore(patientId: string): PatientRiskScore {
    const patient = this.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Dummy risk calculation logic
    let overallScore = 50;
    if (patient.medicalHistory.includes('Hypertension')) overallScore += 10;
    if (patient.medicalHistory.includes('Diabetes')) overallScore += 15;

    let riskLevel: PatientRiskScore['riskLevel'] = 'low';
    if (overallScore > 70) riskLevel = 'high';
    else if (overallScore > 50) riskLevel = 'medium';

    const riskScore: PatientRiskScore = {
      id: `risk_${patientId}_${Date.now()}`,
      patientId: patientId,
      scoreType: 'Clinical Risk',
      overallScore: overallScore,
      score: overallScore,
      maxScore: 100,
      riskLevel: riskLevel,
      factors: [
        { factor: 'Medication Adherence', weight: 70, description: 'Patient medication compliance' },
        { factor: 'Clinical Complexity', weight: 60, description: 'Multiple chronic conditions' },
        { factor: 'Social Determinants', weight: 50, description: 'Social risk factors' },
        { factor: 'Recent Utilization', weight: 80, description: 'Healthcare usage patterns' }
      ],
      lastUpdated: new Date(),
      recommendations: ['Follow up with provider', 'Adhere to medication'],
    };

    this.riskScores.set(patientId, riskScore);
    return riskScore;
  }

  updateRiskScore(patientId: string, newFactors: PatientRiskScore['factors']): PatientRiskScore {
    const currentScore = this.riskScores.get(patientId);
    if (!currentScore) {
      throw new Error('Risk score not found for patient');
    }

    const averageWeight = newFactors.reduce((sum, factor) => sum + factor.weight, 0) / newFactors.length;

    let riskLevel: PatientRiskScore['riskLevel'] = 'low';
    if (averageWeight > 70) riskLevel = 'high';
    else if (averageWeight > 50) riskLevel = 'medium';

    const updatedScore: PatientRiskScore = {
      ...currentScore,
      overallScore: averageWeight,
      score: averageWeight,
      riskLevel: riskLevel,
      factors: newFactors,
      lastUpdated: new Date(),
    };

    this.riskScores.set(patientId, updatedScore);
    return updatedScore;
  }

  getRiskScoreHistory(patientId: string): PatientRiskScore[] {
    // In a real implementation, you would fetch the risk score history from a database
    const score = this.riskScores.get(patientId);
    return score ? [score] : [];
  }

  getHighRiskPatients(): PatientRiskScore[] {
    return Array.from(this.riskScores.values()).filter(score => score.riskLevel === 'high');
  }

  // Care Coordination Activity Methods
  createCareActivity(params: {
    patientId: string;
    type: CareCoordinationActivity['type'];
    status: CareCoordinationActivity['status'];
    priority: CareCoordinationActivity['priority'];
    dueDate: Date;
    assignedTo: string;
    assignedBy: string;
    notes: string;
    timeTrackingMode?: 'automated' | 'manual';
  }): string {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const activity: CareCoordinationActivity = {
      id: activityId,
      patientId: params.patientId,
      type: params.type,
      status: params.status,
      priority: params.priority,
      dueDate: params.dueDate,
      assignedTo: params.assignedTo,
      assignedBy: params.assignedBy,
      notes: params.notes,
      timeTrackingMode: params.timeTrackingMode || 'automated',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const patientActivities = this.careActivities.get(params.patientId) || [];
    patientActivities.push(activity);
    this.careActivities.set(params.patientId, patientActivities);

    return activityId;
  }

  getCareActivities(patientId: string): CareCoordinationActivity[] {
    return this.careActivities.get(patientId) || [];
  }

  updateCareActivity(patientId: string, activityId: string, updates: Partial<CareCoordinationActivity>): void {
    const activities = this.careActivities.get(patientId) || [];
    const activityIndex = activities.findIndex(a => a.id === activityId);
    
    if (activityIndex !== -1) {
      activities[activityIndex] = {
        ...activities[activityIndex],
        ...updates,
        updatedAt: new Date()
      };
      this.careActivities.set(patientId, activities);
    }
  }

  // Time tracking methods - fix the type issues
  startTimeTracking(
    patientId: string,
    providerId: string,
    activityType: CCMTimeEntry['activityType'],
    description: string
  ): string {
    const entryId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const timeEntry: CCMTimeEntry = {
      id: entryId,
      patientId,
      providerId,
      activityType: activityType,
      description,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      status: 'active',
      createdAt: new Date()
    };

    this.timeEntries.set(entryId, timeEntry);
    return entryId;
  }

  stopTimeTracking(entryId: string): CCMTimeEntry | null {
    const entry = this.timeEntries.get(entryId);
    if (!entry || entry.status !== 'active') return null;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - entry.startTime.getTime()) / 60000); // minutes

    const updatedEntry: CCMTimeEntry = {
      ...entry,
      endTime,
      duration,
      status: 'completed'
    };

    this.timeEntries.set(entryId, updatedEntry);
    return updatedEntry;
  }

  // Missing methods for EnhancedClinicalDashboard
  getComprehensivePatientData(patientId: string, month: string): any {
    return {
      totalTime: 120,
      complianceStatus: {
        minimumTimeMet: true,
        qualifyingActivities: true,
        documentationComplete: true,
        careCoordinationActive: true,
        qualityMeasuresTracked: true,
        totalMinutes: 120,
        complianceScore: 85
      }
    };
  }

  getClinicalAlerts(patientId: string, activeOnly?: boolean): EnhancedClinicalAlert[] {
    const alerts = this.clinicalAlerts.get(patientId) || [];
    return activeOnly ? alerts.filter(alert => !alert.acknowledged) : alerts;
  }

  getQualityMeasures(patientId: string): EnhancedQualityMeasure[] {
    return this.qualityMeasures.get(patientId) || [];
  }

  getRiskScores(patientId: string): PatientRiskScore[] {
    const score = this.riskScores.get(patientId);
    return score ? [score] : [];
  }

  acknowledgeClinicalAlert(alertId: string, providerId: string): boolean {
    for (const [patientId, alerts] of this.clinicalAlerts.entries()) {
      const alertIndex = alerts.findIndex(a => a.id === alertId);
      if (alertIndex !== -1) {
        alerts[alertIndex] = {
          ...alerts[alertIndex],
          acknowledged: true,
          acknowledgedBy: providerId,
          acknowledgedAt: new Date()
        };
        this.clinicalAlerts.set(patientId, alerts);
        return true;
      }
    }
    return false;
  }

  // Missing methods for MedicalRecordGenerator and SuperbillGenerator
  getTimeEntries(patientId: string, month?: string): CCMTimeEntry[] {
    const entries = Array.from(this.timeEntries.values()).filter(entry => entry.patientId === patientId);
    if (month) {
      const [year, monthNum] = month.split('-');
      return entries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate.getFullYear() === parseInt(year) && 
               entryDate.getMonth() === parseInt(monthNum) - 1;
      });
    }
    return entries;
  }

  getAssessments(patientId: string): CCMAssessment[] {
    return this.assessments.get(patientId) || [];
  }

  getSuperbills(patientId: string): CCMSuperbill[] {
    return this.superbills.get(patientId) || [];
  }

  determineCPTCode(timeSpent: number, activityType?: string): string {
    if (timeSpent >= 60) return '99490';
    if (timeSpent >= 40) return '99491';
    if (timeSpent >= 20) return '99457';
    return '99453';
  }
}

export const ccmService = new CCMService();
