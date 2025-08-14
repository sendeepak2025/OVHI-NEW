
export interface Patient {
  id: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  age: number;
  gender: string;
  birthDate: string;
  phone: string;
  address: string;
  emergencyContact: string;
  occupation: string;
  employer: string;
  maritalStatus: string;
  preferredLanguage: string;
  ethnicity: string;
  preferredPharmacy: string;
  insurance: Array<{
    type: 'primary' | 'secondary' | 'tertiary';
    provider: string;
    planName: string;
    company: string;
    policyNumber: string;
    groupNumber: string;
    subscriberName: string;
    subscriberID: string;
    relationToSubscriber: string;
    effectiveDate: string;
    expirationDate: string;
    copay?: {
      primaryCare: string;
      specialist: string;
      emergency: string;
      urgent: string;
    };
    deductible?: string;
    outOfPocketMax?: string;
    coveragePercentage?: string;
    authorizationPhone?: string;
    claimsAddress?: string;
    memberServices?: string;
    coverageDetails?: string;
  }>;
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    startDate: string;
    endDate?: string;
    status: string;
  }>;
  condition: string;
  diagnosis: Array<{
    date: string;
    icd10: string;
    diagnosis: string;
    status: string;
  }>;
  status: string;
  primaryDoctor: string;
  lastVisit: string;
  nextAppointment: string;
  height: number; // in inches
  weight: number; // in pounds
  bmi: number;
  allergies: Array<{
    allergen: string;
    severity: string;
    reaction: string;
  }>;
  immunizations: Array<{
    vaccine: string;
    date: string;
    provider: string;
  }>;
  familyHistory: Array<{
    condition: string;
    relation: string;
  }>;
  socialHistory: {
    tobacco: string;
    alcohol: string;
    exercise: string;
    diet: string;
  };
  consentForms: Array<{
    name: string;
    signed: string;
  }>;
  notes: Array<{
    date: string;
    note: string;
  }>;
}

export const patientData: Patient[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    email: 'emily.j@example.com',
    age: 34,
    gender: 'Female',
    birthDate: '1990-05-15',
    phone: '(555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: 'Michael Johnson (Husband) - (555) 987-6543',
    occupation: 'Software Engineer',
    employer: 'Tech Solutions Inc.',
    maritalStatus: 'Married',
    preferredLanguage: 'English',
    ethnicity: 'Caucasian',
    preferredPharmacy: 'CVS Pharmacy - 500 Park Ave, NY',
    insurance: [
      {
        type: 'primary',
        provider: 'BlueCross BlueShield',
        planName: 'PPO Family Plan',
        policyNumber: 'BCBS12345678',
        groupNumber: 'GRP987654',
        subscriberName: 'Emily Johnson',
        company:"",
        subscriberID: 'SUB98765432',
        relationToSubscriber: 'Self',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-12-31',
        copay: {
          primaryCare: '$20',
          specialist: '$40',
          emergency: '$150',
          urgent: '$50'
        },
        deductible: '$1,500',
        outOfPocketMax: '$4,500',
        coveragePercentage: '80%',
        authorizationPhone: '1-800-123-4567',
        claimsAddress: 'BCBS Claims, PO Box 1234, Indianapolis, IN 46204',
        memberServices: '1-888-987-6543'
      },
      {
        type: 'secondary',
        provider: 'Aetna',
        planName: 'Supplemental Coverage',
        policyNumber: 'AET87654321',
        groupNumber: 'AETGRP123',
        subscriberName: 'Michael Johnson',
        subscriberID: 'AETSUB123456',
        relationToSubscriber: 'Spouse',
        effectiveDate: '2024-02-15',
        expirationDate: '2025-12-31',        
        company:"",

        coverageDetails: 'Covers remaining costs after primary insurance'
      }
    ],
    currentMedications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Sarah Johnson',
        startDate: '2025-01-15',
        status: 'Active'
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        prescribedBy: 'Dr. Sarah Johnson',
        startDate: '2024-11-10',
        status: 'Active'
      }
    ],
    condition: 'Hypertension',
    diagnosis: [
      {
        date: '2024-01-15',
        icd10: 'I10',
        diagnosis: 'Essential Hypertension - Primary diagnosis with secondary risk factors',
        status: 'Active'
      },
      {
        date: '2024-02-20',
        icd10: 'E78.5',
        diagnosis: 'Hyperlipidemia - Secondary condition',
        status: 'Active'
      }
    ],
    status: 'Critical',
    primaryDoctor: 'Dr. Sarah Johnson',
    lastVisit: '2025-03-02',
    nextAppointment: '2025-03-20',
    height: 66, // 5'6"
    weight: 140,
    bmi: 22.6,
    allergies: [
      { allergen: 'Penicillin', severity: 'Severe', reaction: 'Hives, Difficulty Breathing' },
      { allergen: 'Peanuts', severity: 'Moderate', reaction: 'Skin Rash' },
      { allergen: 'Latex', severity: 'Mild', reaction: 'Skin Irritation' }
    ],
    immunizations: [
      { vaccine: 'Influenza', date: '2024-10-15', provider: 'Dr. Sarah Johnson' },
      { vaccine: 'Tetanus/Tdap', date: '2022-06-10', provider: 'Dr. James Wilson' },
      { vaccine: 'COVID-19', date: '2023-04-22', provider: 'Dr. Sarah Johnson' }
    ],
    familyHistory: [
      { condition: 'Hypertension', relation: 'Father' },
      { condition: 'Diabetes Type 2', relation: 'Mother' },
      { condition: 'Breast Cancer', relation: 'Maternal Grandmother' }
    ],
    socialHistory: {
      tobacco: 'Never smoker',
      alcohol: 'Social drinker, 1-2 drinks/week',
      exercise: 'Moderate, 2-3 times/week',
      diet: 'Balanced, follows DASH diet for hypertension'
    },
    consentForms: [
      { name: 'General Consent for Treatment', signed: '2024-01-15' },
      { name: 'HIPAA Privacy Notice', signed: '2024-01-15' },
      { name: 'Telehealth Consent', signed: '2024-02-20' }
    ],
    notes: [
      {
        date: '2025-03-02',
        note: 'Patient reports improved adherence to medication. Blood pressure readings at home averaging 135/85.'
      },
      {
        date: '2025-02-15',
        note: 'Discussed lifestyle modifications. Patient committed to reducing sodium intake and increasing exercise frequency.'
      }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@example.com',
    age: 45,
    gender: 'Male',
    birthDate: '1979-11-22',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Boston, MA 02108',
    emergencyContact: 'Lisa Chen (Wife) - (555) 876-5432',
    occupation: 'Financial Analyst',
    employer: 'Boston Financial Group',
    maritalStatus: 'Married',
    preferredLanguage: 'English, Mandarin',
    ethnicity: 'Asian',
    preferredPharmacy: 'Walgreens - 200 Washington St, Boston, MA',
    insurance: [
      {
        type: 'primary',
        provider: 'Aetna',
        planName: 'PPO Premium Plan',
        policyNumber: 'AET98765432',
        groupNumber: 'GRPAET123',
        subscriberName: 'Michael Chen',
        subscriberID: 'SUB12345678',
        relationToSubscriber: 'Self',
        company:"",
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
        copay: {
          primaryCare: '$15',
          specialist: '$30',
          emergency: '$100',
          urgent: '$40'
        },
        deductible: '$1,000',
        outOfPocketMax: '$3,500',
        coveragePercentage: '90%',
        authorizationPhone: '1-800-234-5678',
        claimsAddress: 'Aetna Claims, PO Box 5678, Hartford, CT 06101',
        memberServices: '1-888-234-5678'
      }
    ],
    currentMedications: [
      {
        name: 'Simvastatin',
        dosage: '20mg',
        frequency: 'Once daily, at bedtime',
        prescribedBy: 'Dr. Sarah Johnson',
        startDate: '2024-12-05',
        status: 'Active'
      }
    ],
    condition: 'Diabetes Type 2',
    diagnosis: [
      {
        date: '2023-06-10',
        icd10: 'E11.9',
        diagnosis: 'Type 2 Diabetes Mellitus without complications',
        status: 'Active'
      }
    ],
    status: 'Stable',
    primaryDoctor: 'Dr. Sarah Johnson',
    lastVisit: '2025-02-29',
    nextAppointment: '2025-04-05',
    height: 70, // 5'10"
    weight: 180,
    bmi: 25.8,
    allergies: [
      { allergen: 'Sulfa Drugs', severity: 'Moderate', reaction: 'Skin Rash, Itching' },
      { allergen: 'Shellfish', severity: 'Severe', reaction: 'Anaphylaxis' }
    ],
    immunizations: [
      { vaccine: 'Influenza', date: '2024-09-30', provider: 'Dr. Sarah Johnson' },
      { vaccine: 'Pneumococcal', date: '2023-08-15', provider: 'Dr. Sarah Johnson' },
      { vaccine: 'COVID-19', date: '2023-05-10', provider: 'Dr. James Wilson' }
    ],
    familyHistory: [
      { condition: 'Diabetes Type 2', relation: 'Father' },
      { condition: 'Hypertension', relation: 'Mother' },
      { condition: 'Stroke', relation: 'Paternal Grandfather' }
    ],
    socialHistory: {
      tobacco: 'Former smoker, quit 10 years ago',
      alcohol: 'Occasional, 1-2 drinks/month',
      exercise: 'Regular, 3-4 times/week',
      diet: 'Low-carb diet for diabetes management'
    },
    consentForms: [
      { name: 'General Consent for Treatment', signed: '2024-01-10' },
      { name: 'HIPAA Privacy Notice', signed: '2024-01-10' },
      { name: 'Research Participation', signed: '2024-03-15' }
    ],
    notes: [
      {
        date: '2025-02-29',
        note: 'HbA1c improved to 7.2%. Continue current medication regimen. Patient reports better glucose control with diet modifications.'
      }
    ]
  }
];
