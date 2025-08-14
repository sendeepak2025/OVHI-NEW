import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle, XCircle, Zap, FileText, Settings, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ClaimValidationResult {
  claimId: string;
  patientName: string;
  totalAmount: number;
  status: 'passed' | 'warnings' | 'failed';
  score: number;
  criticalErrors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  processingTime: number;
}

interface ValidationError {
  code: string;
  field: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  autoFixAvailable: boolean;
  requiredAction: string;
}

interface ValidationWarning {
  code: string;
  field: string;
  description: string;
  impact: 'denial_risk' | 'delay_risk' | 'reduction_risk';
  recommendation: string;
}

interface ValidationSuggestion {
  code: string;
  field: string;
  description: string;
  expectedBenefit: string;
}

interface ValidationRule {
  id: string;
  name: string;
  category: 'demographics' | 'insurance' | 'clinical' | 'billing' | 'coding';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoFix: boolean;
  enabled: boolean;
}

const IntelligentClaimsScrubber: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ClaimValidationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ClaimValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize validation rules
  const initializeValidationRules = (): ValidationRule[] => [
    {
      id: 'demo_001',
      name: 'Patient Demographics Complete',
      category: 'demographics',
      description: 'Validate all required patient demographic fields are complete',
      severity: 'critical',
      autoFix: false,
      enabled: true
    },
    {
      id: 'ins_001',
      name: 'Insurance Eligibility Verification',
      category: 'insurance',
      description: 'Verify patient insurance eligibility and benefits',
      severity: 'critical',
      autoFix: true,
      enabled: true
    },
    {
      id: 'ins_002',
      name: 'Prior Authorization Check',
      category: 'insurance',
      description: 'Check if procedures require prior authorization',
      severity: 'high',
      autoFix: false,
      enabled: true
    },
    {
      id: 'cod_001',
      name: 'ICD-10 Code Validation',
      category: 'coding',
      description: 'Validate ICD-10 diagnosis codes are current and valid',
      severity: 'critical',
      autoFix: true,
      enabled: true
    },
    {
      id: 'cod_002',
      name: 'CPT Code Validation',
      category: 'coding',
      description: 'Validate CPT procedure codes and modifiers',
      severity: 'critical',
      autoFix: true,
      enabled: true
    },
    {
      id: 'cod_003',
      name: 'Medical Necessity Check',
      category: 'clinical',
      description: 'Verify diagnosis supports procedures performed',
      severity: 'high',
      autoFix: false,
      enabled: true
    },
    {
      id: 'bil_001',
      name: 'Duplicate Claim Detection',
      category: 'billing',
      description: 'Check for duplicate claims in the system',
      severity: 'critical',
      autoFix: true,
      enabled: true
    },
    {
      id: 'bil_002',
      name: 'Place of Service Validation',
      category: 'billing',
      description: 'Validate place of service code matches procedure type',
      severity: 'medium',
      autoFix: true,
      enabled: true
    },
    {
      id: 'bil_003',
      name: 'Units of Service Check',
      category: 'billing',
      description: 'Verify units of service are appropriate for procedure',
      severity: 'medium',
      autoFix: false,
      enabled: true
    },
    {
      id: 'cli_001',
      name: 'Age/Gender Edits',
      category: 'clinical',
      description: 'Check procedures are appropriate for patient age/gender',
      severity: 'high',
      autoFix: false,
      enabled: true
    }
  ];

  // Comprehensive claim validation
  const validateClaim = useCallback(async (claimData: any): Promise<ClaimValidationResult> => {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Demographics validation
    if (!claimData.patient?.name || !claimData.patient?.dateOfBirth) {
      errors.push({
        code: 'DEMO_001',
        field: 'patient.demographics',
        description: 'Missing required patient demographic information',
        severity: 'critical',
        autoFixAvailable: false,
        requiredAction: 'Complete patient name and date of birth'
      });
    }

    // Insurance validation
    if (!claimData.insurance?.memberId || !claimData.insurance?.payerId) {
      errors.push({
        code: 'INS_001',
        field: 'insurance.identification',
        description: 'Missing insurance member ID or payer ID',
        severity: 'critical',
        autoFixAvailable: false,
        requiredAction: 'Provide complete insurance information'
      });
    }

    // Eligibility check (mock)
    if (claimData.insurance && Math.random() > 0.8) {
      warnings.push({
        code: 'INS_002',
        field: 'insurance.eligibility',
        description: 'Patient eligibility could not be verified in real-time',
        impact: 'denial_risk',
        recommendation: 'Manually verify eligibility before submission'
      });
    }

    // Coding validation
    if (claimData.procedures) {
      claimData.procedures.forEach((proc: any, index: number) => {
        // CPT code format validation
        if (!/^\d{5}$/.test(proc.code)) {
          errors.push({
            code: 'COD_001',
            field: `procedures[${index}].code`,
            description: `Invalid CPT code format: ${proc.code}`,
            severity: 'critical',
            autoFixAvailable: true,
            requiredAction: 'Use valid 5-digit CPT code'
          });
        }

        // Modifier validation
        if (proc.modifiers && proc.modifiers.some((mod: string) => !/^[A-Z0-9]{2}$/.test(mod))) {
          warnings.push({
            code: 'COD_002',
            field: `procedures[${index}].modifiers`,
            description: 'Modifier format may be incorrect',
            impact: 'reduction_risk',
            recommendation: 'Verify modifier format and appropriateness'
          });
        }
      });
    }

    // Diagnosis code validation
    if (claimData.diagnoses) {
      claimData.diagnoses.forEach((diag: any, index: number) => {
        // ICD-10 format validation
        if (!/^[A-Z]\d{2}\.?\d{0,3}$/.test(diag.code)) {
          errors.push({
            code: 'COD_003',
            field: `diagnoses[${index}].code`,
            description: `Invalid ICD-10 code format: ${diag.code}`,
            severity: 'critical',
            autoFixAvailable: true,
            requiredAction: 'Use valid ICD-10 code format'
          });
        }
      });
    }

    // Medical necessity check
    if (claimData.procedures && claimData.diagnoses) {
      const hasMatchingDiagnosis = claimData.procedures.every((proc: any) =>
        claimData.diagnoses.some((diag: any) => 
          // Mock medical necessity logic
          proc.code.startsWith('99') || diag.code.startsWith('Z')
        )
      );
      
      if (!hasMatchingDiagnosis) {
        warnings.push({
          code: 'CLI_001',
          field: 'medical_necessity',
          description: 'Some procedures may not be supported by diagnosis codes',
          impact: 'denial_risk',
          recommendation: 'Review diagnosis-procedure relationships'
        });
      }
    }

    // Duplicate claim check (mock)
    if (Math.random() > 0.9) {
      errors.push({
        code: 'BIL_001',
        field: 'claim.duplicate',
        description: 'Potential duplicate claim detected',
        severity: 'critical',
        autoFixAvailable: true,
        requiredAction: 'Verify this is not a duplicate submission'
      });
    }

    // Place of service validation
    if (claimData.placeOfService) {
      const validPOS = ['11', '21', '22', '23', '24'];
      if (!validPOS.includes(claimData.placeOfService)) {
        warnings.push({
          code: 'BIL_002',
          field: 'placeOfService',
          description: 'Unusual place of service code',
          impact: 'delay_risk',
          recommendation: 'Verify place of service code is correct'
        });
      }
    }

    // Generate suggestions
    if (claimData.procedures?.length > 3) {
      suggestions.push({
        code: 'OPT_001',
        field: 'procedures',
        description: 'Consider splitting claim into multiple submissions',
        expectedBenefit: 'Reduced processing time and complexity'
      });
    }

    // Calculate score
    const totalChecks = 20;
    const deductions = errors.length * 10 + warnings.length * 3;
    const score = Math.max(0, 100 - deductions);

    // Determine status
    let status: 'passed' | 'warnings' | 'failed';
    if (errors.length > 0) {
      status = 'failed';
    } else if (warnings.length > 0) {
      status = 'warnings';
    } else {
      status = 'passed';
    }

    const processingTime = Date.now() - startTime;

    return {
      claimId: claimData.id || 'CLM_' + Date.now(),
      patientName: claimData.patient?.name || 'Unknown Patient',
      totalAmount: claimData.totalAmount || 0,
      status,
      score,
      criticalErrors: errors,
      warnings,
      suggestions,
      processingTime
    };
  }, []);

  // Process batch of claims
  const processBatch = useCallback(async (claims: any[]) => {
    setIsValidating(true);
    try {
      const results = await Promise.all(
        claims.map(claim => validateClaim(claim))
      );
      
      setValidationResults(results);
      
      const passed = results.filter(r => r.status === 'passed').length;
      const warnings = results.filter(r => r.status === 'warnings').length;
      const failed = results.filter(r => r.status === 'failed').length;
      
      toast.success(
        `Validation complete: ${passed} passed, ${warnings} with warnings, ${failed} failed`
      );
    } catch (error) {
      toast.error('Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, [validateClaim]);

  // Mock data for demonstration
  const runSampleValidation = () => {
    const sampleClaims = [
      {
        id: 'CLM001',
        patient: { name: 'John Doe', dateOfBirth: '1980-01-15' },
        insurance: { memberId: '123456789', payerId: 'BCBS' },
        procedures: [{ code: '99213', modifiers: ['25'] }],
        diagnoses: [{ code: 'Z00.00' }],
        totalAmount: 150.00,
        placeOfService: '11'
      },
      {
        id: 'CLM002',
        patient: { name: 'Jane Smith' }, // Missing DOB
        insurance: { memberId: '987654321' }, // Missing payer
        procedures: [{ code: '9921', modifiers: ['XX'] }], // Invalid CPT
        diagnoses: [{ code: 'INVALID' }], // Invalid ICD-10
        totalAmount: 200.00,
        placeOfService: '99' // Invalid POS
      },
      {
        id: 'CLM003',
        patient: { name: 'Bob Johnson', dateOfBirth: '1975-06-20' },
        insurance: { memberId: '555666777', payerId: 'AETNA' },
        procedures: [
          { code: '99214', modifiers: [] },
          { code: '90834', modifiers: [] },
          { code: '96116', modifiers: [] },
          { code: '90837', modifiers: [] }
        ], // Many procedures
        diagnoses: [{ code: 'F32.9' }],
        totalAmount: 450.00,
        placeOfService: '11'
      }
    ];

    processBatch(sampleClaims);
  };

  // Initialize rules
  React.useEffect(() => {
    setValidationRules(initializeValidationRules());
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warnings':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'warnings':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span>Intelligent Claims Scrubber</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={runSampleValidation} disabled={isValidating}>
                <FileText className="h-4 w-4 mr-2" />
                {isValidating ? 'Validating...' : 'Run Sample Validation'}
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Rules
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          {validationResults.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{validationResults.length}</div>
                <div className="text-sm text-muted-foreground">Claims Validated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationResults.filter(r => r.status === 'passed').length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResults.filter(r => r.status === 'warnings').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResults.filter(r => r.status === 'failed').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(validationResults.reduce((sum, r) => sum + r.score, 0) / validationResults.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          )}

          {/* Validation Results Table */}
          {validationResults.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationResults.map((result) => (
                  <TableRow key={result.claimId}>
                    <TableCell className="font-mono">{result.claimId}</TableCell>
                    <TableCell>{result.patientName}</TableCell>
                    <TableCell>${result.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <Badge variant="secondary" className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{result.score}%</div>
                        <Progress value={result.score} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {result.criticalErrors.length > 0 && (
                          <Badge variant="destructive" className="mr-1">
                            {result.criticalErrors.length} errors
                          </Badge>
                        )}
                        {result.warnings.length > 0 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {result.warnings.length} warnings
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{result.processingTime}ms</TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedResult(result);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Validation Details - {selectedResult?.claimId}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedResult && (
                            <Tabs defaultValue="errors" className="w-full">
                              <TabsList>
                                <TabsTrigger value="errors">
                                  Errors ({selectedResult.criticalErrors.length})
                                </TabsTrigger>
                                <TabsTrigger value="warnings">
                                  Warnings ({selectedResult.warnings.length})
                                </TabsTrigger>
                                <TabsTrigger value="suggestions">
                                  Suggestions ({selectedResult.suggestions.length})
                                </TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="errors" className="space-y-4">
                                {selectedResult.criticalErrors.map((error, index) => (
                                  <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-red-600">{error.code}</div>
                                      <Badge variant="destructive">{error.severity}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-1">
                                      Field: {error.field}
                                    </div>
                                    <div className="text-sm mb-2">{error.description}</div>
                                    <div className="text-sm font-medium">
                                      Required Action: {error.requiredAction}
                                    </div>
                                    {error.autoFixAvailable && (
                                      <Button size="sm" className="mt-2">
                                        Auto-Fix Available
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </TabsContent>
                              
                              <TabsContent value="warnings" className="space-y-4">
                                {selectedResult.warnings.map((warning, index) => (
                                  <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-yellow-600">{warning.code}</div>
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                        {warning.impact}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-1">
                                      Field: {warning.field}
                                    </div>
                                    <div className="text-sm mb-2">{warning.description}</div>
                                    <div className="text-sm font-medium">
                                      Recommendation: {warning.recommendation}
                                    </div>
                                  </div>
                                ))}
                              </TabsContent>
                              
                              <TabsContent value="suggestions" className="space-y-4">
                                {selectedResult.suggestions.map((suggestion, index) => (
                                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                    <div className="font-medium text-blue-600">{suggestion.code}</div>
                                    <div className="text-sm text-muted-foreground mb-1">
                                      Field: {suggestion.field}
                                    </div>
                                    <div className="text-sm mb-2">{suggestion.description}</div>
                                    <div className="text-sm font-medium text-green-600">
                                      Expected Benefit: {suggestion.expectedBenefit}
                                    </div>
                                  </div>
                                ))}
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentClaimsScrubber;