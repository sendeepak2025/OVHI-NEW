import type React from "react";
import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Heart,
  Stethoscope,
  Shield,
  Target,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  ccmService,
  type CareCoordinationActivity,
  type PatientRiskScore,
  type EnhancedClinicalAlert,
  type EnhancedQualityMeasure,
} from "@/services/ccmService";
import CareCoordinationActivities from "@/components/ccm/CareCoordinationActivities";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useParams } from "react-router-dom";
import { getTaskByPatientID } from "@/services/operations/task";
import { getSinglePatientAPI } from "@/services/operations/patient";
import Loader from "@/components/Loader";

interface EnhancedClinicalDashboardProps {
  patientId: string;
  providerId: string;
  patientName?: string;
}

interface Task {
  id: string;
  type: any;
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
  program_type?: "RPM" | "CCM" | "PCM" | "General";
  cpt_code?: string;
  billing_minutes?: number;
  compliance_deadline?: string;
  program_status?: "enrolled" | "pending" | "inactive";
  billable_activity?: boolean;
}

const EnhancedClinicalDashboard: React.FC<EnhancedClinicalDashboardProps> = ({
  patientId,
  providerId,
  patientName = "Patient",
}) => {
  const [loading, setLoading] = useState(true);
  const [comprehensiveData, setComprehensiveData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [activeAlerts, setActiveAlerts] = useState<EnhancedClinicalAlert[]>([]);
  const [careActivities, setCareActivities] = useState<
    CareCoordinationActivity[]
  >([]);
  const [qualityMeasures, setQualityMeasures] = useState<
    EnhancedQualityMeasure[]
  >([]);
  const [riskScores, setRiskScores] = useState<PatientRiskScore[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);

  const fetchPatientData = async () => {
    try {
      const res = await getSinglePatientAPI(id, token);
      if (res) {
        setPatient(res);
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      toast.error("Failed to fetch patient data");
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await getTaskByPatientID(id, token);
      console.log(response);
      setTasks(response.task_id || []);
      console.log(response, "task response ");
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTasks(), fetchPatientData()]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const acknowledgeAlert = (alertId: string) => {
    if (ccmService.acknowledgeClinicalAlert(alertId, providerId)) {
      toast.success("Alert acknowledged");
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "medication":
        return <Heart className="h-4 w-4" />;
      case "lab":
        return <Activity className="h-4 w-4" />;
      case "vitals":
        return <Stethoscope className="h-4 w-4" />;
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "quality_measure":
        return <Target className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      default:
        return "default";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "very_high":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "default";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const mapServiceToType = {
    1: "rpm",
    2: "ccm",
    3: "pcm",
  };

  const allowedTypes =
    patient?.patientService?.map((id) => mapServiceToType[id]) || [];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Clinical Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive care management and clinical insights for{" "}
            {patientName}
          </p>
        </div>
      </div>

      {/* Critical Alerts */}
      {activeAlerts.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            Active Clinical Alerts ({activeAlerts.length})
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {activeAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.alertType)}
                    <span className="text-sm">{alert.title}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Care Time</p>
                <p className="text-2xl font-bold">
                  {comprehensiveData
                    ? formatDuration(comprehensiveData.totalTime)
                    : "0m"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Care Activities</p>
                <p className="text-2xl font-bold">{careActivities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Quality Measures
                </p>
                <p className="text-2xl font-bold">{qualityMeasures.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Compliance Score
                </p>
                <p className="text-2xl font-bold">
                  {comprehensiveData?.complianceStatus?.complianceScore || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Clinical Alerts</TabsTrigger>
          <TabsTrigger value="activities">Care Coordination</TabsTrigger>
          <TabsTrigger value="quality">Quality Measures</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Care Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                    {tasks && tasks.length > 0 ? (
                      tasks
                        ?.filter((task) => allowedTypes.includes(task.type))
                        .map((task, index) => {
                          const isMatched = allowedTypes.includes(task.type);
                          return (
                            <Card
                              key={task.id}
                              className="group bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slideUp"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <CardContent className="p-0">
                                <div className="p-4 lg:p-6">
                                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                    <div className="space-y-3 flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
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
                                          {isMatched && (
                                            <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                              Patient Match:{" "}
                                              {task.type.toUpperCase()}
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
                                          <span className="font-medium">
                                            Due:
                                          </span>
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
                                          <span className="font-medium">
                                            Est:
                                          </span>
                                          <span>
                                            {formatDuration(
                                              task.estimated_duration
                                            )}
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
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No care activities found
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Risk Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {riskScores.map((score) => (
                      <div key={score.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">{score.scoreType} Score</p>
                          <Badge className={getRiskColor(score.riskLevel)}>
                            {score.riskLevel.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(score.score / score.maxScore) * 100}
                            className="flex-1"
                          />
                          <span className="text-sm">
                            {score.score}/{score.maxScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Alerts Management</CardTitle>
              <CardDescription>
                Monitor and acknowledge critical patient alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    variant={getAlertColor(alert.severity) as any}
                  >
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.alertType)}
                      <div className="flex-1">
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>
                          {alert.description}
                          <br />
                          <strong>Action Required:</strong>{" "}
                          {alert.actionRequired ? "Yes" : "No"}
                        </AlertDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </Alert>
                ))}
                {activeAlerts.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <CareCoordinationActivities
            patientId={patientId}
            providerId={providerId}
            patientName={patientName}
          />
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Quality Measures Tracking</CardTitle>
              <CardDescription>
                Monitor HEDIS, CMS, and custom quality measures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityMeasures.map((measure) => (
                  <div key={measure.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{measure.measureName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {measure.measureType} Measure
                        </p>
                      </div>
                      <Badge
                        variant={
                          measure.isCompliant ? "default" : "destructive"
                        }
                      >
                        {measure.isCompliant ? "Compliant" : "Non-Compliant"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          Current: {measure.currentValue} {measure.unit}
                        </span>
                        <span>
                          Target: {measure.targetValue} {measure.unit}
                        </span>
                      </div>
                      <Progress
                        value={
                          (measure.currentValue / measure.targetValue) * 100
                        }
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Last assessed:{" "}
                          {new Date(measure.lastAssessed).toLocaleDateString()}
                        </span>
                        <span>
                          Next due:{" "}
                          {new Date(measure.nextDue).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {qualityMeasures.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No quality measures configured
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Comprehensive patient risk stratification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {riskScores.map((score) => (
                  <div key={score.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">
                        {score.scoreType} Risk Assessment
                      </h4>
                      <Badge className={getRiskColor(score.riskLevel)}>
                        {score.riskLevel.replace("_", " ").toUpperCase()} RISK
                      </Badge>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Risk Score</span>
                        <span>
                          {score.score} / {score.maxScore}
                        </span>
                      </div>
                      <Progress value={(score.score / score.maxScore) * 100} />
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Risk Factors:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {score.factors.map((factor, index) => (
                          <div
                            key={index}
                            className="text-sm border rounded p-2"
                          >
                            <div className="flex justify-between">
                              <span>{factor.factor}</span>
                              <span className="font-medium">
                                {factor.weight}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {factor.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {riskScores.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No risk assessments completed
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>CCM Compliance Status</CardTitle>
              <CardDescription>
                Monitor regulatory compliance and billing requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comprehensiveData?.complianceStatus && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Minimum Time Met (20+ min)</span>
                        <Badge
                          variant={
                            comprehensiveData.complianceStatus.minimumTimeMet
                              ? "default"
                              : "destructive"
                          }
                        >
                          {comprehensiveData.complianceStatus.minimumTimeMet
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Qualifying Activities</span>
                        <Badge
                          variant={
                            comprehensiveData.complianceStatus
                              .qualifyingActivities
                              ? "default"
                              : "destructive"
                          }
                        >
                          {comprehensiveData.complianceStatus
                            .qualifyingActivities
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Documentation Complete</span>
                        <Badge
                          variant={
                            comprehensiveData.complianceStatus
                              .documentationComplete
                              ? "default"
                              : "destructive"
                          }
                        >
                          {comprehensiveData.complianceStatus
                            .documentationComplete
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Care Coordination Active</span>
                        <Badge
                          variant={
                            comprehensiveData.complianceStatus
                              .careCoordinationActive
                              ? "default"
                              : "secondary"
                          }
                        >
                          {comprehensiveData.complianceStatus
                            .careCoordinationActive
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Quality Measures Tracked</span>
                        <Badge
                          variant={
                            comprehensiveData.complianceStatus
                              .qualityMeasuresTracked
                              ? "default"
                              : "secondary"
                          }
                        >
                          {comprehensiveData.complianceStatus
                            .qualityMeasuresTracked
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Time This Month</span>
                        <Badge variant="outline">
                          {formatDuration(
                            comprehensiveData.complianceStatus.totalMinutes
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">
                      Overall Compliance Score
                    </h4>
                    <div className="flex items-center gap-4">
                      <Progress
                        value={
                          comprehensiveData.complianceStatus.complianceScore
                        }
                        className="flex-1"
                      />
                      <span className="font-bold text-lg">
                        {comprehensiveData.complianceStatus.complianceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedClinicalDashboard;
