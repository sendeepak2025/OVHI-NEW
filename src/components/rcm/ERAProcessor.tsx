import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Bot,
  Search,
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';

interface ERAFile {
  id: string;
  fileName: string;
  payerName: string;
  checkNumber: string;
  checkDate: string;
  totalAmount: number;
  claimsCount: number;
  status: 'received' | 'processing' | 'posted' | 'exception';
  receivedDate: string;
  processingProgress: number;
  exceptions?: string[];
}

interface ERATransaction {
  id: string;
  claimId: string;
  patientName: string;
  serviceDate: string;
  chargedAmount: number;
  allowedAmount: number;
  paidAmount: number;
  adjustmentAmount: number;
  adjustmentReason: string;
  status: 'posted' | 'pending' | 'exception';
}

const ERAProcessor: React.FC = () => {
  const [eraFiles, setEraFiles] = useState<ERAFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [autoProcessing, setAutoProcessing] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock ERA data
  React.useEffect(() => {
    const mockERAFiles: ERAFile[] = [
      {
        id: 'ERA001',
        fileName: 'ERA_BCBS_20240115.835',
        payerName: 'Blue Cross Blue Shield',
        checkNumber: 'CHK001234',
        checkDate: '2024-01-15',
        totalAmount: 15420.50,
        claimsCount: 25,
        status: 'posted',
        receivedDate: '2024-01-15 08:30:00',
        processingProgress: 100
      },
      {
        id: 'ERA002',
        fileName: 'ERA_MEDICARE_20240114.835',
        payerName: 'Medicare',
        checkNumber: 'CHK001235',
        checkDate: '2024-01-14',
        totalAmount: 8750.00,
        claimsCount: 18,
        status: 'processing',
        receivedDate: '2024-01-14 14:22:00',
        processingProgress: 65
      },
      {
        id: 'ERA003',
        fileName: 'ERA_AETNA_20240113.835',
        payerName: 'Aetna',
        checkNumber: 'CHK001236',
        checkDate: '2024-01-13',
        totalAmount: 3200.00,
        claimsCount: 8,
        status: 'exception',
        receivedDate: '2024-01-13 11:15:00',
        processingProgress: 45,
        exceptions: ['Invalid claim reference number', 'Adjustment code not recognized']
      }
    ];
    setEraFiles(mockERAFiles);
  }, []);

  const mockTransactions: ERATransaction[] = [
    {
      id: 'TXN001',
      claimId: 'CLM001',
      patientName: 'John Smith',
      serviceDate: '2024-01-10',
      chargedAmount: 250.00,
      allowedAmount: 200.00,
      paidAmount: 200.00,
      adjustmentAmount: 50.00,
      adjustmentReason: 'Contractual adjustment',
      status: 'posted'
    },
    {
      id: 'TXN002',
      claimId: 'CLM002',
      patientName: 'Sarah Johnson',
      serviceDate: '2024-01-09',
      chargedAmount: 180.00,
      allowedAmount: 180.00,
      paidAmount: 144.00,
      adjustmentAmount: 36.00,
      adjustmentReason: 'Patient responsibility - deductible',
      status: 'posted'
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Simulate file upload and processing
      const newERA: ERAFile = {
        id: `ERA${Date.now()}`,
        fileName: file.name,
        payerName: 'Unknown Payer',
        checkNumber: 'Pending',
        checkDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        claimsCount: 0,
        status: 'received',
        receivedDate: new Date().toISOString(),
        processingProgress: 0
      };

      setEraFiles(prev => [newERA, ...prev]);
      
      // Simulate processing
      setTimeout(() => {
        setEraFiles(prev => 
          prev.map(era => 
            era.id === newERA.id 
              ? { ...era, status: 'processing' as const, processingProgress: 30 }
              : era
          )
        );
      }, 1000);

      toast.success('ERA file uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload ERA file');
    }
  };

  const handleProcessERA = async (eraId: string) => {
    try {
      // Simulate ERA processing
      setEraFiles(prev => 
        prev.map(era => 
          era.id === eraId 
            ? { ...era, status: 'processing' as const, processingProgress: 0 }
            : era
        )
      );

      // Simulate progress updates
      const interval = setInterval(() => {
        setEraFiles(prev => 
          prev.map(era => {
            if (era.id === eraId && era.processingProgress < 100) {
              const newProgress = era.processingProgress + 20;
              const newStatus = newProgress >= 100 ? 'posted' as const : 'processing' as const;
              return { ...era, processingProgress: newProgress, status: newStatus };
            }
            return era;
          })
        );
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        toast.success('ERA processing completed');
      }, 3000);

    } catch (error) {
      toast.error('ERA processing failed');
    }
  };

  const handleResolveException = async (eraId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEraFiles(prev => 
        prev.map(era => 
          era.id === eraId 
            ? { ...era, status: 'posted' as const, exceptions: undefined }
            : era
        )
      );
      
      toast.success('Exception resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve exception');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'exception': return 'bg-red-500';
      case 'received': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredFiles = eraFiles.filter(file => 
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.payerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const eraStats = {
    totalProcessed: eraFiles.filter(f => f.status === 'posted').length,
    totalAmount: eraFiles.reduce((sum, f) => sum + f.totalAmount, 0),
    processingCount: eraFiles.filter(f => f.status === 'processing').length,
    exceptionCount: eraFiles.filter(f => f.status === 'exception').length
  };

  return (
    <div className="space-y-6">
      {/* ERA Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processed ERAs</p>
                <p className="text-2xl font-bold">{eraStats.totalProcessed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${eraStats.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{eraStats.processingCount}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exceptions</p>
                <p className="text-2xl font-bold">{eraStats.exceptionCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ERA File Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ERA File Processing Center
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="era-upload" className="cursor-pointer">
                <Button size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload ERA Files
                  </span>
                </Button>
              </label>
              <input
                id="era-upload"
                type="file"
                accept=".835,.edi,.txt"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Auto-Processing:</span>
              <input
                type="checkbox"
                checked={autoProcessing}
                onChange={(e) => setAutoProcessing(e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search ERA files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{file.fileName}</span>
                    <Badge className={getStatusColor(file.status)}>
                      {file.status}
                    </Badge>
                    <Badge variant="outline">{file.payerName}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${file.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{file.claimsCount} claims</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check Number:</span>
                    <p className="font-medium">{file.checkNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check Date:</span>
                    <p className="font-medium">{file.checkDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Received:</span>
                    <p className="font-medium">{new Date(file.receivedDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Claims:</span>
                    <p className="font-medium">{file.claimsCount}</p>
                  </div>
                </div>

                {file.status === 'processing' && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="font-medium text-blue-800">Processing ERA File</span>
                    </div>
                    <Progress value={file.processingProgress} className="w-full mb-2" />
                    <p className="text-sm text-blue-700">
                      {file.processingProgress < 25 && 'Parsing EDI transactions...'}
                      {file.processingProgress >= 25 && file.processingProgress < 50 && 'Validating claim references...'}
                      {file.processingProgress >= 50 && file.processingProgress < 75 && 'Calculating adjustments...'}
                      {file.processingProgress >= 75 && file.processingProgress < 100 && 'Posting payments...'}
                      {file.processingProgress === 100 && 'Processing complete!'}
                    </p>
                  </div>
                )}

                {file.exceptions && file.exceptions.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-md border-l-4 border-red-500">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">Processing Exceptions</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {file.exceptions.map((exception, index) => (
                        <li key={index}>• {exception}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {file.status === 'received' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleProcessERA(file.id)}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Process ERA
                    </Button>
                  )}
                  {file.status === 'exception' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleResolveException(file.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Resolve Exceptions
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details for Selected ERA */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Patient:</span>
                      <p className="font-medium">{transaction.patientName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Service Date:</span>
                      <p className="font-medium">{transaction.serviceDate}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Charged:</span>
                      <p className="font-medium">${transaction.chargedAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Allowed:</span>
                      <p className="font-medium">${transaction.allowedAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid:</span>
                      <p className="font-medium">${transaction.paidAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Adjustment:</span>
                      <p className="font-medium">${transaction.adjustmentAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-muted-foreground text-sm">Reason:</span>
                    <p className="text-sm">{transaction.adjustmentReason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ERAProcessor;