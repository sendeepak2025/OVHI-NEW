
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Clipboard, Calendar, Edit, Trash2, CheckCircle, AlertCircle, ClipboardCheck, ArrowUpCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CarePlanTask } from '@/data/medicalData';
import { formatDate } from '@/utils/formatHelpers';
import DiagnosisSelector from '@/components/billing/DiagnosisSelector';
import { toast } from 'sonner';

interface CarePlanTabProps {
  tasks: CarePlanTask[];
  onEdit?: () => void;
}

const CarePlanTab: React.FC<CarePlanTabProps> = ({ tasks: initialTasks, onEdit }) => {
  const [tasks, setTasks] = useState<CarePlanTask[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [carePlanNotes, setCarePlanNotes] = useState<string>("Patient requires close monitoring of blood pressure and medication compliance. Follow up in 2 weeks to reassess progress.");

  // New task form state
  const [newTask, setNewTask] = useState<Partial<CarePlanTask>>({
    task: "",
    type: "Medication",
    frequency: "Daily",
    status: "Pending",
    goal: "",
    assigned: new Date().toISOString(),
    progress: 0,
    notes: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = () => {
    if (!newTask.task || !newTask.goal) {
      toast.error("Please complete all required fields");
      return;
    }
    
    const taskToAdd: CarePlanTask = {
      id: `task-${Date.now()}`,
      task: newTask.task || "",
      type: newTask.type || "Medication",
      frequency: newTask.frequency || "Daily",
      status: newTask.status || "Pending",
      goal: newTask.goal || "",
      assigned: newTask.assigned || new Date().toISOString(),
      completedDate: null,
      progress: 0,
      notes: newTask.notes
    };
    
    setTasks(prev => [taskToAdd, ...prev]);
    setOpenDialog(false);
    setNewTask({
      task: "",
      type: "Medication",
      frequency: "Daily",
      status: "Pending",
      goal: "",
      assigned: new Date().toISOString(),
      progress: 0,
      notes: ""
    });
    
    toast.success("Care plan task added successfully");
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { 
          ...task, 
          status: newStatus,
          completedDate: newStatus === "Completed" ? new Date().toISOString() : null,
          progress: newStatus === "Completed" ? 100 : newStatus === "Ongoing" ? 50 : 0
        };
        return updatedTask;
      }
      return task;
    }));
    
    toast.success(`Task status updated to ${newStatus}`);
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { 
          ...task, 
          progress,
          status: progress === 100 ? "Completed" : progress > 0 ? "Ongoing" : "Pending",
          completedDate: progress === 100 ? new Date().toISOString() : null
        };
        return updatedTask;
      }
      return task;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast.success("Task removed from care plan");
  };

  const getProgressColor = (progress: number | undefined) => {
    if (!progress) return "bg-blue-500";
    if (progress >= 80) return "bg-green-500";
    if (progress >= 40) return "bg-amber-500";
    return "bg-blue-500";
  };

  const filteredTasks = activeTab === "all" 
    ? tasks 
    : activeTab === "completed" 
      ? tasks.filter(task => task.status === "Completed")
      : tasks.filter(task => task.status !== "Completed");

  const completedTasksCount = tasks.filter(task => task.status === "Completed").length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Care Plan Management</h2>
          <p className="text-muted-foreground">Track and manage patient care plan tasks and progress</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" /> Edit Care Plan
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Clipboard className="h-4 w-4 mr-1" /> Print Care Plan
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-1" /> Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Care Plan Task</DialogTitle>
                <DialogDescription>
                  Create a new task for this patient's care plan. Fill in all required details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="task" className="required">Task Description</Label>
                  <Input
                    id="task"
                    name="task"
                    value={newTask.task}
                    onChange={handleInputChange}
                    placeholder="e.g., Monitor blood pressure daily"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Task Type</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('type', value)}
                      defaultValue={newTask.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Monitoring">Monitoring</SelectItem>
                        <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Testing">Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange('frequency', value)}
                      defaultValue={newTask.frequency}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Biweekly">Biweekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="goal" className="required">Goal</Label>
                  <Input
                    id="goal"
                    name="goal"
                    value={newTask.goal}
                    onChange={handleInputChange}
                    placeholder="e.g., Maintain BP below 130/80 mmHg"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newTask.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Any additional information about this task"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Associated Diagnosis</Label>
                  <DiagnosisSelector 
                    selectedDiagnoses={selectedDiagnoses}
                    onDiagnosisChange={setSelectedDiagnoses}
                    maxSelections={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleAddTask}>Add to Care Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Care Plan Progress</CardTitle>
            <CardDescription>Overall completion rate: {taskCompletionRate}%</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={taskCompletionRate} className="h-3" />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center p-3 bg-blue-50 rounded-md">
                <span className="text-2xl font-bold">{tasks.length}</span>
                <span className="text-sm text-muted-foreground">Total Tasks</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-green-50 rounded-md">
                <span className="text-2xl font-bold">{completedTasksCount}</span>
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-amber-50 rounded-md">
                <span className="text-2xl font-bold">{tasks.filter(t => t.status === "Ongoing").length}</span>
                <span className="text-sm text-muted-foreground">In Progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Care Plan Notes</CardTitle>
            <CardDescription>Provider observations</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={carePlanNotes} 
              onChange={(e) => setCarePlanNotes(e.target.value)}
              className="min-h-[120px]" 
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => toast.success("Care plan notes saved")}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Save Notes
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">Active Tasks</TabsTrigger>
              <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Task</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <ClipboardCheck className="h-8 w-8 mb-2" />
                    <p>No {activeTab === "completed" ? "completed" : activeTab === "active" ? "active" : ""} tasks found</p>
                    <Button variant="link" onClick={() => setOpenDialog(true)}>
                      Add your first task
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.task}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {task.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.frequency}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        task.status === 'Completed' 
                          ? 'bg-green-500 text-white' 
                          : task.status === 'Ongoing' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-amber-500 text-white'
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={task.progress || 0} 
                        className={`h-2 w-[60px] ${getProgressColor(task.progress)}`} 
                      />
                      <span className="text-xs">{task.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(task.assigned)}</TableCell>
                  <TableCell>{task.goal}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {task.status !== "Completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateStatus(task.id, "Completed")}
                          title="Mark as completed"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {task.status !== "Ongoing" && task.status !== "Completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateStatus(task.id, "Ongoing")}
                          title="Mark as in progress"
                        >
                          <ArrowUpCircle className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CarePlanTab;
