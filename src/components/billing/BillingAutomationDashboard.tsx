import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Settings,
  FileText,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { billingAutomationService } from "@/services/billingAutomationService";
import { formatCurrency } from "@/utils/billingUtils";

interface BillingAutomationDashboardProps {
  patientId?: string;
}

const BillingAutomationDashboard: React.FC<BillingAutomationDashboardProps> = ({
  patientId,
}) => {
  const [billingMonitors, setBillingMonitors] = useState<any[]>([]);
  const [billingTriggers, setBillingTriggers] = useState<any[]>([]);
  const [generatedBills, setGeneratedBills] = useState<any[]>([]);
  const [compliance, setCompliance] = useState({ total: 0, compliant: 0, atRisk: 0, nonCompliant: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, [patientId]);

  const loadBillingData = () => {
    if (patientId) {
      // Single patient view
      setBillingMonitors(billingAutomationService.getBillingMonitors(patientId));
      setBillingTriggers(billingAutomationService.getBillingTriggers(patientId));
      setGeneratedBills(billingAutomationService.getGeneratedBills(patientId));
    } else {
      // All patients overview
      setGeneratedBills(billingAutomationService.getAllGeneratedBills());
      setCompliance(billingAutomationService.getBillingCompliance());
    }
  };

  const handleManualBillGeneration = (serviceType: 'CCM' | 'RPM' | 'PCM') => {
    if (!patientId) {
      toast.error("Patient ID is required for manual bill generation");
      return;
    }

    setLoading(true);
    try {
      billingAutomationService.manualBillGeneration(patientId, serviceType);
      toast.success(`Manual ${serviceType} bill generation initiated`);
      loadBillingData();
    } catch (error) {
      toast.error(`Failed to generate ${serviceType} bill`);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBilledAmount = generatedBills.reduce((sum, bill) => sum + bill.totalFee, 0);
  const averageBillAmount = generatedBills.length > 0 ? totalBilledAmount / generatedBills.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">
            {patientId ? 'Patient Billing Automation' : 'Billing Automation Dashboard'}
          </h2>
          <p className="text-muted-foreground">
            {patientId ? 'Automated billing for CCM, RPM, and PCM services' : 'Monitor and manage automated billing across all patients'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadBillingData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Billing Automation Settings</DialogTitle>
                <DialogDescription>
                  Configure billing rules and automation preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Settings Configuration</AlertTitle>
                  <AlertDescription>
                    Billing automation settings are currently managed through the service layer.
                    Contact your administrator to modify billing rules and thresholds.
                  </AlertDescription>
                </Alert>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!patientId && (
        /* Overview Statistics */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBilledAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Across {generatedBills.length} bills
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Bill</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageBillAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Per billing cycle
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {compliance.total > 0 ? Math.round((compliance.compliant / compliance.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {compliance.compliant} of {compliance.total} compliant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk Patients</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{compliance.atRisk}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue={patientId ? "monitoring" : "overview"} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="bills">Generated Bills</TabsTrigger>
          <TabsTrigger value="triggers">Billing Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {!patientId && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>
                  Patient compliance status across all service types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Compliance</span>
                      <span>{compliance.compliant}/{compliance.total} patients</span>
                    </div>
                    <Progress 
                      value={compliance.total > 0 ? (compliance.compliant / compliance.total) * 100 : 0} 
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{compliance.compliant}</div>
                      <div className="text-sm text-muted-foreground">Compliant</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{compliance.atRisk}</div>
                      <div className="text-sm text-muted-foreground">At Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{compliance.nonCompliant}</div>
                      <div className="text-sm text-muted-foreground">Non-Compliant</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {patientId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Manual Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={() => handleManualBillGeneration('CCM')} 
                    className="w-full" 
                    variant="outline"
                    disabled={loading}
                  >
                    Generate CCM Bill
                  </Button>
                  <Button 
                    onClick={() => handleManualBillGeneration('RPM')} 
                    className="w-full" 
                    variant="outline"
                    disabled={loading}
                  >
                    Generate RPM Bill
                  </Button>
                  <Button 
                    onClick={() => handleManualBillGeneration('PCM')} 
                    className="w-full" 
                    variant="outline"
                    disabled={loading}
                  >
                    Generate PCM Bill
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Monitors</CardTitle>
              <CardDescription>
                Real-time monitoring of billing eligibility and compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingMonitors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Current Minutes</TableHead>
                      <TableHead>Compliance Status</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingMonitors.map((monitor) => (
                      <TableRow key={`${monitor.patientId}-${monitor.serviceType}`}>
                        <TableCell>
                          <Badge variant="outline">{monitor.serviceType}</Badge>
                        </TableCell>
                        <TableCell>{monitor.currentMonthMinutes} min</TableCell>
                        <TableCell>
                          <Badge className={getComplianceColor(monitor.complianceStatus)}>
                            {monitor.complianceStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(monitor.nextBillingDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(monitor.lastUpdated).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No billing monitors active</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Bills</CardTitle>
              <CardDescription>
                Automatically generated billing records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedBills.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Service Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-mono text-sm">{bill.id}</TableCell>
                        <TableCell>{bill.patientId}</TableCell>
                        <TableCell>{new Date(bill.dateOfService).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(bill.totalFee)}</TableCell>
                        <TableCell>
                          <Badge className={getBillStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bills generated yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Triggers</CardTitle>
              <CardDescription>
                Automatic billing triggers based on time thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingTriggers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Total Minutes</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Triggered At</TableHead>
                      <TableHead>Bill Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingTriggers.map((trigger) => (
                      <TableRow key={trigger.id}>
                        <TableCell>
                          <Badge variant="outline">{trigger.serviceType}</Badge>
                        </TableCell>
                        <TableCell>{trigger.totalMinutes} min</TableCell>
                        <TableCell>{trigger.threshold} min</TableCell>
                        <TableCell>{new Date(trigger.triggeredAt).toLocaleString()}</TableCell>
                        <TableCell>
                          {trigger.billGenerated ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No billing triggers recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingAutomationDashboard;