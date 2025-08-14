import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  Share, 
  Printer, 
  Mail,
  FileCheck,
  Settings,
  Calendar,
  User,
  Building,
  Stethoscope,
  Brain,
  DollarSign,
  Heart,
  Activity,
  ClipboardList,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface EncounterData {
  id: string;
  patientId: string;
  providerId: string;
  appointmentId?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnoses: any[];
  procedures: any[];
  vitals?: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PatientInfo {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  phone?: string;
  email?: string;
  mrn?: string;
}

interface ProviderInfo {
  name: string;
  title: string;
  npi?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface AdvancedDocumentGeneratorProps {
  encounterData: EncounterData;
  patientInfo: PatientInfo;
  providerInfo: ProviderInfo;
  onDocumentGenerated?: (documentType: string, data: any) => void;
}

const AdvancedDocumentGenerator: React.FC<AdvancedDocumentGeneratorProps> = ({
  encounterData,
  patientInfo,
  providerInfo,
  onDocumentGenerated
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('comprehensive-note');
  const [customizations, setCustomizations] = useState({
    includeLogo: true,
    includeVitals: true,
    includeDiagnoses: true,
    includeProcedures: true,
    includeAssessment: true,
    includePlan: true,
    includeSignature: true,
    letterhead: true,
    confidential: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const documentTemplates = [
    {
      id: 'comprehensive-note',
      name: 'Comprehensive Progress Note',
      description: 'Complete encounter documentation with SOAP format',
      icon: FileText,
      category: 'Clinical'
    },
    {
      id: 'discharge-summary',
      name: 'Discharge Summary',
      description: 'Summary for patient discharge or transfer',
      icon: FileCheck,
      category: 'Clinical'
    },
    {
      id: 'referral-letter',
      name: 'Referral Letter',
      description: 'Professional referral to specialist',
      icon: Mail,
      category: 'Communication'
    },
    {
      id: 'patient-summary',
      name: 'Patient Summary',
      description: 'Simplified summary for patient records',
      icon: User,
      category: 'Communication'
    },
    {
      id: 'billing-summary',
      name: 'Billing Documentation',
      description: 'Detailed billing and procedure documentation',
      icon: DollarSign,
      category: 'Administrative'
    },
    {
      id: 'procedure-note',
      name: 'Procedure Note',
      description: 'Detailed procedure documentation',
      icon: Activity,
      category: 'Clinical'
    },
    {
      id: 'treatment-plan',
      name: 'Treatment Plan',
      description: 'Comprehensive treatment planning document',
      icon: ClipboardList,
      category: 'Clinical'
    },
    {
      id: 'consultation-report',
      name: 'Consultation Report',
      description: 'Specialist consultation findings',
      icon: Stethoscope,
      category: 'Clinical'
    }
  ];

  const generatePDF = useCallback(async (template: string) => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header with letterhead
      if (customizations.letterhead) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(providerInfo.name, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(providerInfo.title, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
        
        if (providerInfo.address) {
          doc.text(providerInfo.address, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 6;
        }
        
        if (providerInfo.phone) {
          doc.text(`Phone: ${providerInfo.phone}`, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 10;
        }

        // Horizontal line
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 15;
      }

      // Document title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const templateName = documentTemplates.find(t => t.id === template)?.name || 'Medical Document';
      doc.text(templateName, 20, yPosition);
      yPosition += 15;

      // Patient information
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT INFORMATION', 20, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${patientInfo.name}`, 20, yPosition);
      yPosition += 6;
      doc.text(`DOB: ${patientInfo.dateOfBirth}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Gender: ${patientInfo.gender}`, 20, yPosition);
      yPosition += 6;
      if (patientInfo.mrn) {
        doc.text(`MRN: ${patientInfo.mrn}`, 20, yPosition);
        yPosition += 6;
      }
      doc.text(`Date of Service: ${new Date(encounterData.createdAt).toLocaleDateString()}`, 20, yPosition);
      yPosition += 15;

      // Generate content based on template
      switch (template) {
        case 'comprehensive-note':
          await generateComprehensiveNote(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'discharge-summary':
          await generateDischargeSummary(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'referral-letter':
          await generateReferralLetter(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'patient-summary':
          await generatePatientSummary(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'billing-summary':
          await generateBillingSummary(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'procedure-note':
          await generateProcedureNote(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'treatment-plan':
          await generateTreatmentPlan(doc, yPosition, pageWidth, pageHeight);
          break;
        case 'consultation-report':
          await generateConsultationReport(doc, yPosition, pageWidth, pageHeight);
          break;
        default:
          await generateComprehensiveNote(doc, yPosition, pageWidth, pageHeight);
      }

      // Add signature section if enabled
      if (customizations.includeSignature) {
        const finalY = yPosition + 50;
        doc.text('Provider Signature:', 20, finalY);
        doc.line(20, finalY + 10, 100, finalY + 10);
        doc.text(`${providerInfo.name}, ${providerInfo.title}`, 20, finalY + 20);
        if (providerInfo.npi) {
          doc.text(`NPI: ${providerInfo.npi}`, 20, finalY + 30);
        }
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, finalY + 10);
      }

      // Add confidentiality notice
      if (customizations.confidential) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('CONFIDENTIAL: This document contains protected health information.', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      const fileName = `${templateName.replace(/\s+/g, '_')}_${patientInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success(`${templateName} generated successfully`);
      onDocumentGenerated?.(template, { fileName, content: doc.output() });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  }, [encounterData, patientInfo, providerInfo, customizations, onDocumentGenerated]);

  // Helper functions for different document types
  const generateComprehensiveNote = async (doc: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let yPos = startY;

    // SOAP sections
    const sections = [
      { title: 'SUBJECTIVE', content: encounterData.subjective },
      { title: 'OBJECTIVE', content: encounterData.objective },
      { title: 'ASSESSMENT', content: encounterData.assessment },
      { title: 'PLAN', content: encounterData.plan }
    ];

    sections.forEach(section => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content || 'No information documented.', pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 10;
    });

    // Add diagnoses if enabled
    if (customizations.includeDiagnoses && encounterData.diagnoses.length > 0) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNOSES', 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      encounterData.diagnoses.forEach((diagnosis, index) => {
        doc.text(`${index + 1}. ${diagnosis.code} - ${diagnosis.description}`, 25, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Add procedures if enabled
    if (customizations.includeProcedures && encounterData.procedures.length > 0) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('PROCEDURES', 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      encounterData.procedures.forEach((procedure, index) => {
        doc.text(`${index + 1}. ${procedure.code} - ${procedure.description}`, 25, yPos);
        yPos += 6;
      });
    }
  };

  const generateDischargeSummary = async (doc: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let yPos = startY;

    doc.setFont('helvetica', 'bold');
    doc.text('DISCHARGE SUMMARY', 20, yPos);
    yPos += 15;

    const sections = [
      { title: 'ADMISSION DIAGNOSIS', content: encounterData.diagnoses.map(d => d.description).join(', ') || 'Not specified' },
      { title: 'DISCHARGE DIAGNOSIS', content: encounterData.diagnoses.map(d => d.description).join(', ') || 'Not specified' },
      { title: 'HOSPITAL COURSE', content: encounterData.objective + '\n\n' + encounterData.assessment },
      { title: 'DISCHARGE INSTRUCTIONS', content: encounterData.plan },
      { title: 'FOLLOW-UP', content: 'As outlined in treatment plan' }
    ];

    sections.forEach(section => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(section.title + ':', 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 10;
    });
  };

  const generateReferralLetter = async (doc: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let yPos = startY;

    doc.setFont('helvetica', 'normal');
    doc.text('Dear Colleague,', 20, yPos);
    yPos += 15;

    const referralContent = `I am referring ${patientInfo.name} for your evaluation and management. 

Patient presents with: ${encounterData.subjective}

Clinical findings: ${encounterData.objective}

Assessment: ${encounterData.assessment}

I would appreciate your evaluation and recommendations for continued care.

Thank you for your time and expertise.`;

    const lines = doc.splitTextToSize(referralContent, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6 + 20;

    doc.text('Sincerely,', 20, yPos);
  };

  const generatePatientSummary = async (doc: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let yPos = startY;

    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT VISIT SUMMARY', 20, yPos);
    yPos += 15;

    doc.setFont('helvetica', 'normal');
    const summaryContent = `Visit Date: ${new Date(encounterData.createdAt).toLocaleDateString()}

Chief Complaint: ${encounterData.subjective.split('.')[0] || 'Not specified'}

Your provider evaluated your condition and found:
${encounterData.assessment}

Your treatment plan includes:
${encounterData.plan}

Please follow up as recommended and contact our office with any questions.`;

    const lines = doc.splitTextToSize(summaryContent, pageWidth - 40);
    doc.text(lines, 20, yPos);
  };

  const generateBillingSummary = async (doc: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let yPos = startY;

    doc.setFont('helvetica', 'bold');
    doc.text('BILLING DOCUMENTATION', 20, yPos);
    yPos += 15;

    // Create table for diagnoses
    if (encounterData.diagnoses.length > 0) {
      const diagnosisData = encounterData.diagnoses.map(d => [d.code, d.description]);
      (doc as any).autoTable({
        head: [['ICD-10 Code', 'Description']],
        body: diagnosisData,
        startY: yPos,
        margin: { left: 20 },
        styles: { fontSize: 10 }
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Create table for procedures
    if (encounterData.procedures.length > 0) {
      const procedureData = encounterData.procedures.map(p => [p.code, p.description, `$${p.fee || 0}`]);
      (doc as any).autoTable({
        head: [['CPT Code', 'Description', 'Fee']],
        body: procedureData,
        startY: yPos,
        margin: { left: 20 },
        styles: { fontSize: 10 }
      });
    }
  };

  const generateProcedureNote = async (doc: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let yPos = startY;

    doc.setFont('helvetica', 'bold');
    doc.text('PROCEDURE NOTE', 20, yPos);
    yPos += 15;

    const sections = [
      { title: 'INDICATION', content: encounterData.assessment },
      { title: 'PROCEDURE PERFORMED', content: encounterData.procedures.map(p => p.description).join(', ') || 'See objective findings' },
      { title: 'TECHNIQUE', content: encounterData.objective },
      { title: 'FINDINGS', content: encounterData.assessment },
      { title: 'COMPLICATIONS', content: 'None reported' },
      { title: 'POST-PROCEDURE PLAN', content: encounterData.plan }
    ];

    sections.forEach(section => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(section.title + ':', 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 10;
    });
  };

  const generateTreatmentPlan = async (doc: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let yPos = startY;

    doc.setFont('helvetica', 'bold');
    doc.text('TREATMENT PLAN', 20, yPos);
    yPos += 15;

    const sections = [
      { title: 'CURRENT DIAGNOSES', content: encounterData.diagnoses.map(d => `• ${d.description}`).join('\n') || 'None documented' },
      { title: 'TREATMENT GOALS', content: 'Improve patient symptoms and overall health status' },
      { title: 'INTERVENTIONS', content: encounterData.plan },
      { title: 'MONITORING PLAN', content: 'Regular follow-up as outlined in plan' },
      { title: 'PATIENT EDUCATION', content: 'Patient educated on condition and treatment options' }
    ];

    sections.forEach(section => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 10;
    });
  };

  const generateConsultationReport = async (doc: jsPDF, startY: number, pageWidth: number, pageHeight: number) => {
    let yPos = startY;

    doc.setFont('helvetica', 'bold');
    doc.text('CONSULTATION REPORT', 20, yPos);
    yPos += 15;

    const sections = [
      { title: 'REASON FOR CONSULTATION', content: encounterData.subjective },
      { title: 'HISTORY OF PRESENT ILLNESS', content: encounterData.subjective },
      { title: 'PHYSICAL EXAMINATION', content: encounterData.objective },
      { title: 'IMPRESSION', content: encounterData.assessment },
      { title: 'RECOMMENDATIONS', content: encounterData.plan }
    ];

    sections.forEach(section => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(section.title, 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 10;
    });
  };

  const categories = [...new Set(documentTemplates.map(t => t.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Advanced Document Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Document Templates</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documentTemplates
                      .filter(template => template.category === category)
                      .map(template => {
                        const Icon = template.icon;
                        return (
                          <Card 
                            key={template.id}
                            className={`cursor-pointer transition-colors hover:bg-accent ${selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Icon className="h-5 w-5 text-primary mt-1" />
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{template.name}</h5>
                                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => generatePDF(selectedTemplate)}
                disabled={isGenerating}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate & Download'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customization" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(customizations).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setCustomizations(prev => ({ ...prev, [key]: !!checked }))
                      }
                    />
                    <label 
                      htmlFor={key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedDocumentGenerator;