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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Timer,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import {
  ccmService,
  type CareCoordinationActivity,
} from "@/services/ccmService";
import AddManualTask from "../patient/AddManualTask";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useParams } from "react-router-dom";
import { getTaskByPatientID } from "@/services/operations/task";
import { getSinglePatientAPI } from "@/services/operations/patient";
import EditTaskModal from "../patient/EditTaskModal";
import Loader from "../Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CareCoordinationActivitiesProps {
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

const CareCoordinationActivities: React.FC<CareCoordinationActivitiesProps> = ({
  patientId,
  providerId,
  patientName = "Patient",
}) => {
  const [activities, setActivities] = useState<CareCoordinationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [editTask, setEditTask] = useState(null);
  const [timerActivity, setTimerActivity] =
    useState<CareCoordinationActivity | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [manualTime, setManualTime] = useState<string>("");
  const [newActivity, setNewActivity] = useState<
    Partial<CareCoordinationActivity>
  >({
    type: "medication_review",
    priority: "medium",
    status: "pending",
    notes: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    timeTrackingMode: "automated",
  });
  const [timeTrackingMode, setTimeTrackingMode] = useState<
    "automated" | "manual"
  >("automated");
  const [tasks, setTasks] = useState<Task[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStopTimer = () => {
    if (!activeTimer || !timerActivity) return;
    const timeEntry = ccmService.stopTimeTracking(activeTimer);
    if (timeEntry) {
      ccmService.updateCareActivity(patientId, timerActivity.id, {
        timeSpent: timeEntry.duration,
        status: "completed",
      });
      toast.success(
        `Time tracking stopped. Duration: ${timeEntry.duration} minutes`
      );
    }
    setActiveTimer(null);
    setTimerActivity(null);
    setTimerSeconds(0);
  };

  const getActivityTypeLabel = (type: CareCoordinationActivity["type"]) => {
    const labels = {
      medication_review: "Medication Review",
      specialist_consult: "Specialist Consultation",
      lab_follow_up: "Lab Follow-up",
      patient_education: "Patient Education",
      care_plan_update: "Care Plan Update",
      family_engagement: "Family Engagement",
      discharge_planning: "Discharge Planning",
    };
    return labels[type] || type;
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

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getActivityStats = () => {
    const filteredTasks = tasks.filter((task) =>
      allowedTypes.includes(task.type)
    );
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const inProgress = filteredTasks.filter(
      (t) => t.status === "in_progress"
    ).length;
    const overdue = filteredTasks.filter(
      (t) => t.status !== "completed" && new Date(t.due_date) < new Date()
    ).length;
    return { total, completed, inProgress, overdue };
  };

  const mapServiceToType = {
    1: "rpm",
    2: "ccm",
    3: "pcm",
  };

  const allowedTypes =
    patient?.patientService?.map((id) => mapServiceToType[id]) || [];

  const stats = getActivityStats();

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
          <h2 className="text-2xl font-bold">Care Coordination Activities</h2>
          <p className="text-muted-foreground">
            Manage care coordination tasks for {patientName}
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <AddManualTask
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        fetchTask={fetchTasks}
        patient={patient}
      />

      {activeTimer && timerActivity && (
        <Alert className="bg-blue-50 border-blue-200">
          <Timer className="h-4 w-4" />
          <AlertTitle>Active Time Tracking</AlertTitle>
          <AlertDescription>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="font-medium">
                  {getActivityTypeLabel(timerActivity.type)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {formatTimer(timerSeconds)}
                </p>
              </div>
              <Button size="sm" onClick={handleStopTimer} variant="destructive">
                <Square className="h-3 w-3 mr-1" />
                Stop Timer
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Activities
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.inProgress}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
          <CardDescription>
            Care coordination activities and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {tasks && tasks.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No care coordination activities found
                </p>
                <p className="text-sm text-muted-foreground">
                  Create your first activity to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {tasks
                  ?.filter((task) => allowedTypes.includes(task.type))
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
                              <div className="absolute top-2 right-2 flex flex-col sm:flex-row gap-3 min-w-0">
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
                  })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

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

export default CareCoordinationActivities;
