
import { MedicalRecord } from '../types/medicalTypes';

export const medicalRecordsData: MedicalRecord[] = [
  {
    id: "rec1",
    date: "2025-03-01",
    type: "Lab Results",
    provider: "City General Lab",
    description: "Complete Blood Count (CBC)",
    details: {
      wbc: "7.8 K/uL",
      rbc: "4.9 M/uL",
      hgb: "14.2 g/dL",
      hct: "42.1%",
      plt: "250 K/uL"
    },
    file: "cbc_results_2025_03_01.pdf",
    patientId: '1',
  },
  {
    id: "rec2",
    date: "2025-02-10",
    type: "Radiology",
    provider: "Metro Imaging Center",
    description: "Chest X-Ray",
    details: {
      findings: "No acute cardiopulmonary disease. Heart size normal.",
      impression: "Normal chest radiograph."
    },
    file: "chest_xray_2025_02_10.pdf",
    patientId: '1',
  },
  {
    id: "rec3",
    date: "2025-01-15",
    type: "Specialist Consult",
    provider: "Dr. Amanda Cardiologist",
    description: "Cardiology Consultation",
    details: {
      reason: "Evaluation of heart palpitations",
      findings: "Normal ECG. No significant arrhythmias detected during visit.",
      recommendations: "24-hour Holter monitor recommended."
    },
    file: "cardiology_consult_2025_01_15.pdf",
    patientId: '1',
  },
  {
    id: "rec4",
    date: "2024-12-05",
    type: "Surgical Report",
    provider: "Dr. Michael Surgeon",
    description: "Laparoscopic Appendectomy",
    details: {
      procedure: "Laparoscopic appendectomy",
      findings: "Acute appendicitis",
      complications: "None"
    },
    file: "surgical_report_2024_12_05.pdf",
    patientId: '2',
  }
];
