import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';

interface DiagnosisItem {
  id: string;
  code: string;
  description: string;
  category: string;
  status?: 'active' | 'resolved' | 'rule-out' | 'chronic';
  dateAdded?: string;
  addedBy?: string;
  notes?: string;
  billable?: boolean;
  confidence?: number;
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
  license?: string;
  specialty?: string;
  signature?: string;
}

interface PracticeInfo {
  name: string;
  address: string;
  phone: string;
  fax?: string;
  email?: string;
  logo?: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  type: 'diagnosis-summary' | 'progress-note' | 'superbill' | 'referral' | 'patient-instructions';
  description: string;
}

interface DiagnosisDocumentGeneratorProps {
  diagnoses: DiagnosisItem[];
  patientInfo?: PatientInfo;
  providerInfo?: ProviderInfo;
  practiceInfo?: PracticeInfo;
  encounterId?: string;
  encounterDate?: string;
  onDocumentGenerated?: (document: any) => void;
}

const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'diagnosis-summary',
    name: 'Diagnosis Summary',
    type: 'diagnosis-summary',
    description: 'Comprehensive list of patient diagnoses with details'
  },
  {
    id: 'progress-note',
    name: 'Progress Note',
    type: 'progress-note',
    description: 'Clinical progress note with diagnosis updates'
  },
  {
    id: 'superbill',
    name: 'Superbill/Encounter Form',
    type: 'superbill',
    description: 'Billing document with diagnosis codes'
  },
  {
    id: 'referral',
    name: 'Referral Letter',
    type: 'referral',
    description: 'Referral to specialist with diagnosis information'
  },
  {
    id: 'patient-instructions',
    name: 'Patient Instructions',
    type: 'patient-instructions',
    description: 'Patient-friendly diagnosis explanations and instructions'
  }
];

export const DiagnosisDocumentGenerator: React.FC<DiagnosisDocumentGeneratorProps> = ({
  diagnoses,
  patientInfo,
  providerInfo,
  practiceInfo,
  encounterId,
  encounterDate,
  onDocumentGenerated
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(DOCUMENT_TEMPLATES[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeBillable, setIncludeBillable] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');

  const generateDiagnosisSummary = useCallback(() => {
    const activediagnoses = diagnoses.filter(d => d.status === 'active');
    const chronicDiagnoses = diagnoses.filter(d => d.status === 'chronic');
    const resolvedDiagnoses = diagnoses.filter(d => d.status === 'resolved');

    let summary = `DIAGNOSIS SUMMARY\n\n`;
    
    if (patientInfo) {
      summary += `Patient: ${patientInfo.name}\n`;
      summary += `DOB: ${new Date(patientInfo.dateOfBirth).toLocaleDateString()}\n`;
      summary += `MRN: ${patientInfo.mrn || 'N/A'}\n`;
      summary += `Date: ${encounterDate ? new Date(encounterDate).toLocaleDateString() : new Date().toLocaleDateString()}\n\n`;
    }

    if (activediagnoses.length > 0) {
      summary += `ACTIVE DIAGNOSES:\n`;
      activediagnoses.forEach((dx, index) => {
        summary += `${index + 1}. ${dx.code} - ${dx.description}`;
        if (dx.notes) summary += ` (${dx.notes})`;
        summary += `\n`;
      });
      summary += `\n`;
    }

    if (chronicDiagnoses.length > 0) {
      summary += `CHRONIC CONDITIONS:\n`;
      chronicDiagnoses.forEach((dx, index) => {
        summary += `${index + 1}. ${dx.code} - ${dx.description}`;
        if (dx.notes) summary += ` (${dx.notes})`;
        summary += `\n`;
      });
      summary += `\n`;
    }

    if (includeHistory && resolvedDiagnoses.length > 0) {
      summary += `RESOLVED DIAGNOSES:\n`;
      resolvedDiagnoses.forEach((dx, index) => {
        summary += `${index + 1}. ${dx.code} - ${dx.description}`;
        if (dx.dateAdded) summary += ` - Resolved ${new Date(dx.dateAdded).toLocaleDateString()}`;
        summary += `\n`;
      });
      summary += `\n`;
    }

    if (customNotes) {
      summary += `ADDITIONAL NOTES:\n${customNotes}\n\n`;
    }

    if (providerInfo) {
      summary += `Provider: ${providerInfo.name}, ${providerInfo.title}\n`;
      if (providerInfo.npi) summary += `NPI: ${providerInfo.npi}\n`;
    }

    return summary;
  }, [diagnoses, patientInfo, providerInfo, encounterDate, includeHistory, customNotes]);

  const generateProgressNote = useCallback(() => {
    let note = `PROGRESS NOTE\n\n`;
    
    if (patientInfo) {
      note += `Patient: ${patientInfo.name}\n`;
      note += `DOB: ${new Date(patientInfo.dateOfBirth).toLocaleDateString()}\n`;
      note += `Date of Service: ${encounterDate ? new Date(encounterDate).toLocaleDateString() : new Date().toLocaleDateString()}\n\n`;
    }

    note += `ASSESSMENT:\n`;
    diagnoses
      .filter(d => d.status === 'active' || d.status === 'chronic')
      .forEach((dx, index) => {
        note += `${index + 1}. ${dx.description} (${dx.code})`;
        if (dx.status === 'chronic') note += ` - Chronic`;
        note += `\n`;
        if (dx.notes) note += `   Note: ${dx.notes}\n`;
      });

    note += `\nPLAN:\n`;
    note += `- Continue current management for chronic conditions\n`;
    note += `- Monitor symptoms and response to treatment\n`;
    note += `- Follow-up as scheduled\n`;

    if (customNotes) {
      note += `\nADDITIONAL NOTES:\n${customNotes}\n`;
    }

    note += `\n${providerInfo?.name || 'Provider'}, ${providerInfo?.title || 'MD'}\n`;
    note += `Date: ${new Date().toLocaleDateString()}\n`;

    return note;
  }, [diagnoses, patientInfo, providerInfo, encounterDate, customNotes]);

  const generateSuperbill = useCallback(() => {
    const billableDiagnoses = diagnoses.filter(d => d.billable && (d.status === 'active' || d.status === 'chronic'));
    
    let superbill = `SUPERBILL / ENCOUNTER FORM\n\n`;
    
    if (practiceInfo) {
      superbill += `${practiceInfo.name}\n`;
      superbill += `${practiceInfo.address}\n`;
      superbill += `Phone: ${practiceInfo.phone}\n`;
      if (practiceInfo.fax) superbill += `Fax: ${practiceInfo.fax}\n`;
      superbill += `\n`;
    }

    if (patientInfo) {
      superbill += `PATIENT INFORMATION:\n`;
      superbill += `Name: ${patientInfo.name}\n`;
      superbill += `DOB: ${new Date(patientInfo.dateOfBirth).toLocaleDateString()}\n`;
      superbill += `MRN: ${patientInfo.mrn || 'N/A'}\n\n`;
    }

    superbill += `ENCOUNTER INFORMATION:\n`;
    superbill += `Date of Service: ${encounterDate ? new Date(encounterDate).toLocaleDateString() : new Date().toLocaleDateString()}\n`;
    superbill += `Provider: ${providerInfo?.name || 'Provider'}\n`;
    if (providerInfo?.npi) superbill += `NPI: ${providerInfo.npi}\n`;
    superbill += `\n`;

    superbill += `DIAGNOSIS CODES (ICD-10):\n`;
    billableDiagnoses.forEach((dx, index) => {
      superbill += `${index + 1}. ${dx.code} - ${dx.description}\n`;
    });

    if (customNotes) {
      superbill += `\nNOTES:\n${customNotes}\n`;
    }

    return superbill;
  }, [diagnoses, patientInfo, providerInfo, practiceInfo, encounterDate, customNotes]);

  const generatePatientInstructions = useCallback(() => {
    let instructions = `PATIENT DIAGNOSIS INFORMATION\n\n`;
    
    instructions += `Dear ${patientInfo?.name || 'Patient'},\n\n`;
    instructions += `This document provides information about your current medical diagnoses and recommendations for care.\n\n`;

    const activeDiagnoses = diagnoses.filter(d => d.status === 'active' || d.status === 'chronic');
    
    if (activeDiagnoses.length > 0) {
      instructions += `YOUR CURRENT DIAGNOSES:\n\n`;
      activeDiagnoses.forEach((dx, index) => {
        instructions += `${index + 1}. ${dx.description}\n`;
        instructions += `   Code: ${dx.code}\n`;
        if (dx.status === 'chronic') {
          instructions += `   This is a chronic condition that requires ongoing management.\n`;
        }
        if (dx.notes) {
          instructions += `   Note: ${dx.notes}\n`;
        }
        instructions += `\n`;
      });
    }

    instructions += `GENERAL RECOMMENDATIONS:\n`;
    instructions += `- Follow your prescribed treatment plan\n`;
    instructions += `- Take medications as directed\n`;
    instructions += `- Keep all follow-up appointments\n`;
    instructions += `- Contact our office with any questions or concerns\n\n`;

    if (customNotes) {
      instructions += `ADDITIONAL INSTRUCTIONS:\n${customNotes}\n\n`;
    }

    if (practiceInfo) {
      instructions += `CONTACT INFORMATION:\n`;
      instructions += `${practiceInfo.name}\n`;
      instructions += `Phone: ${practiceInfo.phone}\n`;
      if (practiceInfo.email) instructions += `Email: ${practiceInfo.email}\n`;
    }

    return instructions;
  }, [diagnoses, patientInfo, practiceInfo, customNotes]);

  const generateDocument = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      let document = '';
      
      switch (selectedTemplate.type) {
        case 'diagnosis-summary':
          document = generateDiagnosisSummary();
          break;
        case 'progress-note':
          document = generateProgressNote();
          break;
        case 'superbill':
          document = generateSuperbill();
          break;
        case 'patient-instructions':
          document = generatePatientInstructions();
          break;
        default:
          document = generateDiagnosisSummary();
      }
      
      setGeneratedDocument(document);
      onDocumentGenerated?.(document);
      toast.success('Document generated successfully');
      
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, generateDiagnosisSummary, generateProgressNote, generateSuperbill, generatePatientInstructions, onDocumentGenerated]);

  const downloadDocument = useCallback(() => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.name}_${patientInfo?.name || 'Patient'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Document downloaded');
  }, [generatedDocument, selectedTemplate.name, patientInfo?.name]);

  const printDocument = useCallback(() => {
    if (!generatedDocument) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedTemplate.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre>${generatedDocument}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [generatedDocument, selectedTemplate.name]);

  const billableDiagnoses = diagnoses.filter(d => d.billable);
  const activeDiagnoses = diagnoses.filter(d => d.status === 'active');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Diagnosis Document Generator
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{diagnoses.length} total diagnoses</span>
          <span>{activeDiagnoses.length} active</span>
          <span>{billableDiagnoses.length} billable</span>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Document Template</label>
              <Select
                value={selectedTemplate.id}
                onValueChange={(value) => {
                  const template = DOCUMENT_TEMPLATES.find(t => t.id === value);
                  if (template) setSelectedTemplate(template);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Include Options</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeHistory}
                      onChange={(e) => setIncludeHistory(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Include resolved diagnoses</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeBillable}
                      onChange={(e) => setIncludeBillable(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Billable codes only</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Document Date</label>
                <Input
                  type="date"
                  value={encounterDate ? encounterDate.split('T')[0] : new Date().toISOString().split('T')[0]}
                  onChange={(e) => {/* Handle date change */}}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes</label>
              <Textarea
                placeholder="Add any additional notes or instructions..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateDocument} 
                disabled={isGenerating || diagnoses.length === 0}
                className="flex-1"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Document'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {generatedDocument ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{selectedTemplate.name} Preview</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={generateDocument}>
                      Regenerate
                    </Button>
                  </div>
                </div>
                <Card className="p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded overflow-auto max-h-96">
                    {generatedDocument}
                  </pre>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No document generated yet</p>
                <p className="text-sm">Generate a document to see the preview</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            {generatedDocument ? (
              <div className="space-y-4">
                <h3 className="font-medium">Export Options</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={downloadDocument} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Text
                  </Button>
                  
                  <Button onClick={printDocument} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  
                  <Button variant="outline" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  
                  <Button variant="outline" disabled>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Document will be saved with patient name and current date.</p>
                  <p>PDF export and email functionality coming soon.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Share className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate a document first to see export options</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};