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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Play,
  Square,
  Calendar,
} from "lucide-react";
import { CareCoordinationActivity, CCMTimeEntry } from "@/services/ccmService";
import { billingAutomationService } from "@/services/billingAutomationService";
import HeartLoader from "@/components/ui/heart-loader";
import AddManualTask from "../patient/AddManualTask";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskByPatientID } from "@/services/operations/task";
import EditTaskModal from "../patient/EditTaskModal";
import {
  BillingDetails,
  createBillingFromAppointment,
} from "@/utils/billingUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPdfAPI } from "@/services/operations/settings";

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
import {
  getPatientTimingAPI,
  getPatientSummaryAPI,
} from "@/services/operations/patient";
import Loader from "../Loader";
import CreateBillDialog from "../patient/CreateBillDialog";
interface CCMTaskTrackingProps {
  patientId: string;
  providerId: string;
  patientName?: string;
  onTimeUpdate?: (totalTime: number) => void;
}
interface Task {
  id: string;
  task_title: string;
  task_description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed";
  category: string;
  due_date: string;
  estimated_duration: number;
  actual_duration?: number;
  assigned_provider?: string;
  patient_id: string;
  created_at: string;
  auto_generated?: boolean;
  workflow_template_id?: string;
  type: string;
  duration?: number;
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
const CCMTaskTracking: React.FC<CCMTaskTrackingProps> = ({
  patientId,
  providerId,
  patientName = "Patient",
  onTimeUpdate,
  
}) => {
  const { id } = useParams();
  const [activities, setActivities] = useState<CareCoordinationActivity[]>([]);
  const [timeEntries, setTimeEntries] = useState<CCMTimeEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showManualTimeEntry, setShowManualTimeEntry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [superbillData, setSuperbillData] = useState<SuperbillData | null>(
    null
  );

  const [createBillDialog, setCreateBillDialog] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [patientTiming, setPatientTiming] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    type: "medication_review" as CareCoordinationActivity["type"],
    priority: "medium" as CareCoordinationActivity["priority"],
    notes: "",
    dueDate: new Date().toISOString().slice(0, 16),
  });
  const [manualTimeEntry, setManualTimeEntry] = useState({
    activityType: "care_coordination" as CCMTimeEntry["activityType"],
    description: "",
    duration: "",
    date: new Date().toISOString().slice(0, 16),
  });
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [showBill, setShowBill] = useState(false);

  const serviceTypeMap: Record<number, string> = {
    1: "RPM",
    2: "CCM",
    3: "PCM",
  };
  const navigate = useNavigate();

  const fetchPatientTiming = async () => {
    const response = await getPatientTimingAPI(id, token, selectedMonth);
    setPatientTiming(response);
    console.log(response, "patient timing data");
  };

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);
  useEffect(() => {
    if (id && selectedMonth) {
      fetchPatientTiming();
    }
  }, [id, selectedMonth]);
  const serviceMap = {
    1: "RCM",
    2: "CCM",
    3: "PCM",
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await getSinglePatientAPI(id, token);
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const { token, user } = useSelector((state: RootState) => state.auth);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getTaskByPatientID(id, token);
      console.log(response);
      setTasks(response.task_id);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapServiceToType = {
    1: "rpm",
    2: "ccm",
    3: "pcm",
  };
  useEffect(() => {
    fetchTasks();
  }, [id]);

  useEffect(() => {
    loadData();
  }, [patientId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimerId) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [activeTimerId]);

  const loadData = () => {
    const patientActivities = ccmService.getCareActivities(patientId);
    const patientTimeEntries = ccmService.getTimeEntries(patientId);
    setActivities(patientActivities);
    setTimeEntries(patientTimeEntries);

    const totalMinutes = patientTimeEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    onTimeUpdate?.(totalMinutes);

    // Monitor billing automation
    billingAutomationService.monitorTimeTracking(patientId, "CCM");
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

  const createTask = () => {
    const activityId = ccmService.createCareActivity({
      patientId,
      type: newTask.type,
      status: "pending",
      priority: newTask.priority,
      dueDate: new Date(newTask.dueDate),
      assignedTo: providerId,
      assignedBy: providerId,
      notes: newTask.notes,
      timeTrackingMode: "manual",
    });

    toast.success("CCM task created successfully");
    setShowAddTask(false);
    setNewTask({
      type: "medication_review",
      priority: "medium",
      notes: "",
      dueDate: new Date().toISOString().slice(0, 16),
    });
    loadData();
  };

  const startTimeTracking = (
    activityType: CCMTimeEntry["activityType"],
    description: string
  ) => {
    if (activeTimerId) {
      toast.error("Please stop current timer before starting a new one");
      return;
    }

    const entryId = ccmService.startTimeTracking(
      patientId,
      providerId,
      activityType,
      description
    );
    setActiveTimerId(entryId);
    setCurrentTime(0);
    toast.success("Time tracking started");
  };

  const stopTimeTracking = () => {
    if (!activeTimerId) return;

    const completedEntry = ccmService.stopTimeTracking(activeTimerId);
    if (completedEntry) {
      setActiveTimerId(null);
      setCurrentTime(0);
      toast.success(
        `Time tracking stopped: ${completedEntry.duration} minutes recorded`
      );
      loadData();

      // Check billing automation after stopping time tracking
      billingAutomationService.monitorTimeTracking(patientId, "CCM");
    }
  };

  const updateActivityStatus = (
    activityId: string,
    status: CareCoordinationActivity["status"]
  ) => {
    ccmService.updateCareActivity(patientId, activityId, { status });
    toast.success("Activity status updated");
    loadData();
  };

  const addManualTimeEntry = () => {
    if (!manualTimeEntry.description || !manualTimeEntry.duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    const duration = parseInt(manualTimeEntry.duration);
    if (isNaN(duration) || duration <= 0) {
      toast.error("Please enter a valid duration in minutes");
      return;
    }

    // Create a simulated time entry using start/stop tracking
    const entryId = ccmService.startTimeTracking(
      patientId,
      providerId,
      manualTimeEntry.activityType,
      manualTimeEntry.description
    );

    // Immediately stop it to create a completed entry
    ccmService.stopTimeTracking(entryId);

    toast.success(`Manual time entry added: ${duration} minutes`);
    setShowManualTimeEntry(false);
    setManualTimeEntry({
      activityType: "care_coordination",
      description: "",
      duration: "",
      date: new Date().toISOString().slice(0, 16),
    });
    loadData();

    // Check billing automation after manual time entry
    billingAutomationService.monitorTimeTracking(patientId, "CCM");
  };

  const generateMedicareReport = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyEntries = ccmService.getTimeEntries(patientId, currentMonth);
    const totalTime = monthlyEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );

    const serviceMap = {
      2: "ccm",
      3: "pcm",
    };

    const temp = patient?.patientService?.find(
      (code) => code === 2 || code === 3
    );

    const reportType = serviceMap[temp] || "";

    console.log(reportType);

    const response = await getPatientSummaryAPI(id, reportType, token);

    // console.log(response.data, "ccm repost data");
    // Show loading state
    toast.info("Generating CCM report...", {
      description: (
        <div className="flex items-center gap-2">
          <HeartLoader size="sm" variant="pulse" />
          <span>Processing care coordination data</span>
        </div>
      ),
      duration: 3000,
    });

    try {
      const { generateMockMedicareReport } = await import(
        "@/lib/mock-medicare-report"
      );

      const reportData = {
        patientName: patientName,
        patientId: patientId,
        providerId: providerId,
        reportMonth: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        totalTime: totalTime,
        complianceStatus: totalTime >= 20,
      };

      const pdfHeaderResponse = await getPdfAPI(user.id, token);
      const pdfHeader = pdfHeaderResponse?.data;

      const { blob, fileName } = await generateMockMedicareReport(
        response?.data,
        pdfHeader
      ); // <== FIXED: added await and correct arguments
      // patient?.patientService

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const exportSuperbill = () => {
    if (!superbillData2) return;

    const dataStr = JSON.stringify(superbillData2, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `Superbill_${patient?.firstName}_${selectedMonth}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Superbill exported successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "pending":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
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

  const readableServices = patient?.patientService
    .map((code) => serviceMap[code])
    .filter(Boolean)
    .join(", ");

  const allowedTypes =
    patient?.patientService?.map((id) => mapServiceToType[id]) || [];

  const generateSuperbill = async () => {
    if (!patient) return;
    setShowBill(true);
    fetchPatientTiming();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  useEffect(() => {
    console.log(selectedMonth);
  }, [selectedMonth]);

  const totalMonthlyTime = timeEntries.reduce(
    (sum, entry) => sum + entry.duration,
    0
  );
  const isCompliant = totalMonthlyTime >= 20; //  minimum requirement

  const serviceCPTSteps = {
    RPM: [
      { code: "99457", minutes: 20 },
      { code: "99458", minutes: 40 },
      { code: "99458", minutes: 60 },
      { code: "99458", minutes: 80 },
      { code: "99458", minutes: 100 },
    ],
    CCM: [
      { code: "99490", minutes: 20 },
      { code: "99439", minutes: 40 },
      { code: "99439", minutes: 60 },
      { code: "99439", minutes: 80 },
      { code: "99439", minutes: 100 },
    ],
    PCM: [
      { code: "G2064", minutes: 30 },
      { code: "G2065", minutes: 60 },
      { code: "G2065", minutes: 90 },
      { code: "G2065", minutes: 120 },
    ],
  };

  console.log(patientTiming);

  const totalMinutes = patientTiming?.totalMinutes || 0;
  console.log(patient);
  const type = patient?.serviceType?.toUpperCase() || "RPM";
  const steps = serviceCPTSteps[type] || [];

  const currentStep =
    steps.find((step) => totalMinutes <= step.minutes) ||
    steps[steps.length - 1];

  const entries = [
    ...(patientTiming?.tasks || []).map((task) => ({
      duration: Number(task.duration),
      category: task.category?.toLowerCase() || "unknown",
      title: task.title || "",
      created: task.created || null,
      billing: "tasks",
    })),
    ...(patientTiming?.notes || []).map((note) => ({
      duration: Number(note.duration),
      category: note.type?.toLowerCase() || "unknown",
      title: note.note || "",
      created: note.created || null,
      billing: "notes",
    })),
  ];
  const { tasks2 = [], notes = [], totalMinutes2 = 0 } = patientTiming || {};

  const hasCategory = (cat) => entries.some((e) => e.category === cat);
  const titleIncludes = (keyword) =>
    entries.some((e) => e.title?.toLowerCase().includes(keyword.toLowerCase()));

  const complianceStatus = {
    minimumTimeMet: totalMinutes >= 20, // e.g., 20 mins threshold
    qualifyingConditions: hasCategory("ccm") || hasCategory("pcm"),
    consentObtained: titleIncludes("consent"), // checks if any title contains 'consent'
    careManagementProvided: hasCategory("ccm"), // care management = at least one CCM
  };

  const superbillData2 = {
    complianceStatus,
  };

  const sumCategoryMinutes = (cat) =>
    entries
      .filter((e) => e.category?.toLowerCase() === cat)
      .reduce((sum, e) => sum + Number(e.duration || 0), 0);

  const rpmMinutes = sumCategoryMinutes("rpm");
  const ccmMinutes = sumCategoryMinutes("ccm");
  const pcmMinutes = sumCategoryMinutes("pcm");

  const getRPMCodes = (min) => {
    const codes = [];
    if (min >= 20) codes.push("99457");
    if (min >= 40) codes.push("99458");
    if (min >= 60) codes.push("99458");
    if (min >= 80) codes.push("99458");
    return codes;
  };

  const getCCMCodes = (min) => {
    const codes = [];
    if (min >= 20) codes.push("99490");
    if (min >= 40) codes.push("99439");
    if (min >= 60) codes.push("99439");
    if (min >= 80) codes.push("99439");
    return codes;
  };

  const getPCMCodes = (min) => {
    const codes = [];
    if (min >= 30) codes.push("G2064");
    if (min >= 60) codes.push("G2065");
    if (min >= 90) codes.push("G2065");
    return codes;
  };

  const rpmCPT = getRPMCodes(rpmMinutes);
  const ccmCPT = getCCMCodes(ccmMinutes);
  const pcmCPT = getPCMCodes(pcmMinutes);

  if (!patientTiming || !patient) {
    return <Loader />;
  }
  return (
    <div className="space-y-6">
      

      {/* Header with compliance status */}
      {!isCompliant && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle> Compliance Warning</AlertTitle>
          <AlertDescription>
            Current monthly time ({formatDuration(totalMonthlyTime)}) is below
            the minimum 20 minutes required for CCM billing. Continue
            documenting care coordination activities to meet compliance
            requirements.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">
            <span className="text-gray-600">
              {patient?.patientService?.length
                ? patient.patientService
                    .map((id: number) => serviceTypeMap[id])
                    .filter(Boolean)
                    .join(", ")
                : "Not Added"}
            </span>{" "}
            Task Tracking & Documentation
          </h2>
          <p className="text-muted-foreground">Compliant care coordination</p>
        </div>
        <div className="flex items-center gap-4">
          {/* <div className="text-right">
            <p className="text-sm text-muted-foreground">Monthly Time</p>
            <p className="text-lg font-bold">
              {formatDuration(totalMonthlyTime)}
            </p>
          </div> */}
          <Badge variant={isCompliant ? "default" : "destructive"}>
            {isCompliant ? "Compliant" : "Non-Compliant"}
          </Badge>
          <Button onClick={generateMedicareReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Progress toward compliance */}
      <Card>
        <CardHeader>
          <CardTitle> Compliance Progress</CardTitle>
          <CardDescription className="px-4">
            Minimum 20 minutes per month required for{" "}
            <span className="text-gray-600">
              {patient?.patientService?.length
                ? patient.patientService
                    .map((id: number) => serviceTypeMap[id])
                    .filter(Boolean)
                    .join(", ")
                : "Not Added"}
            </span>{" "}
            billing
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* RPM Progress */}
            {rpmMinutes > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>RPM Time Progress</span>
                  <span>
                    {rpmMinutes} min → {rpmCPT.join(", ")}
                  </span>
                </div>
                <Progress value={Math.min((rpmMinutes / 40) * 100, 100)} />
              </div>
            )}

            {/* CCM Progress */}
            {ccmMinutes > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CCM Time Progress</span>
                  <span>
                    {ccmMinutes} min → {ccmCPT.join(", ")}
                  </span>
                </div>
                <Progress value={Math.min((ccmMinutes / 40) * 100, 100)} />
              </div>
            )}

            {/* PCM Progress */}
            {pcmMinutes > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>PCM Time Progress</span>
                  <span>
                    {pcmMinutes} min → {pcmCPT.join(", ")}
                  </span>
                </div>
                <Progress value={Math.min((pcmMinutes / 60) * 100, 100)} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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

        {superbillData2 && showBill && (
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              {/* <TabsTrigger value="billing">Billing Details</TabsTrigger> */}
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
                          {formatDuration(patientTiming?.totalMinutes)}
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
                        <span className="text-gray-600">
                          {patient?.patientService?.length
                            ? patient.patientService
                                .map((id: number) => serviceTypeMap[id])
                                .filter(Boolean)
                                .join(", ")
                            : "Not Added"}
                        </span>
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
                          {patientTiming?.totalAmount}
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
                        {patient?.firstName} {patient?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Patient ID:</p>
                      <p>{patient.patientId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Service Period:</p>
                      <p>{patient.created}</p>
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
                  <div className="space-y-3 max-h-96 w-full overflow-y-auto">
                    {entries?.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No time entries recorded
                        </p>
                      </div>
                    ) : (
                      entries?.map((item, index) => (
                        <div
                          key={index}
                          className="w-[98%] mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl border border-gray-200"
                        >
                          <h2 className="text-xl font-bold text-gray-800 mb-4">
                            🕒 Patient Timing Details
                          </h2>
                          <div className="space-y-3 text-sm text-gray-700">
                            <div className="flex justify-between">
                              <span className="font-medium">Billing:</span>
                              <span>{item?.billing || "NA"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Category:</span>
                              <span>{item?.category || "NA"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Duration:</span>
                              <span>{item?.duration || "NA"} Min</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Created:</span>
                              <span>
                                {item?.created
                                  ? new Date(item.created).toLocaleString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : "NA"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
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
                    {Object.entries(superbillData2.complianceStatus).map(
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
                        <p className="text-sm font-medium">Total Times:</p>
                        <p className="text-lg">
                          {" "}
                          {formatDuration(patientTiming?.totalMinutes)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total Amount:</p>
                        <p className="text-lg font-bold">
                          {patientTiming?.totalAmount}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2 justify-end">
                      <Button onClick={exportSuperbill} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        onClick={() => navigate("/provider/billing")}
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View in Billing
                      </Button>
                      <Button onClick={() => setCreateBillDialog(true)}>
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

      {/* Tasks and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-primary mr-2" />
                {readableServices || "No services selected"} Tasks
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {tasks?.length > 0 ? (
                tasks
                  .filter((task) => allowedTypes.includes(task.type)) // ✅ Filter tasks by allowed types
                  .map((task, index) => {
                    const isMatched = allowedTypes.includes(task.type);

                    return (
                      <Card
                        key={task.id}
                        className="group relative bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slideUp"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-0">
                          <div className="p-4 lg:p-6">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                              <div className="space-y-3 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <br />
                                  <h3 className="font-semibold text-lg text-foreground truncate">
                                    {task.task_title}
                                  </h3>

                                  <div className="flex flex-wrap gap-2">
                                    <Badge
                                      className={`${getPriorityColor(
                                        task.priority
                                      )} shadow-sm font-medium`}
                                    >
                                      {task.priority.toUpperCase()}
                                    </Badge>

                                    <Badge
                                      className={`${getStatusColor(
                                        task.status
                                      )} shadow-sm font-medium`}
                                    >
                                      {task.status
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </Badge>

                                    {task.auto_generated && (
                                      <Badge
                                        variant="outline"
                                        className="border-purple-200 text-purple-700 bg-purple-50 shadow-sm"
                                      >
                                        🤖 AI Generated
                                      </Badge>
                                    )}

                                    {isMatched && (
                                      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                        Patient Match: {task.type.toUpperCase()}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <p className="text-muted-foreground leading-relaxed">
                                  {task?.task_description}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2 px-3 py-1 bg-accent/30 rounded-lg">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Due:</span>
                                    <span>
                                      {task.due_date
                                        ? new Date(
                                            task.due_date
                                          ).toLocaleDateString()
                                        : "NA"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 px-3 py-1 bg-accent/30 rounded-lg">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Est:</span>
                                    <span>
                                      {formatDuration(task.estimated_duration)}
                                    </span>
                                  </div>

                                  {task.actual_duration && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg">
                                      <Clock className="h-4 w-4" />
                                      <span className="font-medium">
                                        Actual:
                                      </span>
                                      <span>{task.actual_duration}m</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="absolute top-1 right-1 flex flex-col sm:flex-row gap-3 min-w-0">
                                <Button
                                  size="sm"
                                  onClick={() => setEditTask(task)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-2 w-4 mr-1" />
                                  Edit Task
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
              ) : (
                <p className="text-center text-gray-500 text-sm font-medium mt-6">
                  No task found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              Time Entries History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {entries?.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No time entries recorded
                  </p>
                </div>
              ) : (
                entries?.map((item, index) => (
                  <div
                    key={index}
                    className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl border border-gray-200"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      🕒 Patient Timing Details
                    </h2>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium">Billing:</span>
                        <span>{item?.billing || "NA"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Category:</span>
                        <span>{item?.category || "NA"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span>{item?.duration || "NA"} Min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span>
                          {item?.created
                            ? new Date(item.created).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "NA"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance alerts */}

      <AddManualTask
        open={openTaskDialog}
        onOpenChange={setOpenTaskDialog}
        fetchTask={fetchTasks}
        patient={patient}
      />
      <CreateBillDialog
        open={createBillDialog}
        onOpenChange={setCreateBillDialog}
        patient={patient}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {editTask && (
        <EditTaskModal
          task={editTask}
          fetchTask={fetchTasks}
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
};

export default CCMTaskTracking;
