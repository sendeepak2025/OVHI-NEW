import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Play,
  Square,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  Heart,
  Brain,
  Stethoscope,
  Shield,
  Target,
  TrendingUp,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { ccmService, type CCMTimeEntry } from "@/services/ccmService";
import { CCMAssessment } from "./CCMAssessment";

interface EnhancedCCMAssessmentProps {
  patientId?: string;
  providerId?: string;
}

interface TimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  activityType:
    | "care_coordination"
    | "medication_management"
    | "assessment"
    | "education"
    | "monitoring"
    | "consultation"
    | "documentation";
  description: string;
  providerId: string;
  billable: boolean;
  cptCode?: string;
  complianceNotes: string;
}

interface QualityMeasure {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  status: "met" | "not_met" | "in_progress";
  lastAssessed: Date;
}

interface ClinicalAlert {
  id: string;
  type: "medication" | "vitals" | "lab" | "appointment" | "care_gap";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  actionRequired: boolean;
  dueDate?: Date;
}

const EnhancedCCMAssessment: React.FC<EnhancedCCMAssessmentProps> = ({
  patientId: propPatientId,
  providerId = "dr-smith",
}) => {
  const { id: paramPatientId } = useParams();
  const patientId = propPatientId || paramPatientId || "";

  // Time tracking state
  const [activeTimeEntry, setActiveTimeEntry] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] =
    useState<TimeEntry["activityType"]>("assessment");
  const [activityDescription, setActivityDescription] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [monthlyMinutes, setMonthlyMinutes] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Assessment state
  const [qualityMeasures, setQualityMeasures] = useState<QualityMeasure[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);
  const [complianceScore, setComplianceScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">(
    "medium"
  );

  // Billing state
  const [eligibilityStatus, setEligibilityStatus] = useState({
    multipleConditions: false,
    consentObtained: true,
    minimumTime: false,
    careManagementProvided: false,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimeEntry) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimeEntry]);

  useEffect(() => {
    if (patientId) {
      initializePatientData();
    }
  }, [patientId]);

  const initializePatientData = () => {
    // Initialize quality measures
    const measures: QualityMeasure[] = [
      {
        id: "bp_control",
        name: "Blood Pressure Control",
        description: "BP <140/90 for patients with hypertension",
        target: 80,
        current: 75,
        status: "in_progress",
        lastAssessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "diabetes_control",
        name: "Diabetes Management",
        description: "HbA1c <7% for diabetic patients",
        target: 70,
        current: 85,
        status: "met",
        lastAssessed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "medication_adherence",
        name: "Medication Adherence",
        description: "Patient taking medications as prescribed",
        target: 90,
        current: 78,
        status: "not_met",
        lastAssessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    // Initialize clinical alerts
    const alerts: ClinicalAlert[] = [
      {
        id: "med_review",
        type: "medication",
        severity: "medium",
        message: "Medication review due - last review 90 days ago",
        actionRequired: true,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "lab_follow",
        type: "lab",
        severity: "high",
        message: "Follow-up on abnormal lipid panel results",
        actionRequired: true,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "care_gap",
        type: "care_gap",
        severity: "low",
        message: "Annual eye exam overdue for diabetic patient",
        actionRequired: false,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ];

    setQualityMeasures(measures);
    setClinicalAlerts(alerts);

    // Calculate compliance score
    const metMeasures = measures.filter((m) => m.status === "met").length;
    const score = Math.round((metMeasures / measures.length) * 100);
    setComplianceScore(score);

    // Load existing time entries for the month
    loadMonthlyTimeEntries();
  };

  const loadMonthlyTimeEntries = () => {
    // Mock data for current month
    const mockEntries: TimeEntry[] = [
      {
        id: "1",
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000
        ),
        duration: 25,
        activityType: "care_coordination",
        description: "Coordinated with specialist for cardiology consultation",
        providerId,
        billable: true,
        cptCode: "99490",
        complianceNotes:
          "Care coordination documented with specialist communication",
      },
      {
        id: "2",
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000
        ),
        duration: 15,
        activityType: "medication_management",
        description: "Reviewed medication adherence and adjusted dosing",
        providerId,
        billable: true,
        cptCode: "99490",
        complianceNotes: "Medication reconciliation completed",
      },
    ];

    setTimeEntries(mockEntries);
    const totalMinutes = mockEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    setMonthlyMinutes(totalMinutes);

    // Update eligibility based on current data
    updateEligibilityStatus(mockEntries);
  };

  const updateEligibilityStatus = (entries: TimeEntry[]) => {
    const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const hasCareManagement = entries.some((entry) =>
      ["care_coordination", "medication_management", "education"].includes(
        entry.activityType
      )
    );

    setEligibilityStatus({
      multipleConditions: true, // Assume patient has multiple chronic conditions
      consentObtained: true,
      minimumTime: totalTime >= 20,
      careManagementProvided: hasCareManagement,
    });
  };

  const startTimeTracking = () => {
    if (activeTimeEntry) {
      toast.error("Time tracking is already active");
      return;
    }

    if (!activityDescription.trim()) {
      toast.error("Please provide activity description");
      return;
    }

    const entryId = `entry_${Date.now()}`;
    setActiveTimeEntry(entryId);
    setElapsedTime(0);
    toast.success("Time tracking started");
  };

  const stopTimeTracking = () => {
    if (!activeTimeEntry) return;

    // ✅ Custom rounding logic
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const durationMinutes = seconds > 30 ? minutes + 1 : minutes;

    const newEntry: TimeEntry = {
      id: activeTimeEntry,
      startTime: new Date(Date.now() - elapsedTime * 1000),
      endTime: new Date(),
      duration: durationMinutes,
      activityType: currentActivity,
      description: activityDescription,
      providerId,
      billable: durationMinutes >= 5, // Minimum 5 minutes to be billable
      cptCode: determineCPTCode(durationMinutes, currentActivity),
      complianceNotes: generateComplianceNotes(
        currentActivity,
        durationMinutes
      ),
    };

    console.log(newEntry);
    const updatedEntries = [...timeEntries, newEntry];
    setTimeEntries(updatedEntries);
    setMonthlyMinutes((prev) => prev + durationMinutes);
    updateEligibilityStatus(updatedEntries);

    setActiveTimeEntry(null);
    setElapsedTime(0);
    setActivityDescription("");

    toast.success(
      `Time tracking completed: ${durationMinutes} minute${
        durationMinutes > 1 ? "s" : ""
      } logged`
    );
  };

  const determineCPTCode = (
    minutes: number,
    activity: TimeEntry["activityType"]
  ): string => {
    if (minutes < 5) return "";

    // Base CCM codes
    if (minutes >= 20 && minutes < 40) return "99490";
    if (minutes >= 40 && minutes < 60) return "99491";
    if (minutes >= 60) return "99487";

    return "99490"; // Default to basic CCM
  };

  const generateComplianceNotes = (
    activity: TimeEntry["activityType"],
    minutes: number
  ): string => {
    const notes = {
      care_coordination:
        "Care coordination activity documented with clear communication outcomes",
      medication_management:
        "Medication review and reconciliation completed with patient education",
      assessment:
        "Comprehensive patient assessment conducted with documented findings",
      education: "Patient education provided with understanding verified",
      monitoring:
        "Clinical monitoring performed with appropriate follow-up planned",
      consultation:
        "Clinical consultation completed with recommendations documented",
      documentation:
        "Clinical documentation updated with current patient status",
    };

    return `${notes[activity]} - Duration: ${minutes} minutes`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getBillingThreshold = (minutes: number) => {
    if (minutes < 20) return { next: 20, code: "99490", amount: 65.15 };
    if (minutes < 40) return { next: 40, code: "99491", amount: 97.5 };
    if (minutes < 60) return { next: 60, code: "99487", amount: 145.75 };
    return { next: 90, code: "99489", amount: 195.25 };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const nextThreshold = getBillingThreshold(monthlyMinutes);
  const progressPercentage = Math.min(
    (monthlyMinutes / nextThreshold.next) * 100,
    100
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Advanced CCM Clinical Management System
          </CardTitle>
          <CardDescription>
            Comprehensive chronic care management with real-time tracking,
            quality measures, and compliance monitoring
          </CardDescription>
        </CardHeader>

        <CCMAssessment />
        {/* <CardContent>
          <Tabs defaultValue="tracking" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="tracking">Time Tracking</TabsTrigger>
              <TabsTrigger value="quality">Quality Measures</TabsTrigger>
              <TabsTrigger value="alerts">Clinical Alerts</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="billing">Billing Status</TabsTrigger>
            </TabsList>

            <TabsContent value="tracking" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Active Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="activity">Activity Type</Label>
                      <Select value={currentActivity} onValueChange={(value) => setCurrentActivity(value as TimeEntry['activityType'])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="care_coordination">Care Coordination</SelectItem>
                          <SelectItem value="medication_management">Medication Management</SelectItem>
                          <SelectItem value="assessment">Patient Assessment</SelectItem>
                          <SelectItem value="education">Patient Education</SelectItem>
                          <SelectItem value="monitoring">Health Monitoring</SelectItem>
                          <SelectItem value="consultation">Clinical Consultation</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Activity Description</Label>
                      <Textarea
                        id="description"
                        value={activityDescription}
                        onChange={(e) => setActivityDescription(e.target.value)}
                        placeholder="Detailed description of CCM activity for compliance documentation..."
                        disabled={!!activeTimeEntry}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-3xl font-bold font-mono">
                          {formatTime(elapsedTime)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current session
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!activeTimeEntry ? (
                          <Button 
                            onClick={startTimeTracking} 
                            disabled={!activityDescription.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Timer
                          </Button>
                        ) : (
                          <Button onClick={stopTimeTracking} variant="destructive">
                            <Square className="h-4 w-4 mr-2" />
                            Stop & Log
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Monthly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total CCM Time</span>
                        <span className="text-lg font-bold">{monthlyMinutes} min</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {monthlyMinutes}m</span>
                        <span>Next threshold: {nextThreshold.next}m</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next CPT Code:</span>
                        <Badge variant="outline" className="font-mono">
                          {nextThreshold.code}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Estimated Value:</span>
                        <span className="font-semibold text-green-600">
                          ${nextThreshold.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {nextThreshold.next - monthlyMinutes} more minutes needed
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {timeEntries.length}
                        </div>
                        <div className="text-xs text-blue-600">Sessions</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {timeEntries.filter(e => e.billable).length}
                        </div>
                        <div className="text-xs text-green-600">Billable</div>
                      </div>
                      <div className="p-2 bg-purple-50 rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {Math.floor(monthlyMinutes / 20)}
                        </div>
                        <div className="text-xs text-purple-600">Units</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {timeEntries.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No activities logged this month
                      </p>
                    ) : (
                      timeEntries.slice(-5).reverse().map((entry) => (
                        <div key={entry.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {entry.activityType.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {entry.billable && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  Billable
                                </Badge>
                              )}
                              {entry.cptCode && (
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {entry.cptCode}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium">{entry.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {entry.startTime.toLocaleDateString()} • {entry.duration} minutes
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5" />
                      Quality Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {complianceScore}%
                      </div>
                      <Progress value={complianceScore} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Overall quality performance
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5" />
                      Risk Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge 
                        variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'secondary' : 'default'}
                        className="text-lg px-4 py-2 mb-2"
                      >
                        {riskLevel.toUpperCase()}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Current risk stratification
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {clinicalAlerts.filter(a => a.actionRequired).length}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Require immediate attention
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Measures</CardTitle>
                  <CardDescription>
                    HEDIS and CMS quality measures tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {qualityMeasures.map((measure) => (
                      <div key={measure.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{measure.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {measure.description}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              measure.status === 'met' ? 'default' : 
                              measure.status === 'in_progress' ? 'secondary' : 'destructive'
                            }
                          >
                            {measure.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current: {measure.current}%</span>
                            <span>Target: {measure.target}%</span>
                          </div>
                          <Progress value={measure.current} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Last assessed: {measure.lastAssessed.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Clinical Alerts & Care Gaps
                  </CardTitle>
                  <CardDescription>
                    Automated alerts based on clinical guidelines and care protocols
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clinicalAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-lg border-l-4 ${
                          alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                          alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                          alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {alert.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {alert.actionRequired && (
                                <Badge variant="destructive">
                                  ACTION REQUIRED
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium mb-1">{alert.message}</p>
                            {alert.dueDate && (
                              <p className="text-sm text-muted-foreground">
                                Due: {alert.dueDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {alert.actionRequired && (
                            <Button size="sm" variant="outline">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    CCM Billing Compliance
                  </CardTitle>
                  <CardDescription>
                     CCM billing requirements and documentation standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Eligibility Requirements</h4>
                      {Object.entries(eligibilityStatus).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <CheckCircle 
                            className={`h-5 w-5 ${value ? 'text-green-500' : 'text-red-500'}`} 
                          />
                          <div className="flex-1">
                            <p className="font-medium">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {value ? 'Requirement met' : 'Requirement not met'}
                            </p>
                          </div>
                          <Badge variant={value ? 'default' : 'destructive'}>
                            {value ? 'COMPLIANT' : 'NON-COMPLIANT'}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Documentation Status</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Care Plan</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Comprehensive care plan documented and updated
                          </p>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Patient Consent</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Written consent obtained and on file
                          </p>
                        </div>

                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">Time Documentation</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {monthlyMinutes >= 20 ? 
                              'Minimum time requirement met' : 
                              `${20 - monthlyMinutes} more minutes needed`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Billing Summary
                  </CardTitle>
                  <CardDescription>
                    Current month CCM billing status and revenue projection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {monthlyMinutes}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Minutes
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.floor(monthlyMinutes / 20)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Billable Units
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${((Math.floor(monthlyMinutes / 20)) * 65.15).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Projected Revenue
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Object.values(eligibilityStatus).filter(Boolean).length}/4
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Compliance Score
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Available CPT Codes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { code: '99490', description: 'CCM services, first 20 minutes', rate: 65.15, requirement: '20+ minutes' },
                        { code: '99491', description: 'CCM services, additional 20 minutes', rate: 32.50, requirement: '40+ minutes' },
                        { code: '99487', description: 'Complex CCM, first 60 minutes', rate: 145.75, requirement: '60+ minutes' },
                        { code: '99489', description: 'Complex CCM, additional 30 minutes', rate: 72.85, requirement: '90+ minutes' }
                      ].map((cpt) => (
                        <div key={cpt.code} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-mono font-semibold">{cpt.code}</span>
                              <span className="ml-2 text-green-600 font-semibold">
                                ${cpt.rate.toFixed(2)}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {cpt.requirement}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {cpt.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent> */}
      </Card>
    </div>
  );
};

export default EnhancedCCMAssessment;
