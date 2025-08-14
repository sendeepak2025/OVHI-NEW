import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { FileText, Download, Upload, CheckCircle, AlertTriangle, Clock, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface EDITransaction {
  id: string;
  transactionType: '270' | '271' | '276' | '277' | '837P' | '835';
  controlNumber: string;
  status: 'pending' | 'processed' | 'accepted' | 'rejected' | 'error';
  createdAt: string;
  processedAt?: string;
  fileSize: number;
  recordCount: number;
  errors?: string[];
  warnings?: string[];
  claimMDTrackingId?: string;
}

interface ClaimData {
  patientId: string;
  patientName: string;
  memberId: string;
  payerId: string;
  serviceDate: string;
  totalCharges: number;
  procedureCodes: string[];
  diagnosisCodes: string[];
  providerNPI: string;
  facilityNPI?: string;
}

const EDITransactionManager: React.FC = () => {
  const [transactions, setTransactions] = useState<EDITransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<EDITransaction | null>(null);
  const [ediContent, setEdiContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generate 837P EDI transaction for claims submission
  const generate837P = useCallback(async (claimData: ClaimData): Promise<string> => {
    const controlNumber = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const currentTime = new Date().toTimeString().slice(0, 8).replace(/:/g, '');

    // ISA Header
    const isaHeader = [
      'ISA',
      '00', '          ', // Authorization info
      '00', '          ', // Security info
      'ZZ', 'SUBMITTER     ', // Submitter ID
      'ZZ', 'CLAIMMD       ', // Receiver ID
      currentDate,
      currentTime,
      '^',
      '00501',
      controlNumber,
      '0',
      'P',
      '>'
    ].join('*') + '~';

    // GS Header
    const gsHeader = [
      'GS',
      'HC', // Functional ID for Healthcare Claim
      'SUBMITTER',
      'CLAIMMD',
      currentDate,
      currentTime,
      '1',
      'X',
      '005010X222A1'
    ].join('*') + '~';

    // ST Header
    const stHeader = [
      'ST',
      '837',
      '0001'
    ].join('*') + '~';

    // BHT Header
    const bhtHeader = [
      'BHT',
      '0019',
      '00',
      controlNumber,
      currentDate,
      currentTime,
      'CH'
    ].join('*') + '~';

    // Submitter Information
    const submitterLoop = [
      ['NM1', '41', '2', 'PRACTICE NAME', '', '', '', '', 'XX', '1234567890'].join('*') + '~',
      ['PER', 'IC', 'CONTACT NAME', 'TE', '5551234567'].join('*') + '~'
    ].join('');

    // Receiver Information
    const receiverLoop = [
      ['NM1', '40', '2', 'CLAIM MD', '', '', '', '', 'XX', 'CLAIMMD'].join('*') + '~'
    ].join('');

    // Provider Information
    const providerLoop = [
      ['HL', '1', '', '20', '1'].join('*') + '~',
      ['PRV', 'BI', 'PXC', '207Q00000X'].join('*') + '~',
      ['NM1', '85', '2', 'PROVIDER NAME', '', '', '', '', 'XX', claimData.providerNPI].join('*') + '~'
    ].join('');

    // Patient Information
    const patientLoop = [
      ['HL', '2', '1', '22', '0'].join('*') + '~',
      ['SBR', 'P', '18', '', '', '', '', '', 'CI'].join('*') + '~',
      ['NM1', 'IL', '1', claimData.patientName.split(' ')[1] || '', claimData.patientName.split(' ')[0] || '', '', '', '', 'MI', claimData.memberId].join('*') + '~',
      ['DMG', 'D8', '19900101', 'M'].join('*') + '~'
    ].join('');

    // Claim Information
    const claimLoop = [
      ['CLM', controlNumber, claimData.totalCharges.toString(), '', '', '12:B:1', 'Y', 'A', 'Y', 'I'].join('*') + '~',
      ['DTP', '431', 'D8', claimData.serviceDate.replace(/-/g, '')].join('*') + '~',
      ['HI', `BK:${claimData.diagnosisCodes[0] || 'Z00.00'}`].join('*') + '~'
    ].join('');

    // Service Lines
    const serviceLines = claimData.procedureCodes.map((code, index) => {
      return [
        ['LX', (index + 1).toString()].join('*') + '~',
        ['SV1', 'HC:' + code, '100.00', 'UN', '1', '', '', ''].join('*') + '~',
        ['DTP', '472', 'D8', claimData.serviceDate.replace(/-/g, '')].join('*') + '~'
      ].join('');
    }).join('');

    // Trailers
    const seTrailer = ['SE', '25', '0001'].join('*') + '~';
    const geTrailer = ['GE', '1', '1'].join('*') + '~';
    const ieaTrailer = ['IEA', '1', controlNumber].join('*') + '~';

    const ediContent = [
      isaHeader,
      gsHeader,
      stHeader,
      bhtHeader,
      submitterLoop,
      receiverLoop,
      providerLoop,
      patientLoop,
      claimLoop,
      serviceLines,
      seTrailer,
      geTrailer,
      ieaTrailer
    ].join('');

    return ediContent;
  }, []);

  // Validate EDI transaction before submission
  const validateEDI = useCallback((ediContent: string): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation checks
    if (!ediContent.includes('ISA*')) {
      errors.push('Missing ISA header segment');
    }

    if (!ediContent.includes('GS*')) {
      errors.push('Missing GS header segment');
    }

    if (!ediContent.includes('ST*837*')) {
      errors.push('Missing ST header for 837 transaction');
    }

    if (!ediContent.includes('SE*')) {
      errors.push('Missing SE trailer segment');
    }

    if (!ediContent.includes('IEA*')) {
      errors.push('Missing IEA trailer segment');
    }

    // Check for required loops
    if (!ediContent.includes('NM1*85*')) {
      errors.push('Missing billing provider information (NM1*85)');
    }

    if (!ediContent.includes('CLM*')) {
      errors.push('Missing claim information (CLM)');
    }

    // Warnings for best practices
    if (ediContent.length > 1000000) {
      warnings.push('File size exceeds 1MB - consider splitting into multiple files');
    }

    if (!ediContent.includes('HI*BK')) {
      warnings.push('No diagnosis codes found - this may cause claim rejection');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // Process incoming EDI transaction
  const processEDITransaction = useCallback(async (file: File): Promise<void> => {
    setIsGenerating(true);
    try {
      const content = await file.text();
      const validation = validateEDI(content);
      
      const transaction: EDITransaction = {
        id: `txn_${Date.now()}`,
        transactionType: content.includes('ST*837*') ? '837P' : 
                        content.includes('ST*270*') ? '270' :
                        content.includes('ST*271*') ? '271' :
                        content.includes('ST*276*') ? '276' :
                        content.includes('ST*277*') ? '277' : '835',
        controlNumber: extractControlNumber(content),
        status: validation.isValid ? 'pending' : 'error',
        createdAt: new Date().toISOString(),
        fileSize: file.size,
        recordCount: (content.match(/CLM\*/g) || []).length,
        errors: validation.errors,
        warnings: validation.warnings
      };

      setTransactions(prev => [transaction, ...prev]);
      
      if (validation.isValid) {
        toast.success('EDI transaction processed successfully');
      } else {
        toast.error('EDI transaction contains errors');
      }
    } catch (error) {
      toast.error('Failed to process EDI transaction');
    } finally {
      setIsGenerating(false);
    }
  }, [validateEDI]);

  // Extract control number from EDI content
  const extractControlNumber = (content: string): string => {
    const isaMatch = content.match(/ISA\*[^*]*\*[^*]*\*[^*]*\*[^*]*\*[^*]*\*[^*]*\*[^*]*\*[^*]*\*\d{8}\*\d{6}\*[^*]*\*[^*]*\*(\d+)/);
    return isaMatch ? isaMatch[1] : 'UNKNOWN';
  };

  // Generate sample claim for testing
  const generateSampleClaim = async () => {
    setIsGenerating(true);
    try {
      const sampleClaimData: ClaimData = {
        patientId: 'PAT123',
        patientName: 'John Doe',
        memberId: 'MEM123456789',
        payerId: 'PAYER001',
        serviceDate: '2024-01-15',
        totalCharges: 250.00,
        procedureCodes: ['99213', '90834'],
        diagnosisCodes: ['F32.9', 'Z71.1'],
        providerNPI: '1234567890'
      };

      const ediContent = await generate837P(sampleClaimData);
      setEdiContent(ediContent);
      
      const validation = validateEDI(ediContent);
      const transaction: EDITransaction = {
        id: `txn_${Date.now()}`,
        transactionType: '837P',
        controlNumber: extractControlNumber(ediContent),
        status: validation.isValid ? 'pending' : 'error',
        createdAt: new Date().toISOString(),
        fileSize: ediContent.length,
        recordCount: 1,
        errors: validation.errors,
        warnings: validation.warnings
      };

      setTransactions(prev => [transaction, ...prev]);
      toast.success('Sample 837P transaction generated');
    } catch (error) {
      toast.error('Failed to generate sample claim');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
      case 'error':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>EDI Transaction Manager</span>
            <div className="flex gap-2">
              <Button onClick={generateSampleClaim} disabled={isGenerating}>
                <FileText className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Sample 837P'}
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload EDI File
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{transactions.length}</div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.status === 'accepted').length}
              </div>
              <div className="text-sm text-muted-foreground">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {transactions.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.status === 'rejected' || t.status === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Rejected/Error</div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Control Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono">{transaction.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.transactionType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{transaction.controlNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.recordCount}</TableCell>
                  <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>
                              Transaction Details - {selectedTransaction?.id}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {selectedTransaction?.errors && selectedTransaction.errors.length > 0 && (
                              <div>
                                <h4 className="font-medium text-red-600 mb-2">Errors</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {selectedTransaction.errors.map((error, index) => (
                                    <li key={index} className="text-sm text-red-600">{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {selectedTransaction?.warnings && selectedTransaction.warnings.length > 0 && (
                              <div>
                                <h4 className="font-medium text-yellow-600 mb-2">Warnings</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {selectedTransaction.warnings.map((warning, index) => (
                                    <li key={index} className="text-sm text-yellow-600">{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-medium mb-2">EDI Content Preview</h4>
                              <Textarea
                                value={ediContent}
                                readOnly
                                rows={15}
                                className="font-mono text-xs"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EDITransactionManager;