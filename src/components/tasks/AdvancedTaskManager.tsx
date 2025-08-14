import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Plus,
  BarChart,
  Timer,
  Workflow,
  Brain,
  FileText,
  CheckCircle,
  Activity,
  Heart,
  Stethoscope,
  DollarSign,
} from "lucide-react";

import TaskAnalyticsDashboard from "./analytics/TaskAnalyticsDashboard";
import TaskTimerWidget from "./timers/TaskTimerWidget";
import WorkflowTemplateManager from "./workflows/WorkflowTemplateManager";
import ComplianceReportViewer from "./compliance/ComplianceReportViewer";
import AITaskRecommendations from "./ai/AITaskRecommendations";
import AddManualTask from "../patient/AddManualTask";
import ProgramTaskDialog from "./ProgramTaskDialog";
import { getTaskByPatientID } from "@/services/operations/task";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import EditTaskModal from "../patient/EditTaskModal";
import Loader from "../Loader";
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
  program_type?: "RPM" | "CCM" | "PCM" | "General";
  cpt_code?: string;
  billing_minutes?: number;
  compliance_deadline?: string;
  program_status?: "enrolled" | "pending" | "inactive";
  billable_activity?: boolean;
  type: string;
  duration?: number;
}

interface AdvancedTaskManagerProps {
  patientId: string;
  patientConditions?: string[];
  patient?: any;
}

const AdvancedTaskManager: React.FC<AdvancedTaskManagerProps> = ({
  patientId,
  patientConditions = [],
  patient,
}) => {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openProgramTaskDialog, setOpenProgramTaskDialog] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getTaskByPatientID(id, token);
      console.log(response);
      setTasks(response.task_id);
      console.log(response, "task response ");

      setFilteredTasks(response.task_id);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  useEffect(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.task_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
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

  const handleCreateTask = (taskData: any) => {
    // This would call the API to create a task
    console.log("Creating task:", taskData);
    fetchTasks(); // Refresh tasks after creation
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    // This would call the API to update a task
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const categories = [
    "care_coordination",
    "medication_management",
    "monitoring",
    "laboratory",
    "preventive_care",
  ];

  function formatDuration(durationInSeconds) {
    const duration = Number(durationInSeconds);
    if (isNaN(duration)) return "Invalid duration";

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    let result = "";
    if (hours > 0) result += `${hours} hr `;
    if (minutes > 0) result += `${minutes} min `;
    if (seconds > 0 || result === "") result += `${seconds} sec`;

    return result.trim();
  }

  if (loading) {
    <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Advanced Task Management
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Comprehensive patient task tracking and workflow automation
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[140px] shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => setOpenTaskDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Manual Task
              </Button>
              {/* <Button
                size="lg"
                className="min-w-[140px] shadow-md hover:shadow-lg transition-all duration-200 bg-primary hover:bg-primary/90"
                onClick={() => setOpenProgramTaskDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Program Task
              </Button> */}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-sm">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 bg-transparent p-0">
              <TabsTrigger
                value="tasks"
                className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Tasks</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
              >
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>

              <TabsTrigger
                value="workflows"
                className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
              >
                <Workflow className="h-4 w-4" />
                <span className="hidden sm:inline">Workflows</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="flex items-center gap-2 px-3 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Compliance</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tasks" className="space-y-6 animate-fadeIn">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader className="border-b border-border/20 bg-gradient-to-r from-card via-card to-accent/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-5 w-5 text-primary" />
                  Task Management
                </CardTitle>
                <CardDescription className="text-base">
                  Manage and track all patient tasks with advanced filtering and
                  real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Enhanced Filters */}
                <div className="bg-accent/30 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      Filters & Search
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tasks by title or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60 transition-colors"
                        />
                      </div>
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/60">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">📋 Pending</SelectItem>
                        <SelectItem value="in_progress">
                          ⚡ In Progress
                        </SelectItem>
                        <SelectItem value="completed">✅ Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/60 focus:border-primary/60">
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/60">
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enhanced Task List */}
                <div className="space-y-4">
                  {filteredTasks?.map((task, index) => (
                    <Card
                      key={task.id}
                      className=" relative group bg-card/40  backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slideUp"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="p-0">
                        <div className="p-4 lg:p-6">
                          <div className="flex  flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
                                  <Badge
                                    className={`${getStatusColor(
                                      task.type
                                    )} shadow-sm font-medium`}
                                  >
                                    {task.type.replace("_", " ").toUpperCase()}
                                  </Badge>

                                  {task.program_type &&
                                    task.program_type !== "General" && (
                                      <Badge
                                        variant="outline"
                                        className="border-blue-200 text-blue-700 bg-blue-50 shadow-sm flex items-center gap-1"
                                      >
                                        {task.program_type === "RPM" && (
                                          <Activity className="h-3 w-3" />
                                        )}
                                        {task.program_type === "CCM" && (
                                          <Heart className="h-3 w-3" />
                                        )}
                                        {task.program_type === "PCM" && (
                                          <Stethoscope className="h-3 w-3" />
                                        )}
                                        {task.program_type}
                                      </Badge>
                                    )}
                                  {task.cpt_code && (
                                    <Badge
                                      variant="outline"
                                      className="border-green-200 text-green-700 bg-green-50 shadow-sm flex items-center gap-1"
                                    >
                                      <DollarSign className="h-3 w-3" />
                                      {task.cpt_code}
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
                                  <span>{task?.duration}m</span>
                                </div>
                                {task.actual_duration && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">Actual:</span>
                                    <span>{task.actual_duration}m</span>
                                  </div>
                                )}
                                {task.billing_minutes && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="font-medium">
                                      Billing:
                                    </span>
                                    <span>{task.billing_minutes}min</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 min-w-0 ">
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Enhanced Empty State */}
                {filteredTasks?.length === 0 && !loading && (
                  <Card className="bg-gradient-to-br from-accent/20 to-primary/5 border-border/30">
                    <CardContent className="text-center py-12">
                      <div className="animate-pulse-light">
                        <Calendar className="h-16 w-16 mx-auto text-muted-foreground/60 mb-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        No Tasks Found
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {searchTerm ||
                        statusFilter !== "all" ||
                        priorityFilter !== "all" ||
                        categoryFilter !== "all"
                          ? "No tasks match your current filters. Try adjusting your search criteria or clearing filters."
                          : "Get started by creating your first task or use AI recommendations to generate tasks automatically."}
                      </p>
                      {(searchTerm ||
                        statusFilter !== "all" ||
                        priorityFilter !== "all" ||
                        categoryFilter !== "all") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setPriorityFilter("all");
                            setCategoryFilter("all");
                          }}
                          className="mt-2"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="animate-fadeIn">
            <TaskAnalyticsDashboard
              patientId={patientId}
              onRefresh={fetchTasks}
            />
          </TabsContent>

          <TabsContent value="workflows" className="animate-fadeIn">
            <WorkflowTemplateManager
              onApplyWorkflow={(templateId, patientId) => {
                console.log(
                  "Applying workflow:",
                  templateId,
                  "to patient:",
                  patientId
                );
                fetchTasks(); // Refresh tasks after workflow application
              }}
              patient={patient}
            />
          </TabsContent>

          <TabsContent value="ai" className="animate-fadeIn">
            <AITaskRecommendations
            fetchTasks={fetchTasks}
              patientId={patientId}
              patientConditions={patientConditions}
              onAddTask={(recommendation) => {
                console.log(
                  "Adding task from AI recommendation:",
                  recommendation
                );
                fetchTasks(); // Refresh tasks after adding AI recommendation
              }}
              patient={patient}
            />
          </TabsContent>

          <TabsContent value="compliance" className="animate-fadeIn">
            <ComplianceReportViewer patientId={patientId} />
          </TabsContent>
        </Tabs>
      </div>

      <AddManualTask
        open={openTaskDialog}
        onOpenChange={setOpenTaskDialog}
        fetchTask={fetchTasks}
        patient={patient}
      />

      <ProgramTaskDialog
        open={openProgramTaskDialog}
        onOpenChange={setOpenProgramTaskDialog}
        fetchTask={fetchTasks}
        patientId={patientId}
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
    </div>
  );
};

export default AdvancedTaskManager;
