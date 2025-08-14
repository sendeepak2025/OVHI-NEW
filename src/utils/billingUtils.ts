// Common ICD-10 codes for reference
export const commonICD10Codes = [
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'J45.909', description: 'Unspecified asthma, uncomplicated' },
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'F41.9', description: 'Anxiety disorder, unspecified' },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified' },
  { code: 'J02.9', description: 'Acute pharyngitis, unspecified' },
  { code: 'R51', description: 'Headache' },
  { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' },
  { code: 'Z23', description: 'Encounter for immunization' },
  { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris' },
  { code: 'N18.6', description: 'End stage renal disease' },
  { code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation' },
  { code: 'I50.9', description: 'Heart failure, unspecified' },
  { code: 'F17.210', description: 'Nicotine dependence, cigarettes, uncomplicated' },
  { code: 'Z51.81', description: 'Encounter for therapeutic drug level monitoring' }
];

// Common CPT codes for reference
export const commonCPTCodes = [
  // Office Visits
  { code: '99213', description: 'Office/outpatient visit, established patient, 15 minutes', fee: 74.00 },
  { code: '99214', description: 'Office/outpatient visit, established patient, 25 minutes', fee: 109.00 },
  { code: '99215', description: 'Office/outpatient visit, established patient, 40 minutes', fee: 148.00 },
  { code: '99201', description: 'Office/outpatient visit, new patient, 10 minutes', fee: 45.00 },
  { code: '99202', description: 'Office/outpatient visit, new patient, 20 minutes', fee: 77.00 },
  { code: '99203', description: 'Office/outpatient visit, new patient, 30 minutes', fee: 110.00 },
  { code: '99212', description: 'Office/outpatient visit, established patient, 10 minutes', fee: 46.00 },
  { code: '99211', description: 'Office/outpatient visit, established patient, 5 minutes', fee: 24.00 },
  
  // Telehealth/Phone Visits
  { code: '99441', description: 'Telephone evaluation, 5-10 minutes', fee: 56.00 },
  { code: '99442', description: 'Telephone evaluation, 11-20 minutes', fee: 92.00 },
  { code: '99443', description: 'Telephone evaluation, 21-30 minutes', fee: 134.00 },
  { code: '99421', description: 'Online digital E/M service, 5-10 minutes', fee: 65.00 },
  { code: '99422', description: 'Online digital E/M service, 11-20 minutes', fee: 105.00 },
  { code: '99423', description: 'Online digital E/M service, 21+ minutes', fee: 165.00 },
  
  // CCM Services
  { code: '99490', description: 'Chronic care management services, first 20 minutes', fee: 42.60 },
  { code: '99491', description: 'Chronic care management services, each additional 20 minutes', fee: 31.92 },
  { code: '99487', description: 'Complex chronic care management services, first 60 minutes', fee: 98.68 },
  { code: '99489', description: 'Complex chronic care management services, each additional 30 minutes', fee: 49.34 },
  
  // Remote Patient Monitoring (RPM)
  { code: '99453', description: 'Remote patient monitoring setup and patient education', fee: 19.93 },
  { code: '99454', description: 'Remote patient monitoring device supply', fee: 64.11 },
  { code: '99457', description: 'Remote physiologic monitoring treatment, first 20 minutes', fee: 51.14 },
  { code: '99458', description: 'Remote physiologic monitoring treatment, each additional 20 minutes', fee: 41.21 },
  { code: '99091', description: 'Remote monitoring, collection and interpretation, 30 minutes', fee: 120.00 },
  
  // Principal Care Management (PCM)
  { code: '99424', description: 'Principal care management services, first 30 minutes', fee: 61.25 },
  { code: '99425', description: 'Principal care management services, each additional 30 minutes', fee: 43.07 },
  { code: '99426', description: 'Principal care management services, first 30 minutes, clinical staff', fee: 32.15 },
  { code: '99427', description: 'Principal care management services, each additional 30 minutes, clinical staff', fee: 25.72 }
];

// Types for our billing system
export interface Diagnosis {
  id: string;
  icd10Code: string;
  description: string;
}

export interface ProcedureCode {
  id: string;
  cptCode: string;
  description: string;
  fee: number;
  quantity: number;
}

export interface BillingDetails {
  id: string;
  appointmentId: string;
  patientId: string;
  providerId: string;
  dateOfService: Date;
  diagnoses: Diagnosis[];
  procedures: ProcedureCode[];
  totalFee: number;
  insuranceId?: string;
  insuranceName?: string;
  copay?: number;
  status: 'draft' | 'submitted' | 'paid' | 'denied' | 'partially_paid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceInfo {
  id: string;
  provider: string;
  planName: string;
  policyNumber: string;
  groupNumber: string;
  subscriberId: string;
  subscriberName: string;
  relationship: string;
  coverageStartDate: Date;
  coverageEndDate?: Date;
}

// Mock billing data for demonstration purposes
export const mockBillingData: BillingDetails[] = [
  {
    id: 'bill-001',
    appointmentId: 'apt-001',
    patientId: '1',
    providerId: 'dr-smith',
    dateOfService: new Date(2025, 2, 15),
    diagnoses: [
      { id: 'diag-001', icd10Code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
      { id: 'diag-002', icd10Code: 'I10', description: 'Essential (primary) hypertension' }
    ],
    procedures: [
      { id: 'proc-001', cptCode: '99214', description: 'Office/outpatient visit, established patient, 25 minutes', fee: 109.00, quantity: 1 },
      { id: 'proc-002', cptCode: '99490', description: 'Chronic care management services, first 20 minutes', fee: 42.60, quantity: 1 }
    ],
    totalFee: 151.60,
    insuranceId: 'ins-medicare-001',
    insuranceName: 'Medicare',
    copay: 20.00,
    status: 'submitted',
    notes: 'Diabetes management visit with CCM services',
    createdAt: new Date(2025, 2, 15),
    updatedAt: new Date(2025, 2, 15)
  },
  {
    id: 'bill-002',
    appointmentId: 'apt-002',
    patientId: '2',
    providerId: 'dr-patel',
    dateOfService: new Date(2025, 2, 14),
    diagnoses: [
      { id: 'diag-003', icd10Code: 'I50.9', description: 'Heart failure, unspecified' },
      { id: 'diag-004', icd10Code: 'N18.6', description: 'End stage renal disease' }
    ],
    procedures: [
      { id: 'proc-003', cptCode: '99487', description: 'Complex chronic care management services, first 60 minutes', fee: 98.68, quantity: 1 },
      { id: 'proc-004', cptCode: '99453', description: 'Remote patient monitoring setup and patient education', fee: 19.93, quantity: 1 },
      { id: 'proc-005', cptCode: '99457', description: 'Remote physiologic monitoring treatment, first 20 minutes', fee: 51.14, quantity: 1 }
    ],
    totalFee: 169.75,
    insuranceId: 'ins-bcbs-001',
    insuranceName: 'Blue Cross Blue Shield',
    copay: 30.00,
    status: 'paid',
    notes: 'Complex CCM for heart failure and ESRD with RPM setup',
    createdAt: new Date(2025, 2, 14),
    updatedAt: new Date(2025, 2, 16)
  },
  {
    id: 'bill-003',
    appointmentId: 'ccm-telehealth-001',
    patientId: '3',
    providerId: 'dr-chen',
    dateOfService: new Date(2025, 2, 13),
    diagnoses: [
      { id: 'diag-005', icd10Code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation' },
      { id: 'diag-006', icd10Code: 'F17.210', description: 'Nicotine dependence, cigarettes, uncomplicated' }
    ],
    procedures: [
      { id: 'proc-006', cptCode: '99422', description: 'Online digital E/M service, 11-20 minutes', fee: 105.00, quantity: 1 },
      { id: 'proc-007', cptCode: '99491', description: 'Chronic care management services, each additional 20 minutes', fee: 31.92, quantity: 2 }
    ],
    totalFee: 168.84,
    insuranceId: 'ins-aetna-001',
    insuranceName: 'Aetna',
    copay: 25.00,
    status: 'partially_paid',
    notes: 'Telehealth visit for COPD exacerbation with smoking cessation counseling',
    createdAt: new Date(2025, 2, 13),
    updatedAt: new Date(2025, 2, 17)
  },
  {
    id: 'ccm-bill-004',
    appointmentId: 'ccm-monthly-001',
    patientId: '1',
    providerId: 'dr-smith',
    dateOfService: new Date(2025, 2, 12),
    diagnoses: [
      { id: 'diag-007', icd10Code: 'Z51.81', description: 'Encounter for therapeutic drug level monitoring' }
    ],
    procedures: [
      { id: 'proc-008', cptCode: '99490', description: 'Chronic care management services, first 20 minutes', fee: 42.60, quantity: 1 },
      { id: 'proc-009', cptCode: '99491', description: 'Chronic care management services, each additional 20 minutes', fee: 31.92, quantity: 1 }
    ],
    totalFee: 74.52,
    insuranceId: 'ins-medicare-001',
    insuranceName: 'Medicare',
    copay: 0,
    status: 'submitted',
    notes: 'Monthly CCM services - Total time: 45 minutes',
    createdAt: new Date(2025, 2, 12),
    updatedAt: new Date(2025, 2, 12)
  },
  {
    id: 'rpm-bill-005',
    appointmentId: 'rpm-setup-001',
    patientId: '2',
    providerId: 'dr-patel',
    dateOfService: new Date(2025, 2, 11),
    diagnoses: [
      { id: 'diag-008', icd10Code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris' }
    ],
    procedures: [
      { id: 'proc-010', cptCode: '99453', description: 'Remote patient monitoring setup and patient education', fee: 19.93, quantity: 1 },
      { id: 'proc-011', cptCode: '99454', description: 'Remote patient monitoring device supply', fee: 64.11, quantity: 1 }
    ],
    totalFee: 84.04,
    insuranceId: 'ins-bcbs-001',
    insuranceName: 'Blue Cross Blue Shield',
    copay: 15.00,
    status: 'paid',
    notes: 'RPM setup for cardiac monitoring',
    createdAt: new Date(2025, 2, 11),
    updatedAt: new Date(2025, 2, 15)
  }
];

// Generate a mock billing record
export const generateMockBilling = (appointmentId: string, patientId: string): BillingDetails => {
  // Random diagnoses
  const diagnoses: Diagnosis[] = [
    {
      id: `diag-${Math.random().toString(36).substr(2, 9)}`,
      icd10Code: commonICD10Codes[Math.floor(Math.random() * commonICD10Codes.length)].code,
      description: commonICD10Codes[Math.floor(Math.random() * commonICD10Codes.length)].description
    }
  ];

  // Random procedures
  const randomCPT = commonCPTCodes[Math.floor(Math.random() * commonCPTCodes.length)];
  const procedures: ProcedureCode[] = [
    {
      id: `proc-${Math.random().toString(36).substr(2, 9)}`,
      cptCode: randomCPT.code,
      description: randomCPT.description,
      fee: randomCPT.fee,
      quantity: 1
    }
  ];

  // Calculate total fee
  const totalFee = procedures.reduce((sum, proc) => sum + (proc.fee * proc.quantity), 0);

  return {
    id: `bill-${Math.random().toString(36).substr(2, 9)}`,
    appointmentId,
    patientId,
    providerId: 'dr-smith',
    dateOfService: new Date(),
    diagnoses,
    procedures,
    totalFee,
    insuranceId: 'ins-12345',
    insuranceName: 'Blue Cross Blue Shield',
    copay: 25.00,
    status: 'draft',
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Create billing from appointment with null safety
export const createBillingFromAppointment = (appointment: any): BillingDetails => {
  const currentDate = new Date();
  
  // Get appropriate CPT code based on appointment type and duration
  let cptCode;
  if (appointment?.type === 'Telehealth') {
    // For telehealth appointments
    if (appointment?.duration?.includes('30')) {
      cptCode = commonCPTCodes.find(code => code.code === '99442'); // 11-20 minutes
    } else if (appointment?.duration?.includes('45') || appointment?.duration?.includes('60')) {
      cptCode = commonCPTCodes.find(code => code.code === '99443'); // 21-30 minutes
    } else {
      cptCode = commonCPTCodes.find(code => code.code === '99441'); // 5-10 minutes
    }
  } else {
    // For in-person appointments
    if (appointment?.duration?.includes('30')) {
      cptCode = commonCPTCodes.find(code => code.code === '99213'); // 15 minutes
    } else if (appointment?.duration?.includes('45')) {
      cptCode = commonCPTCodes.find(code => code.code === '99214'); // 25 minutes
    } else if (appointment?.duration?.includes('60')) {
      cptCode = commonCPTCodes.find(code => code.code === '99215'); // 40 minutes
    } else {
      cptCode = commonCPTCodes.find(code => code.code === '99212'); // 10 minutes
    }
  }

  // Fallback to a standard CPT code if none matched
  if (!cptCode) {
    cptCode = commonCPTCodes.find(code => code.code === '99213');
  }

  // Create the procedure
  const procedure: ProcedureCode = {
    id: `proc-${Math.random().toString(36).substr(2, 9)}`,
    cptCode: cptCode?.code || '99213',
    description: cptCode?.description || 'Office/outpatient visit',
    fee: cptCode?.fee || 74.00,
    quantity: 1
  };

  // Create a generic diagnosis
  const diagnosis: Diagnosis = {
    id: `diag-${Math.random().toString(36).substr(2, 9)}`,
    icd10Code: 'Z00.00',
    description: 'Encounter for general adult medical examination without abnormal findings'
  };

  return {
    id: `bill-${Math.random().toString(36).substr(2, 9)}`,
    appointmentId: appointment?.id || '',
    patientId: appointment?.patient?.id || '',
    providerId: appointment?.providerId || 'dr-smith',
    dateOfService: appointment?.date || currentDate,
    diagnoses: [diagnosis],
    procedures: [procedure],
    totalFee: procedure.fee * procedure.quantity,
    insuranceId: 'pending',
    insuranceName: 'Pending Insurance Verification',
    copay: 0,
    status: 'draft',
    notes: 'Auto-generated billing record. Please review and update as needed.',
    createdAt: currentDate,
    updatedAt: currentDate
  };
};

// New function: Create a billing encounter from CCM services
export const createCCMBilling = (patientId: string, timeEntries: any[], month: string): BillingDetails => {
  // Calculate total time and determine appropriate CPT codes
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  
  // Determine CPT codes based on total time and service complexity
  const procedures: ProcedureCode[] = [];
  
  if (totalMinutes >= 20) {
    // First 20 minutes
    procedures.push({
      id: `proc-${Math.random().toString(36).substr(2, 9)}`,
      cptCode: '99490',
      description: 'CCM services, first 20 minutes',
      fee: 42.60,
      quantity: 1
    });
    
    // Additional 20-minute increments
    const additionalIncrements = Math.floor((totalMinutes - 20) / 20);
    if (additionalIncrements > 0) {
      procedures.push({
        id: `proc-${Math.random().toString(36).substr(2, 9)}`,
        cptCode: '99491',
        description: 'CCM services, each additional 20 minutes',
        fee: 31.92,
        quantity: additionalIncrements
      });
    }
  }
  
  // Check for complex CCM services (60+ minutes)
  if (totalMinutes >= 60) {
    procedures.splice(0, procedures.length); // Clear simple CCM codes
    procedures.push({
      id: `proc-${Math.random().toString(36).substr(2, 9)}`,
      cptCode: '99487',
      description: 'Complex CCM services, first 60 minutes',
      fee: 98.68,
      quantity: 1
    });
    
    // Additional 30-minute increments for complex CCM
    const additionalComplexIncrements = Math.floor((totalMinutes - 60) / 30);
    if (additionalComplexIncrements > 0) {
      procedures.push({
        id: `proc-${Math.random().toString(36).substr(2, 9)}`,
        cptCode: '99489',
        description: 'Complex CCM services, each additional 30 minutes',
        fee: 49.34,
        quantity: additionalComplexIncrements
      });
    }
  }

  // Add RPM codes if applicable
  const hasRPM = timeEntries.some(entry => entry.activityType === 'remote_monitoring');
  if (hasRPM) {
    procedures.push({
      id: `proc-${Math.random().toString(36).substr(2, 9)}`,
      cptCode: '99453',
      description: 'Remote patient monitoring setup',
      fee: 19.93,
      quantity: 1
    });
    
    procedures.push({
      id: `proc-${Math.random().toString(36).substr(2, 9)}`,
      cptCode: '99458',
      description: 'Remote physiologic monitoring treatment, first 20 minutes',
      fee: 51.14,
      quantity: 1
    });
  }

  // Create diagnosis for CCM
  const diagnosis: Diagnosis = {
    id: `diag-${Math.random().toString(36).substr(2, 9)}`,
    icd10Code: 'Z51.81',
    description: 'Encounter for therapeutic drug level monitoring'
  };

  const totalFee = procedures.reduce((sum, proc) => sum + (proc.fee * proc.quantity), 0);

  return {
    id: `ccm-bill-${Math.random().toString(36).substr(2, 9)}`,
    appointmentId: `ccm-${patientId}-${month}`,
    patientId,
    providerId: 'dr-smith',
    dateOfService: new Date(),
    diagnoses: [diagnosis],
    procedures,
    totalFee,
    insuranceId: 'medicare',
    insuranceName: 'Medicare',
    copay: 0,
    status: 'draft',
    notes: `CCM services for ${month} - Total time: ${totalMinutes} minutes`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Calculate billing total
export const calculateBillingTotal = (procedures: ProcedureCode[]): number => {
  return procedures.reduce((sum, proc) => sum + (proc.fee * proc.quantity), 0);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Utility: Get all bills for a given patientId
export const getBillsForPatient = (patientId: string): BillingDetails[] => {
  return mockBillingData.filter(bill => bill.patientId === patientId);
};

// Utility: Calculate total billed, total paid, total pending for a list of bills
export const getBillingSummary = (bills: BillingDetails[]) => {
  let totalBilled = 0;
  let totalPaid = 0;
  let totalPending = 0;
  bills.forEach(bill => {
    totalBilled += bill.totalFee;
    let paid = 0;
    if (bill.status === "paid") {
      paid = bill.totalFee;
    } else if (bill.status === "partially_paid") {
      paid = bill.copay ?? 0;
    }
    totalPaid += paid;
    const pending = Math.max(bill.totalFee - paid, 0);
    totalPending += pending;
  });
  return {
    totalBilled,
    totalPaid,
    totalPending,
  };
};

