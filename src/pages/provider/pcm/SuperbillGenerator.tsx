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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Clock,
  Activity,
  DollarSign,
  CheckCircle,
  Send,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { ccmService } from "@/services/ccmService";
import { getSinglePatientAPI } from "@/services/operations/patient";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import {
  BillingDetails,
  createBillingFromAppointment,
} from "@/utils/billingUtils";

interface SuperbillGeneratorProps {
  patientId: string;
}

interface SuperbillData {
  patient: any;
  timeEntries: any[];
  assessments: any[];
  totalMinutes: number;
  cptCodes: string[];
  billingDetails: BillingDetails;
  complianceStatus: {
    minimumTimeMet: boolean;
    qualifyingConditions: boolean;
    consentObtained: boolean;
    careManagementProvided: boolean;
  };
}

const SuperbillGenerator: React.FC<SuperbillGeneratorProps> = ({
  patientId,
}) => {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [superbillData, setSuperbillData] = useState<SuperbillData | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await getSinglePatientAPI(patientId, token);
      if (res) {
        setPatient(res);
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      toast.error("Failed to fetch patient data");
    } finally {
      setLoading(false);
    }
  };

  const generateSuperbill = async () => {
    if (!patient) return;

    setLoading(true);
    try {
      // Fetch all data for the selected month
      const timeEntries = ccmService.getTimeEntries(patientId, selectedMonth);
      const assessments = ccmService.getAssessments(patientId);

      // Calculate totals
      const totalMinutes = timeEntries.reduce(
        (sum, entry) => sum + entry.duration,
        0
      );
      const cptCodes = [
        ...new Set(
          timeEntries.map((entry) =>
            ccmService.determineCPTCode(entry.duration)
          )
        ),
      ];

      // Create billing details for this superbill
      const mockAppointment = {
        id: `ccm-${patientId}-${selectedMonth}`,
        patient: { id: patientId },
        date: new Date(),
        type: "CCM",
        duration: `${totalMinutes} minutes`,
        providerId: "dr-smith",
      };

      const billingDetails = createBillingFromAppointment(mockAppointment);

      // Update billing details with CCM-specific information
      billingDetails.procedures = cptCodes.map((code) => ({
        id: `proc-${Math.random().toString(36).substr(2, 9)}`,
        cptCode: code,
        description: getCPTDescription(code),
        fee: getCPTFee(code),
        quantity: 1,
      }));

      billingDetails.totalFee = billingDetails.procedures.reduce(
        (sum, proc) => sum + proc.fee,
        0
      );

      // Check compliance
      const complianceStatus = {
        minimumTimeMet: totalMinutes >= 20,
        qualifyingConditions: patient.diagnosis?.length >= 2,
        consentObtained: true,
        careManagementProvided: timeEntries.some((entry) =>
          ["care_coordination", "medication_management", "education"].includes(
            entry.activityType
          )
        ),
      };

      const superbill: SuperbillData = {
        patient,
        timeEntries,
        assessments,
        totalMinutes,
        cptCodes,
        billingDetails,
        complianceStatus,
      };

      setSuperbillData(superbill);
      toast.success("Superbill generated successfully");
    } catch (error) {
      console.error("Error generating superbill:", error);
      toast.error("Failed to generate superbill");
    } finally {
      setLoading(false);
    }
  };

  const getCPTDescription = (code: string): string => {
    const descriptions: Record<string, string> = {
      "99490": "CCM services, first 20 minutes",
      "99491": "CCM services, each additional 20 minutes",
      "99487": "Complex CCM services, first 60 minutes",
      "99489": "Complex CCM services, each additional 30 minutes",
      "99453": "Remote patient monitoring setup",
      "99454": "Remote patient monitoring device supply",
      "99458": "Remote physiologic monitoring treatment, first 20 minutes",
      "99459": "Remote physiologic monitoring treatment, additional 20 minutes",
    };
    return descriptions[code] || "CCM Service";
  };

  const getCPTFee = (code: string): number => {
    const fees: Record<string, number> = {
      "99490": 42.6,
      "99491": 31.92,
      "99487": 98.68,
      "99489": 49.34,
      "99453": 19.93,
      "99454": 64.11,
      "99458": 51.14,
      "99459": 41.21,
    };
    return fees[code] || 42.6;
  };

  const sendToBillingManagement = () => {
    if (!superbillData) return;

    // Store the billing data in localStorage for the billing management system
    const existingBills = JSON.parse(
      localStorage.getItem("ccm-billing-data") || "[]"
    );
    existingBills.push(superbillData.billingDetails);
    localStorage.setItem("ccm-billing-data", JSON.stringify(existingBills));

    toast.success("Superbill sent to Billing Management");
    navigate("/billing");
  };

  const exportSuperbill = () => {
    if (!superbillData) return;

    const dataStr = JSON.stringify(superbillData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `Superbill_${patient?.firstName}_${selectedMonth}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Superbill exported successfully");
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!patient) return <div>Loading patient data...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CCM Superbill Generator
          </CardTitle>
          <CardDescription>
            Generate billing superbills for Chronic Care Management services
            with automated compliance checking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Service Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="ml-2 p-2 border rounded"
              />
            </div>
            <Button
              onClick={generateSuperbill}
              disabled={loading}
              className="ml-auto"
            >
              <Activity className="h-4 w-4 mr-2" />
              Generate Superbill
            </Button>
          </div>

          {superbillData && (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="billing">Billing Details</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Time
                          </p>
                          <p className="text-2xl font-bold">
                            {formatDuration(superbillData.totalMinutes)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Services
                          </p>
                          <p className="text-2xl font-bold">
                            {superbillData.timeEntries.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Amount
                          </p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(
                              superbillData.billingDetails.totalFee
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Name:</p>
                        <p>
                          {patient.firstName} {patient.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Patient ID:</p>
                        <p>{patient.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Service Period:</p>
                        <p>
                          {new Date(selectedMonth).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Provider:</p>
                        <p></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle>Billable Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {superbillData.billingDetails.procedures.map(
                        (procedure, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <p className="font-medium">
                                  CPT {procedure.cptCode}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {procedure.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {formatCurrency(procedure.fee)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {procedure.quantity}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compliance">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Check</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(superbillData.complianceStatus).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-center gap-3">
                            <CheckCircle
                              className={`h-5 w-5 ${
                                value ? "text-green-500" : "text-red-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="font-medium">
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {value ? "Compliant" : "Non-compliant"}
                              </p>
                            </div>
                            <Badge variant={value ? "default" : "destructive"}>
                              {value ? "PASS" : "FAIL"}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Services:</p>
                          <p className="text-lg">
                            {superbillData.billingDetails.procedures.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Amount:</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(
                              superbillData.billingDetails.totalFee
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Insurance:</p>
                          <p className="text-lg">
                            {superbillData.billingDetails.insuranceName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status:</p>
                          <Badge>
                            {superbillData.billingDetails.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex gap-2 justify-end">
                        <Button onClick={exportSuperbill} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          onClick={() => navigate("/billing")}
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View in Billing
                        </Button>
                        <Button onClick={sendToBillingManagement}>
                          <Send className="h-4 w-4 mr-2" />
                          Send to Billing Management
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperbillGenerator;
