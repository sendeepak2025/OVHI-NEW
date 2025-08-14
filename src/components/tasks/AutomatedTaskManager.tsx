
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  RotateCcw,
  TrendingUp,
  FileText,
  Target,
  Brain,
  Workflow,
  PlusCircle,
  BarChart3,
  Timer,
  Zap,
  MessageSquare,
  Stethoscope,
  Activity,
  Users,
  Filter,
  Download,
  Settings,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { taskService, type AutomatedTask } from '@/services/taskService';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { createTaskAPI, getTaskByPatientID, editTask } from '@/services/operations/task';
import CreateTaskDialog from './CreateTaskDialog';

interface AutomatedTaskManagerProps {
  patientId: string;
  providerId: string;
  patientConditions: string[];
}

interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  complianceRate: number;
  avgCompletionTime: number;
  ccmTimeTracked: number;
}

interface AIRecommendation {
  id: string;
  type: 'priority_adjustment' | 'workflow_optimization' | 'resource_allocation' | 'care_gap';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  estimatedDuration: number;
  category: string;
}

const AutomatedTaskManager: React.FC<AutomatedTaskManagerProps> = ({
  patientId,
  providerId,
  patientConditions
}) => {
  const [automatedTasks, setAutomatedTasks] = useState<AutomatedTask[]>([]);
  const [backendTasks, setBackendTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTimeTracking, setActiveTimeTracking] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    initializeAutomatedTasks();
    loadWorkflowTemplates();
    generateAIRecommendations();
  }, [patientId, patientConditions]);

  const initializeAutomatedTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Load backend tasks
      if (token) {
        const backendData = await getTaskByPatientID(patientId, token);
        if (backendData?.success && backendData?.data) {
          setBackendTasks(backendData.data);
        }
      }

      // Check if we need to generate new monthly tasks
      if (taskService.shouldGenerateMonthlyTasks(lastGenerated)) {
        const newTasks = taskService.generateAutomatedTasks(patientId, patientConditions);
        setAutomatedTasks(prev => [...prev, ...newTasks]);
        setLastGenerated(new Date());
        toast.success(`Generated ${newTasks.length} automated tasks for this month`);
      }

      // Calculate metrics
      calculateMetrics();
    } catch (error) {
      console.error('Error initializing tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [patientId, patientConditions, token, lastGenerated]);

  const calculateMetrics = useCallback(() => {
    const allTasks = [...automatedTasks, ...backendTasks];
    const completed = allTasks.filter(t => t.status === 'completed');
    const overdue = taskService.getOverdueTasks(automatedTasks);
    const upcoming = taskService.getUpcomingTasks(automatedTasks);
    
    const newMetrics: TaskMetrics = {
      totalTasks: allTasks.length,
      completedTasks: completed.length,
      overdueTasks: overdue.length,
      upcomingTasks: upcoming.length,
      complianceRate: allTasks.length > 0 ? Math.round((completed.length / allTasks.length) * 100) : 0,
      avgCompletionTime: calculateAvgCompletionTime(completed),
      ccmTimeTracked: calculateCCMTime()
    };
    
    setMetrics(newMetrics);
  }, [automatedTasks, backendTasks]);

  const calculateAvgCompletionTime = (completedTasks: any[]) => {
    // Mock calculation - in real implementation, track actual completion times
    return 25; // minutes
  };

  const calculateCCMTime = () => {
    // Mock calculation - in real implementation, integrate with CCM time tracking
    return 180; // minutes this month
  };

  const loadWorkflowTemplates = () => {
    const templates: WorkflowTemplate[] = [
      {
        id: 'monthly-diabetes',
        name: 'Monthly Diabetes Management',
        description: 'Comprehensive diabetes care workflow',
        tasks: ['HbA1c Review', 'Medication Reconciliation', 'Care Plan Update'],
        estimatedDuration: 45,
        category: 'diabetes'
      },
      {
        id: 'ccm-assessment',
        name: 'CCM Assessment Workflow',
        description: 'Complete CCM assessment and documentation',
        tasks: ['Patient Contact', 'Condition Review', 'Care Coordination', 'Documentation'],
        estimatedDuration: 60,
        category: 'care_coordination'
      }
    ];
    setWorkflowTemplates(templates);
  };

  const generateAIRecommendations = () => {
    const recommendations: AIRecommendation[] = [
      {
        id: 'rec-1',
        type: 'workflow_optimization',
        title: 'Optimize Diabetes Task Sequence',
        description: 'Schedule lab review before medication reconciliation for better clinical decision making',
        confidence: 85,
        impact: 'medium',
        actionable: true
      },
      {
        id: 'rec-2',
        type: 'care_gap',
        title: 'Missing Annual Eye Exam',
        description: 'Patient with diabetes hasn\'t had eye exam scheduled for this year',
        confidence: 95,
        impact: 'high',
        actionable: true
      },
      {
        id: 'rec-3',
        type: 'resource_allocation',
        title: 'Peak Task Loading Detected',
        description: 'Consider redistributing tasks across the month for better workflow',
        confidence: 78,
        impact: 'low',
        actionable: true
      }
    ];
    setAIRecommendations(recommendations);
  };

  const handleStartTask = async (task: AutomatedTask | any) => {
    try {
      // Start time tracking
      setActiveTimeTracking(task.id);
      
      if ('task_title' in task) {
        // Automated task
        setAutomatedTasks(prev => 
          prev.map(t => 
            t.id === task.id 
              ? { ...t, status: 'in_progress' as const }
              : t
          )
        );
        // Link to CCM time tracking
        taskService.linkTaskToCCMActivity(task.id, patientId, providerId);
      } else {
        // Backend task
        if (token) {
          await editTask(task.id, 'in_progress', patientId, token);
          setBackendTasks(prev => 
            prev.map(t => 
              t.id === task.id 
                ? { ...t, status: 'in_progress' }
                : t
            )
          );
        }
      }
      
      toast.success(`Started task: ${task.task_title || task.title}`);
      calculateMetrics();
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task');
    }
  };

  const handleCompleteTask = async (taskId: string, isBackendTask = false) => {
    try {
      // Stop time tracking
      setActiveTimeTracking(null);
      
      if (isBackendTask) {
        if (token) {
          await editTask(taskId, 'completed', patientId, token);
          setBackendTasks(prev => 
            prev.map(t => 
              t.id === taskId 
                ? { ...t, status: 'completed' }
                : t
            )
          );
        }
      } else {
        setAutomatedTasks(prev => 
          prev.map(t => 
            t.id === taskId 
              ? { ...t, status: 'completed' as const }
              : t
          )
        );
      }
      
      toast.success('Task completed successfully');
      calculateMetrics();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      if (token) {
        const response = await createTaskAPI(taskData, patientId, token);
        if (response?.success) {
          // Refresh tasks
          await initializeAutomatedTasks();
          setIsCreateDialogOpen(false);
          toast.success('Task created successfully');
        }
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const applyWorkflow = (templateId: string) => {
    const template = workflowTemplates.find(t => t.id === templateId);
    if (template) {
      template.tasks.forEach((taskTitle, index) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + index + 1);
        
        const newTask: AutomatedTask = {
          id: `workflow_${Date.now()}_${index}`,
          task_title: taskTitle,
          task_description: `Part of ${template.name} workflow`,
          priority: 'medium',
          status: 'pending',
          tasks_category_name: template.category,
          task_type: 'workflow',
          due_date: dueDate.toISOString().split('T')[0],
          frequency: 'monthly',
          condition_based: false,
          auto_generated: true
        };
        
        setAutomatedTasks(prev => [...prev, newTask]);
      });
      
      toast.success(`Applied ${template.name} workflow`);
      calculateMetrics();
    }
  };

  const handleRegenerateMonthlyTasks = () => {
    const newTasks = taskService.generateAutomatedTasks(patientId, patientConditions);
    setAutomatedTasks(prev => [...prev, ...newTasks]);
    setLastGenerated(new Date());
    toast.success(`Regenerated ${newTasks.length} monthly tasks`);
    calculateMetrics();
  };

  const upcomingTasks = taskService.getUpcomingTasks(automatedTasks);
  const overdueTasks = taskService.getOverdueTasks(automatedTasks);
  const complianceReport = taskService.generateTaskComplianceReport(automatedTasks);

  const filteredTasks = automatedTasks.filter(task => {
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const categoryMatch = filterCategory === 'all' || task.tasks_category_name === filterCategory;
    return priorityMatch && categoryMatch;
  });

  const allTasksForDisplay = [...filteredTasks, ...backendTasks.filter(task => {
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const categoryMatch = filterCategory === 'all' || task.task_category === filterCategory;
    return priorityMatch && categoryMatch;
  })];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with AI Insights Toggle */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">AI-Powered Task Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Intelligent automation for chronic care management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="ai-insights" className="text-sm">AI Insights</Label>
                <Switch 
                  id="ai-insights"
                  checked={showAIInsights}
                  onCheckedChange={setShowAIInsights}
                />
              </div>
              <Button 
                onClick={handleRegenerateMonthlyTasks}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <CreateTaskDialog onSubmit={handleCreateTask} />
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Enhanced Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-10"></div>
              <CardContent className="p-4 text-center relative">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics?.totalTasks || complianceReport.totalTasks}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-10"></div>
              <CardContent className="p-4 text-center relative">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {metrics?.completedTasks || complianceReport.completedTasks}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-10"></div>
              <CardContent className="p-4 text-center relative">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {metrics?.overdueTasks || complianceReport.overdueTasks}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 opacity-10"></div>
              <CardContent className="p-4 text-center relative">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics?.complianceRate || complianceReport.complianceRate}%
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Compliance</div>
                <Progress 
                  value={metrics?.complianceRate || complianceReport.complianceRate} 
                  className="h-1 mt-2" 
                />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-10"></div>
              <CardContent className="p-4 text-center relative">
                <div className="flex items-center justify-center mb-2">
                  <Timer className="h-5 w-5 text-orange-600 mr-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics?.avgCompletionTime || 25}m
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-700 opacity-10"></div>
              <CardContent className="p-4 text-center relative">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-5 w-5 text-cyan-600 mr-2" />
                  <div className="text-2xl font-bold text-cyan-600">
                    {metrics?.ccmTimeTracked || 180}m
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">CCM Time</div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations Panel */}
          {showAIInsights && aiRecommendations.length > 0 && (
            <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRecommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <Brain className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              rec.impact === 'high' ? 'border-red-200 text-red-700' :
                              rec.impact === 'medium' ? 'border-orange-200 text-orange-700' :
                              'border-gray-200 text-gray-700'
                            }`}
                          >
                            {rec.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                      {rec.actionable && (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workflow Templates */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Quick Workflow Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a workflow template" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.estimatedDuration}min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => selectedTemplate && applyWorkflow(selectedTemplate)}
                  disabled={!selectedTemplate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Workflow className="h-4 w-4 mr-2" />
                  Apply Workflow
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="care_coordination">Care Coordination</SelectItem>
                <SelectItem value="medication_management">Medication</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="laboratory">Laboratory</SelectItem>
                <SelectItem value="preventive_care">Preventive Care</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Tasks
            </Button>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">
                <BarChart3 className="h-4 w-4 mr-1" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                <Calendar className="h-4 w-4 mr-1" />
                Upcoming ({upcomingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Overdue ({overdueTasks.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                <FileText className="h-4 w-4 mr-1" />
                All Tasks ({allTasksForDisplay.length})
              </TabsTrigger>
              <TabsTrigger value="conditions">
                <Stethoscope className="h-4 w-4 mr-1" />
                Conditions
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <TrendingUp className="h-4 w-4 mr-1" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-blue-600" />
                      Active Time Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeTimeTracking ? (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">Task in progress</p>
                          <p className="text-sm text-muted-foreground">
                            Time tracking active...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">00:15:32</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Timer className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No active time tracking</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Patient Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patientConditions.map((condition, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <span className="capitalize font-medium">{condition.replace('_', ' ')}</span>
                          <Badge variant="outline" className="text-xs">
                            {automatedTasks.filter(t => t.required_conditions?.includes(condition)).length} tasks
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 flex-wrap">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Patient Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Care Plan Update
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Medication Review
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Follow-up
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="space-y-3">
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No upcoming tasks</p>
                  </div>
                ) : (
                  upcomingTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            {task.task_title}
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.auto_generated && (
                              <Badge variant="outline" className="text-xs">
                                AUTO
                              </Badge>
                            )}
                          </h3>
                          <p className="text-gray-600 mt-1">{task.task_description}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.frequency}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {activeTimeTracking === task.id && (
                            <div className="flex items-center gap-2 px-2 py-1 bg-blue-100 rounded text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span>Tracking</span>
                            </div>
                          )}
                          {task.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStartTask(task)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteTask(task.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              <div className="space-y-3">
                {overdueTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
                    <p>No overdue tasks</p>
                  </div>
                ) : (
                  overdueTasks.map((task) => (
                    <div key={task.id} className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            {task.task_title}
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              OVERDUE
                            </Badge>
                          </h3>
                          <p className="text-gray-600 mt-1">{task.task_description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-red-600">
                          Was due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartTask(task)}
                          variant="destructive"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Now
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-3">
                {allTasksForDisplay.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          {task.task_title || task.title}
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {task.condition_based && (
                            <Badge variant="secondary" className="text-xs">
                              CONDITION
                            </Badge>
                          )}
                          {task.auto_generated && (
                            <Badge variant="outline" className="text-xs">
                              AUTO
                            </Badge>
                          )}
                        </h3>
                        <p className="text-gray-600 mt-1">{task.task_description || task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div>Due: {new Date(task.due_date || task.dueDate).toLocaleDateString()}</div>
                        <div>Type: {task.task_type || 'Manual'}</div>
                        {task.frequency && <div>Frequency: {task.frequency}</div>}
                      </div>
                      
                      <div className="flex gap-2">
                        {activeTimeTracking === task.id && (
                          <div className="flex items-center gap-2 px-2 py-1 bg-blue-100 rounded text-xs">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Tracking</span>
                          </div>
                        )}
                        {task.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartTask(task)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleCompleteTask(task.id, !('task_title' in task))}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Completion Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Chart visualization would be implemented here</p>
                        <p className="text-sm">Real-time analytics dashboard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Provider Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Tasks Completed This Month</span>
                        <span className="font-bold">{metrics?.completedTasks || 0}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span>Average Response Time</span>
                        <span className="font-bold">{metrics?.avgCompletionTime || 25}min</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span>CCM Compliance Rate</span>
                        <span className="font-bold">{metrics?.complianceRate || 0}%</span>
                      </div>
                      <Progress value={metrics?.complianceRate || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Task Distribution by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['care_coordination', 'medication_management', 'monitoring', 'laboratory'].map((category) => {
                      const count = allTasksForDisplay.filter(t => 
                        (t.tasks_category_name || t.category) === category
                      ).length;
                      return (
                        <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{count}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {category.replace('_', ' ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Patient Conditions: {patientConditions.join(', ')}</h3>
                
                <div className="space-y-3">
                  {automatedTasks.filter(task => task.condition_based).map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            {task.task_title}
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              CONDITION-BASED
                            </Badge>
                          </h3>
                          <p className="text-gray-600 mt-1">{task.task_description}</p>
                          {task.required_conditions && (
                            <p className="text-xs text-blue-600 mt-2">
                              Required for: {task.required_conditions.join(', ')}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedTaskManager;

// Note: This file is getting quite large (500+ lines). Consider refactoring into smaller components:
// - TaskMetricsCard.tsx
// - AIRecommendationsPanel.tsx
// - TaskListItem.tsx
// - WorkflowTemplateSelector.tsx
// - TaskAnalyticsDashboard.tsx
