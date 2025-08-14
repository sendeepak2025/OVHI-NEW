import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, Clock, Plus, UserCheck } from "lucide-react"; // Import UserCheck icon

import Loader from "@/components/Loader";
import AddNotes from "@/components/patient/AddNotes";
import { Button } from "@/components/ui/button";
import {
  getPatinetNotes,
  getSinglePatientAPI,
} from "@/services/operations/patient";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import RpmNotes from "./pcm/RpmNotes";
import AddManualTask from "@/components/patient/AddManualTask";
import { getTaskByPatientID } from "@/services/operations/task";
import { Badge } from "@/components/ui/badge";
import EditTaskModal from "@/components/patient/EditTaskModal";

interface Note {
  created: string;
  note: string;
  type?: string;
  duration?: number;
  note_id?: any;
  created_by?: any;
}
interface PatientData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  status: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  birthDate: string;
  lastVisit: string;
  emergencyContact: string;
  ethnicity: string;
  height: number;
  weight: number;
  bmi: number;
  bloodPressure: number;
  heartRate: number;
  temperature: number;
  allergies: Array<{
    category: string | null;
    allergen: string;
    reaction: string;
    id: number;
  }>;
  insurance: Array<{
    policyNumber: string;
    groupNumber: string;
    company: string;
    plan: string;
    expirationDate: string;
    type: string;
    effectiveDate: string;
    patient_insurance_id: number;
  }>;
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    startDate: string;
    endDate: string;
    status: string;
    id: number;
  }>;
  diagnosis: Array<{
    date: string;
    icd10: string;
    diagnosis: string;
    status: string;
    id: number;
  }>;
  notes: Array<{
    note: string;
    created: string;
    created_by: number | null;
    note_id: number;
  }>;
  createdBy: number;
  patientService?: any;
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
export const RpmModule = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("notes"); // Initialize activeTab state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editTask, setEditTask] = useState(null);

  const fetchPatientNotes = async () => {
    try {
      setLoading(true);
      const res = await getPatinetNotes(id, token);
      console.log(res, "notes");
      if (res && res.data) {
        setNotes(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch patient notes:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchPatient = async () => {
    setLoading(true);
    try {
      const res = await getSinglePatientAPI(id, token);
      setPatient(res);
      console.log(res, "single patinet");
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
    setLoading(false);
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
  useEffect(() => {
    fetchPatient();
    fetchPatientNotes();
    fetchTasks();
  }, [id]);

  const mapServiceToType = {
    1: "rpm",
  };

  const allowedTypes =
    patient?.patientService?.map((id) => mapServiceToType[id]) || [];

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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Remote Patient Monitoring (RPM)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive care coordination for patients with serious chronic
            conditions
          </p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>{" "}
              {/* Changed value to match content */}
            </TabsList>

            <TabsContent value="notes">
              <div className="flex justify-end">
                <Button className="" onClick={() => setAddDialogOpen(true)}>
                  Add Notes
                </Button>
              </div>
              <br />
              <RpmNotes />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <div className="flex justify-end">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[140px] shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => setOpenTaskDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Task
                </Button>
              </div>

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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddNotes
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        fetchPatientNotes={fetchPatientNotes}
        patient={patient}
      />
      <AddManualTask
        open={openTaskDialog}
        onOpenChange={setOpenTaskDialog}
        fetchTask={fetchTasks}
        patient={patient}
      />

       {editTask && (
        <EditTaskModal
          task={editTask}
          fetchTask={fetchTasks}
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </>
  );
};
