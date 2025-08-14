
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Users,
  Activity,
  Target,
  Timer,
  Play,
  Pause,
  Square,
  Edit3,
  Save,
  X,
  Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';
import { pcmService, PCMCareActivity } from '@/services/pcmService';

interface PCMCareCoordinationActivitiesProps {
  patientId: string;
  providerId: string;
  patientName?: string;
  primaryCondition: string;
}

const PCMCareCoordinationActivities: React.FC<PCMCareCoordinationActivitiesProps> = ({
  patientId,
  providerId,
  patientName = "Patient",
  primaryCondition
}) => {
  const [activities, setActivities] = useState<PCMCareActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerActivity, setTimerActivity] = useState<PCMCareActivity | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [manualTime, setManualTime] = useState<string>('');
  
  // Form state
  const [newActivity, setNewActivity] = useState<Partial<PCMCareActivity>>({
    type: 'comprehensive_assessment',
    priority: 'medium',
    status: 'pending',
    notes: '',
    condition: primaryCondition,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    timeTrackingMode: 'automated'
  });

  const [timeTrackingMode, setTimeTrackingMode] = useState<'automated' | 'manual'>('automated');

  useEffect(() => {
    loadActivities();
  }, [patientId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const loadActivities = () => {
    setLoading(true);
    try {
      const patientActivities = pcmService.getPCMActivities(patientId);
      setActivities(patientActivities);
    } catch (error) {
      console.error('Error loading PCM care activities:', error);
      toast.error('Failed to load care activities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = () => {
    if (!newActivity.notes?.trim()) {
      toast.error('Please provide activity notes');
      return;
    }

    try {
      const activityId = pcmService.createPCMCareActivity({
        patientId,
        type: newActivity.type!,
        condition: primaryCondition,
        status: newActivity.status!,
        priority: newActivity.priority!,
        dueDate: newActivity.dueDate!,
        assignedTo: providerId,
        assignedBy: providerId,
        notes: newActivity.notes!,
        timeTrackingMode: timeTrackingMode
      });

      toast.success('PCM care coordination activity created successfully');
      setShowAddDialog(false);
      setNewActivity({
        type: 'comprehensive_assessment',
        priority: 'medium',
        status: 'pending',
        notes: '',
        condition: primaryCondition,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        timeTrackingMode: 'automated'
      });
      setTimeTrackingMode('automated');
      loadActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity');
    }
  };

  const handleStartTimer = (activity: PCMCareActivity) => {
    if (activeTimer) {
      toast.error('Please stop the current timer first');
      return;
    }

    const timerId = pcmService.startTimeTracking(
      patientId,
      providerId,
      `PCM care coordination: ${activity.type} - ${activity.notes}`
    );

    setActiveTimer(timerId);
    setTimerActivity(activity);
    setTimerSeconds(0);
    
    // Update activity status
    pcmService.updatePCMActivity(patientId, activity.id, { status: 'in_progress' });
    loadActivities();
    
    toast.success(`Started tracking time for: ${activity.type.replace('_', ' ')}`);
  };

  const handleStopTimer = () => {
    if (!activeTimer || !timerActivity) return;

    const timeEntry = pcmService.stopTimeTracking(activeTimer);
    
    if (timeEntry) {
      // Update activity with time spent
      pcmService.updatePCMActivity(patientId, timerActivity.id, {
        timeSpent: timeEntry.duration,
        status: 'completed'
      });
      
      toast.success(`Time tracking stopped. Duration: ${timeEntry.duration} minutes`);
    }

    setActiveTimer(null);
    setTimerActivity(null);
    setTimerSeconds(0);
    loadActivities();
  };

  const handleManualTimeEntry = (activityId: string) => {
    const timeInMinutes = parseInt(manualTime);
    if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
      toast.error('Please enter a valid time in minutes');
      return;
    }

    pcmService.updatePCMActivity(patientId, activityId, {
      timeSpent: timeInMinutes,
      status: 'completed'
    });

    setEditingTime(null);
    setManualTime('');
    loadActivities();
    toast.success(`Manual time entry recorded: ${timeInMinutes} minutes`);
  };

  const handleUpdateStatus = (activityId: string, status: PCMCareActivity['status']) => {
    pcmService.updatePCMActivity(patientId, activityId, { status });
    loadActivities();
    toast.success('Activity status updated');
  };

  const getActivityTypeLabel = (type: PCMCareActivity['type']) => {
    const labels = {
      comprehensive_assessment: 'Comprehensive Assessment',
      care_plan_development: 'Care Plan Development',
      medication_reconciliation: 'Medication Reconciliation',
      patient_education: 'Patient Education',
      care_transitions: 'Care Transitions',
      health_monitoring: 'Health Monitoring',
      provider_communication: 'Provider Communication'
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: PCMCareActivity['priority']) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: PCMCareActivity['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = pcmService.getPCMStats(patientId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6" />
            PCM Care Coordination
          </h2>
          <p className="text-muted-foreground">
            Principal Care Management activities for {patientName} - {primaryCondition}
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add PCM Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create PCM Care Activity</DialogTitle>
              <DialogDescription>
                Add a new Principal Care Management activity for {primaryCondition}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Activity Type</label>
                <Select 
                  value={newActivity.type} 
                  onValueChange={(value) => setNewActivity({...newActivity, type: value as PCMCareActivity['type']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive_assessment">Comprehensive Assessment</SelectItem>
                    <SelectItem value="care_plan_development">Care Plan Development</SelectItem>
                    <SelectItem value="medication_reconciliation">Medication Reconciliation</SelectItem>
                    <SelectItem value="patient_education">Patient Education</SelectItem>
                    <SelectItem value="care_transitions">Care Transitions</SelectItem>
                    <SelectItem value="health_monitoring">Health Monitoring</SelectItem>
                    <SelectItem value="provider_communication">Provider Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select 
                  value={newActivity.priority} 
                  onValueChange={(value) => setNewActivity({...newActivity, priority: value as PCMCareActivity['priority']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Time Tracking Mode</label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch 
                    id="time-mode" 
                    checked={timeTrackingMode === 'manual'}
                    onCheckedChange={(checked) => setTimeTrackingMode(checked ? 'manual' : 'automated')}
                  />
                  <Label htmlFor="time-mode">
                    {timeTrackingMode === 'automated' ? 'Automated Timer' : 'Manual Time Entry'}
                  </Label>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newActivity.dueDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewActivity({...newActivity, dueDate: new Date(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder={`Describe the PCM activity for ${primaryCondition}...`}
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateActivity} className="flex-1">
                  Create Activity
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Timer Alert */}
      {activeTimer && timerActivity && (
        <Alert className="bg-blue-50 border-blue-200">
          <Timer className="h-4 w-4" />
          <AlertTitle>Active PCM Time Tracking</AlertTitle>
          <AlertDescription>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="font-medium">{getActivityTypeLabel(timerActivity.type)}</p>
                <p className="text-sm text-muted-foreground">Duration: {formatTimer(timerSeconds)}</p>
              </div>
              <Button size="sm" onClick={handleStopTimer} variant="destructive">
                <Square className="h-3 w-3 mr-1" />
                Stop Timer
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total PCM Activities</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>PCM Activities for {primaryCondition}</CardTitle>
          <CardDescription>
            Principal Care Management activities and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="text-center py-8">Loading PCM activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No PCM care coordination activities found</p>
                <p className="text-sm text-muted-foreground">Create your first PCM activity to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{getActivityTypeLabel(activity.type)}</h4>
                            <Badge variant={getPriorityColor(activity.priority)}>
                              {activity.priority.toUpperCase()}
                            </Badge>
                            <Badge variant={getStatusColor(activity.status)}>
                              {activity.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="bg-green-50">
                              {activity.condition}
                            </Badge>
                            {activity.timeTrackingMode && (
                              <Badge variant="outline">
                                {activity.timeTrackingMode === 'automated' ? 'Auto Timer' : 'Manual'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{activity.notes}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(activity.dueDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Assigned to: {activity.assignedTo}
                            </div>
                            {activity.timeSpent && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Time: {activity.timeSpent}m
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {activity.status === 'pending' && (
                          <>
                            {(!activity.timeTrackingMode || activity.timeTrackingMode === 'automated') && (
                              <Button 
                                size="sm" 
                                onClick={() => handleStartTimer(activity)}
                                disabled={!!activeTimer}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start Timer
                              </Button>
                            )}
                            
                            {activity.timeTrackingMode === 'manual' && (
                              <div className="flex items-center gap-2">
                                {editingTime === activity.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Minutes"
                                      value={manualTime}
                                      onChange={(e) => setManualTime(e.target.value)}
                                      className="w-20 h-8"
                                    />
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleManualTimeEntry(activity.id)}
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setEditingTime(null);
                                        setManualTime('');
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => setEditingTime(activity.id)}
                                  >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    Enter Time
                                  </Button>
                                )}
                              </div>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateStatus(activity.id, 'in_progress')}
                            >
                              Mark In Progress
                            </Button>
                          </>
                        )}
                        
                        {activity.status === 'in_progress' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(activity.id, 'completed')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                            
                            {activity.timeTrackingMode === 'manual' && !activity.timeSpent && (
                              <div className="flex items-center gap-2">
                                {editingTime === activity.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Minutes"
                                      value={manualTime}
                                      onChange={(e) => setManualTime(e.target.value)}
                                      className="w-20 h-8"
                                    />
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleManualTimeEntry(activity.id)}
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setEditingTime(null);
                                        setManualTime('');
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingTime(activity.id)}
                                  >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    Add Time
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                        
                        {activity.status !== 'completed' && activity.status !== 'cancelled' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleUpdateStatus(activity.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default PCMCareCoordinationActivities;
