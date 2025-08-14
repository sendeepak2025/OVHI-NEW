import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Send, CheckCircle, XCircle, Clock, Phone, 
  Mail, AlertTriangle, Download, Eye, Printer, History
} from 'lucide-react';
import { toast } from 'sonner';
import { Patient, MedicalRecord } from '@/types/dataTypes';

interface FaxRequest {
  id: string;
  patientId: string;
  recipientName: string;
  recipientFax: string;
  recipientPhone: string;
  recipientEmail?: string;
  recordsSelected: string[];
  requestType: 'complete' | 'selective' | 'summary';
  urgency: 'routine' | 'urgent' | 'stat';
  coverLetter: string;
  hipaaCompliant: boolean;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentBy: string;
  sentDate: Date;
  deliveryConfirmation?: Date;
  failureReason?: string;
  pageCount?: number;
  estimatedCost?: number;
}

interface MedicalRecordsFaxManagerProps {
  patient: Patient;
  medicalRecords: MedicalRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MedicalRecordsFaxManager: React.FC<MedicalRecordsFaxManagerProps> = ({
  patient,
  medicalRecords,
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('send');
  const [faxHistory, setFaxHistory] = useState<FaxRequest[]>([]);
  const [newFaxRequest, setNewFaxRequest] = useState<Partial<FaxRequest>>({
    recipientName: '',
    recipientFax: '',
    recipientPhone: '',
    recipientEmail: '',
    recordsSelected: [],
    requestType: 'selective',
    urgency: 'routine',
    coverLetter: '',
    hipaaCompliant: false
  });
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadFaxHistory();
    generateCoverLetter();
  }, [patient]);

  const loadFaxHistory = async () => {
    // Mock fax history data - replace with actual API call
    const mockHistory: FaxRequest[] = [
      {
        id: '1',
        patientId: patient.patientId?.toString() || '',
        recipientName: 'Dr. Sarah Johnson',
        recipientFax: '555-123-4567',
        recipientPhone: '555-123-4568',
        recordsSelected: ['1', '2'],
        requestType: 'selective',
        urgency: 'routine',
        coverLetter: 'Please find attached medical records...',
        hipaaCompliant: true,
        status: 'delivered',
        sentBy: 'Dr. Smith',
        sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        deliveryConfirmation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
        pageCount: 8,
        estimatedCost: 2.40
      }
    ];
    setFaxHistory(mockHistory);
  };

  const generateCoverLetter = () => {
    const defaultCoverLetter = `
CONFIDENTIAL MEDICAL RECORDS TRANSMISSION

TO: [Recipient Name]
FAX: [Recipient Fax]
FROM: [Practice Name]
DATE: ${new Date().toLocaleDateString()}

PATIENT: ${patient.firstName} ${patient.lastName}
DOB: ${patient.birthDate}
PATIENT ID: ${patient.patientId}

Dear Healthcare Provider,

Please find attached the requested medical records for the above-named patient. These records are being transmitted in accordance with HIPAA regulations and with appropriate patient authorization.

The transmission includes:
- [Selected Records]

If you have any questions regarding these records or need additional information, please contact our office at [Practice Phone].

This communication contains confidential information. If you are not the intended recipient, please notify us immediately and destroy this transmission.

Sincerely,
[Provider Name]
[Practice Name]
    `.trim();

    setNewFaxRequest(prev => ({
      ...prev,
      coverLetter: defaultCoverLetter
    }));
  };

  const handleRecordSelection = (recordId: string, checked: boolean) => {
    setSelectedRecords(prev => {
      if (checked) {
        return [...prev, recordId];
      } else {
        return prev.filter(id => id !== recordId);
      }
    });
    
    setNewFaxRequest(prev => ({
      ...prev,
      recordsSelected: checked 
        ? [...(prev.recordsSelected || []), recordId]
        : (prev.recordsSelected || []).filter(id => id !== recordId)
    }));
  };

  const handlePreview = () => {
    const selectedRecordsList = medicalRecords
      .filter(record => selectedRecords.includes(record.id))
      .map(record => `- ${record.type}: ${record.description}`)
      .join('\n');
    
    const previewText = newFaxRequest.coverLetter
      ?.replace('[Recipient Name]', newFaxRequest.recipientName || '[Recipient Name]')
      ?.replace('[Recipient Fax]', newFaxRequest.recipientFax || '[Recipient Fax]')
      ?.replace('[Selected Records]', selectedRecordsList || '[No records selected]')
      ?.replace('[Practice Name]', 'Your Practice Name')
      ?.replace('[Practice Phone]', '(555) 123-4567')
      ?.replace('[Provider Name]', 'Dr. Provider Name');
    
    setPreviewContent(previewText || '');
    setIsPreviewOpen(true);
  };

  const handleSendFax = async () => {
    if (!newFaxRequest.recipientName || !newFaxRequest.recipientFax) {
      toast.error('Please fill in recipient information');
      return;
    }

    if (!newFaxRequest.hipaaCompliant) {
      toast.error('HIPAA compliance confirmation is required');
      return;
    }

    if (selectedRecords.length === 0) {
      toast.error('Please select at least one medical record');
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call to send fax
      await new Promise(resolve => setTimeout(resolve, 2000));

      const faxRequest: FaxRequest = {
        id: Date.now().toString(),
        patientId: patient.patientId?.toString() || '',
        ...newFaxRequest as FaxRequest,
        status: 'sent',
        sentBy: 'Current User',
        sentDate: new Date(),
        pageCount: calculatePageCount(),
        estimatedCost: calculateCost()
      };

      setFaxHistory(prev => [faxRequest, ...prev]);
      
      toast.success('Fax sent successfully');
      
      // Reset form
      setNewFaxRequest({
        recipientName: '',
        recipientFax: '',
        recipientPhone: '',
        recipientEmail: '',
        recordsSelected: [],
        requestType: 'selective',
        urgency: 'routine',
        coverLetter: '',
        hipaaCompliant: false
      });
      setSelectedRecords([]);
      
      setActiveTab('history');
    } catch (error) {
      toast.error('Failed to send fax');
    } finally {
      setIsSending(false);
    }
  };

  const calculatePageCount = () => {
    return selectedRecords.length * 2 + 1; // Estimate 2 pages per record + cover letter
  };

  const calculateCost = () => {
    const pageCount = calculatePageCount();
    return pageCount * 0.30; // $0.30 per page
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Medical Records Fax Manager - {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">Send Fax</TabsTrigger>
            <TabsTrigger value="history">Fax History</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Send Fax Tab */}
          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recipient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Recipient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      value={newFaxRequest.recipientName || ''}
                      onChange={(e) => setNewFaxRequest(prev => ({
                        ...prev,
                        recipientName: e.target.value
                      }))}
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="recipientFax">Fax Number *</Label>
                    <Input
                      id="recipientFax"
                      value={newFaxRequest.recipientFax || ''}
                      onChange={(e) => setNewFaxRequest(prev => ({
                        ...prev,
                        recipientFax: e.target.value
                      }))}
                      placeholder="555-123-4567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="recipientPhone">Phone Number</Label>
                    <Input
                      id="recipientPhone"
                      value={newFaxRequest.recipientPhone || ''}
                      onChange={(e) => setNewFaxRequest(prev => ({
                        ...prev,
                        recipientPhone: e.target.value
                      }))}
                      placeholder="555-123-4568"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="recipientEmail">Email (optional)</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={newFaxRequest.recipientEmail || ''}
                      onChange={(e) => setNewFaxRequest(prev => ({
                        ...prev,
                        recipientEmail: e.target.value
                      }))}
                      placeholder="doctor@clinic.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="requestType">Request Type</Label>
                      <Select
                        value={newFaxRequest.requestType}
                        onValueChange={(value) => setNewFaxRequest(prev => ({
                          ...prev,
                          requestType: value as 'complete' | 'selective' | 'summary'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="complete">Complete Records</SelectItem>
                          <SelectItem value="selective">Selected Records</SelectItem>
                          <SelectItem value="summary">Summary Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="urgency">Urgency</Label>
                      <Select
                        value={newFaxRequest.urgency}
                        onValueChange={(value) => setNewFaxRequest(prev => ({
                          ...prev,
                          urgency: value as 'routine' | 'urgent' | 'stat'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Record Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Select Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {medicalRecords.map((record) => (
                      <div key={record.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`record-${record.id}`}
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => 
                            handleRecordSelection(record.id, checked as boolean)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <Label 
                            htmlFor={`record-${record.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {record.type}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {record.provider}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedRecords.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>{selectedRecords.length} record(s) selected</span>
                        <span>Est. {calculatePageCount()} pages • ${calculateCost().toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Cover Letter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={newFaxRequest.coverLetter || ''}
                  onChange={(e) => setNewFaxRequest(prev => ({
                    ...prev,
                    coverLetter: e.target.value
                  }))}
                  rows={10}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* HIPAA Compliance and Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hipaa-compliance"
                      checked={newFaxRequest.hipaaCompliant}
                      onCheckedChange={(checked) => setNewFaxRequest(prev => ({
                        ...prev,
                        hipaaCompliant: checked as boolean
                      }))}
                    />
                    <Label htmlFor="hipaa-compliance" className="text-sm">
                      I confirm that this transmission complies with HIPAA regulations and patient authorization has been obtained
                    </Label>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handlePreview}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={handleSendFax} 
                      disabled={isSending || !newFaxRequest.hipaaCompliant}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSending ? 'Sending...' : 'Send Fax'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fax History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  Fax Transmission History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faxHistory.map((fax) => (
                    <div key={fax.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(fax.status)}
                            <h4 className="font-medium">{fax.recipientName}</h4>
                            <Badge className={getStatusColor(fax.status)}>
                              {fax.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Fax:</span> {fax.recipientFax}
                            </div>
                            <div>
                              <span className="font-medium">Sent:</span> {fax.sentDate.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Pages:</span> {fax.pageCount} • ${fax.estimatedCost?.toFixed(2)}
                            </div>
                          </div>
                          
                          {fax.deliveryConfirmation && (
                            <div className="text-sm text-green-600 mt-1">
                              Delivered: {fax.deliveryConfirmation.toLocaleString()}
                            </div>
                          )}
                          
                          {fax.failureReason && (
                            <div className="text-sm text-red-600 mt-1">
                              Failed: {fax.failureReason}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>General Practice</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Specialist Referral</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Insurance Request</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Legal Request</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fax Preview</DialogTitle>
            </DialogHeader>
            <div className="bg-white p-6 border rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {previewContent}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalRecordsFaxManager;