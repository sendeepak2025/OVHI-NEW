import { BillingDetails, Diagnosis } from "./billingUtils";

// CMS-1500 field mapping
export interface CMS1500FormData {
  // Patient Info
  patientName: string;
  patientBirthDate: string;
  patientGender: string;
  patientAddress: string;
  patientCity: string;
  patientState: string;
  patientZip: string;
  patientPhone: string;
  patientRelationToInsured: 'self' | 'spouse' | 'child' | 'other';
  
  // Insured Info
  insuredName: string;
  insuredId: string;
  insurancePlanName: string;
  insuredAddress?: string;
  insuredCity?: string;
  insuredState?: string;
  insuredZip?: string;
  insuredPhone?: string;
  insuredEmployer?: string;
  insuredGroupNumber?: string;
  
  // Provider Info
  providerName: string;
  providerNPI: string;
  providerTaxId: string;
  providerAddress: string;
  providerCity: string;
  providerState: string;
  providerZip: string;
  providerPhone: string;
  
  // Claim Info
  claimId: string;
  patientCondition: {
    isEmploymentRelated: boolean;
    isAutoAccident: boolean;
    isOtherAccident: boolean;
    accidentState?: string;
  };
  dateOfCurrentIllness?: string;
  firstDateOfSimilarIllness?: string;
  unableToWorkDateRange?: {
    from?: string;
    to?: string;
  };
  hospitalDateRange?: {
    from?: string;
    to?: string;
  };
  
  // Referral Info
  referringProviderName?: string;
  referringProviderNPI?: string;
  
  // Facility Info
  facilityName?: string;
  facilityNPI?: string;
  facilityAddress?: string;
  facilityCity?: string;
  facilityState?: string;
  facilityZip?: string;
  
  // Diagnosis Codes (up to 12 ICD-10 codes)
  diagnosisCodes: string[];
  
  // Service Lines (up to 6)
  serviceLines: {
    dateFrom: string;
    dateTo: string;
    placeOfService: string;
    procedureCode: string;
    modifiers?: string[];
    diagnosisPointers: number[];
    charges: number;
    days: number;
    emergencyIndicator?: boolean;
    renderingProviderNPI?: string;
  }[];
  
  // Additional Info
  signatureOnFile: boolean;
  signatureDate: string;
  acceptAssignment: boolean;
  totalCharge: number;
  amountPaid: number;
  balanceDue: number;
  
  // Other
  resubmissionCode?: string;
  originalRefNo?: string;
  priorAuthNumber?: string;
  medicaidResubmissionCode?: string;
  isClaimICN?: boolean;
}

// POS (Place of Service) codes
export const placeOfServiceCodes = {
  '11': 'Office',
  '12': 'Home',
  '21': 'Inpatient Hospital',
  '22': 'Outpatient Hospital',
  '23': 'Emergency Room',
  '31': 'Skilled Nursing Facility',
  '32': 'Nursing Facility',
  '33': 'Custodial Care Facility',
  '41': 'Ambulance - Land',
  '42': 'Ambulance - Air or Water',
  '65': 'End-Stage Renal Disease Treatment Facility',
  '71': 'State or Local Public Health Clinic',
  '72': 'Rural Health Clinic',
  '81': 'Independent Laboratory',
  '99': 'Other Place of Service'
};

// Map diagnosis codes from BillingDetails to CMS1500 format
export const mapDiagnosisToCMS1500 = (diagnoses: Diagnosis[]): string[] => {
  return diagnoses.map(d => d.icd10Code).slice(0, 12);
};

// Generate CMS-1500 form data from our BillingDetails model
export const generateCMS1500FormData = (
  billingDetails: BillingDetails, 
  patientInfo: any,  // We'd expand this to use a proper patient type
  providerInfo: any  // We'd expand this to use a proper provider type
): CMS1500FormData => {
  // Create service lines from procedures
  const serviceLines = billingDetails.procedures.map((proc, index) => ({
    dateFrom: billingDetails.dateOfService.toISOString().split('T')[0],
    dateTo: billingDetails.dateOfService.toISOString().split('T')[0],
    placeOfService: '11', // 11 = Office
    procedureCode: proc.cptCode,
    modifiers: [],
    diagnosisPointers: [index + 1 > billingDetails.diagnoses.length ? 1 : index + 1], // Point to corresponding diagnosis or first diagnosis
    charges: proc.fee * proc.quantity,
    days: proc.quantity,
    emergencyIndicator: false,
    renderingProviderNPI: providerInfo.npi
  }));

  // Create CMS-1500 form data
  return {
    // Patient Info
    patientName: patientInfo.name || 'Unknown Patient',
    patientBirthDate: patientInfo.dateOfBirth || '',
    patientGender: patientInfo.gender || '',
    patientAddress: patientInfo.address || '',
    patientCity: patientInfo.city || '',
    patientState: patientInfo.state || '',
    patientZip: patientInfo.zip || '',
    patientPhone: patientInfo.phone || '',
    patientRelationToInsured: 'self',
    
    // Insured Info
    insuredName: patientInfo.name || 'Unknown Patient',
    insuredId: billingDetails.insuranceId || '',
    insurancePlanName: billingDetails.insuranceName || 'Self Pay',
    insuredEmployer: patientInfo.employer || '',
    insuredGroupNumber: patientInfo.insuranceGroup || '',
    
    // Provider Info
    providerName: providerInfo.name || 'Unknown Provider',
    providerNPI: providerInfo.npi || '1234567890',
    providerTaxId: providerInfo.taxId || '',
    providerAddress: providerInfo.address || '',
    providerCity: providerInfo.city || '',
    providerState: providerInfo.state || '',
    providerZip: providerInfo.zip || '',
    providerPhone: providerInfo.phone || '',
    
    // Facility Info - Using provider info as default
    facilityName: providerInfo.name || 'Unknown Provider',
    facilityNPI: providerInfo.npi || '1234567890',
    facilityAddress: providerInfo.address || '',
    facilityCity: providerInfo.city || '',
    facilityState: providerInfo.state || '',
    facilityZip: providerInfo.zip || '',
    
    // Claim Info
    claimId: billingDetails.id,
    patientCondition: {
      isEmploymentRelated: false,
      isAutoAccident: false,
      isOtherAccident: false
    },
    dateOfCurrentIllness: billingDetails.dateOfService.toISOString().split('T')[0],
    
    // Diagnosis Codes
    diagnosisCodes: mapDiagnosisToCMS1500(billingDetails.diagnoses),
    
    // Service Lines
    serviceLines,
    
    // Additional Info
    signatureOnFile: true,
    signatureDate: new Date().toISOString().split('T')[0],
    acceptAssignment: true,
    totalCharge: billingDetails.totalFee,
    amountPaid: 0,
    balanceDue: billingDetails.totalFee,
    
    // Other potential fields
    resubmissionCode: '',
    originalRefNo: '',
    priorAuthNumber: '',
    isClaimICN: false,
    medicaidResubmissionCode: ''
  };
};

export const validateCMS1500Form = (formData: CMS1500FormData): string[] => {
  const errors: string[] = [];
  
  // Basic validation rules
  if (!formData.patientName) errors.push("Patient name is required");
  if (!formData.patientBirthDate) errors.push("Patient birth date is required");
  if (!formData.patientGender) errors.push("Patient gender is required");
  if (!formData.patientAddress) errors.push("Patient address is required");
  if (!formData.patientCity) errors.push("Patient city is required");
  if (!formData.patientState) errors.push("Patient state is required");
  if (!formData.patientZip) errors.push("Patient zip code is required");
  
  if (!formData.insuredName) errors.push("Insured's name is required");
  if (!formData.insuredId) errors.push("Insurance ID is required");
  if (!formData.insurancePlanName) errors.push("Insurance plan name is required");
  
  if (!formData.providerName) errors.push("Provider name is required");
  if (!formData.providerNPI) errors.push("Provider NPI is required");
  if (!formData.providerTaxId) errors.push("Provider Tax ID is required");
  
  if (formData.diagnosisCodes.length === 0) errors.push("At least one diagnosis code is required");
  if (formData.serviceLines.length === 0) errors.push("At least one service line is required");
  
  // Service line validations
  formData.serviceLines.forEach((line, index) => {
    if (!line.dateFrom) errors.push(`Service line #${index + 1}: Date is required`);
    if (!line.procedureCode) errors.push(`Service line #${index + 1}: Procedure code is required`);
    if (line.charges <= 0) errors.push(`Service line #${index + 1}: Charges must be greater than zero`);
    if (line.days <= 0) errors.push(`Service line #${index + 1}: Days/Units must be greater than zero`);
    if (!line.placeOfService) errors.push(`Service line #${index + 1}: Place of service is required`);
    if (line.diagnosisPointers.length === 0) errors.push(`Service line #${index + 1}: At least one diagnosis pointer is required`);
  });
  
  // Validate total charge matches sum of service charges
  const calculatedTotal = formData.serviceLines.reduce((sum, line) => sum + line.charges, 0);
  if (Math.abs(calculatedTotal - formData.totalCharge) > 0.01) {
    errors.push(`Total charge (${formData.totalCharge}) does not match sum of service charges (${calculatedTotal})`);
  }
  
  // Balance due validation
  const calculatedBalance = formData.totalCharge - formData.amountPaid;
  if (Math.abs(calculatedBalance - formData.balanceDue) > 0.01) {
    errors.push(`Balance due (${formData.balanceDue}) does not match total charge minus amount paid (${calculatedBalance})`);
  }
  
  return errors;
};

// Helper function to get POS description
export const getPOSDescription = (code: string): string => {
  return placeOfServiceCodes[code as keyof typeof placeOfServiceCodes] || 'Unknown';
};

// Helper function to convert diagnosis pointer number to letter (1=A, 2=B, etc)
export const diagnosisPointerToLetter = (pointer: number): string => {
  return String.fromCharCode(64 + pointer); // ASCII A=65, so 1 -> A, 2 -> B, etc.
};
