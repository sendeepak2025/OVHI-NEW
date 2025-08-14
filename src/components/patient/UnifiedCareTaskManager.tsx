import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Heart,
  Stethoscope,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Calendar,
  Timer
} from 'lucide-react';
import { unifiedCareService, UnifiedTask } from '@/services/unifiedCareService';
import GetAllMenualTask from './GetAllMenualTask';

interface UnifiedCareTaskManagerProps {
  patientId: string;
  diagnoses: any[];
  enrolledPrograms: string[];
  onTaskUpdate?: () => void;
}

const UnifiedCareTaskManager: React.FC<UnifiedCareTaskManagerProps> = ({
  patientId,
  diagnoses,
  enrolledPrograms,
  onTaskUpdate
}) => {
  const [tasks, setTasks] = useState<UnifiedTask[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnifiedTasks();
  }, [patientId, enrolledPrograms]);

  const loadUnifiedTasks = async () => {
    setLoading(true);
    try {
      // Generate unified tasks based on enrolled programs
      const patientConditions = diagnoses.map(d => d.diagnosis?.toLowerCase() || '');
      const unifiedTasks = unifiedCareService.generateUnifiedTasks(
        patientId,
        enrolledPrograms,
        patientConditions
      );
      
      setTasks(unifiedTasks);
      
      // Calculate metrics
      const calculatedMetrics = unifiedCareService.calculateMonthlyMetrics(patientId, unifiedTasks);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error loading unified tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasksByProgram = (programType: string) => {
    return tasks.filter(task => task.program_type === programType);
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate >= today && taskDate <= nextWeek && task.status === 'pending';
    });
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate < today && task.status === 'pending';
    });
  };

  const getCriticalTasks = () => {
    return tasks.filter(task => 
      task.priority === 'urgent' || 
      task.device_triggered || 
      task.task_type === 'urgent_response'
    );
  };

  const programStats = [
    {
      name: 'RPM',
      icon: Activity,
      tasks: filterTasksByProgram('RPM'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      compliance: metrics.rpmCompliance || 0,
      cptCodes: '99453-99458'
    },
    {
      name: 'CCM', 
      icon: Heart,
      tasks: filterTasksByProgram('CCM'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      minutes: metrics.ccmMinutes || 0,
      cptCodes: '99490-99491'
    },
    {
      name: 'PCM',
      icon: Stethoscope, 
      tasks: filterTasksByProgram('PCM'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      minutes: metrics.pcmMinutes || 0,
      cptCodes: '99424-99427'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Unified Care Management Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${metrics.billingPotential || 0}</div>
              <div className="text-sm text-muted-foreground">Monthly Potential</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getCriticalTasks().length}</div>
              <div className="text-sm text-muted-foreground">Critical Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {metrics.complianceStatus || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Compliance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical & Upcoming Tasks */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Critical Tasks ({getCriticalTasks().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getCriticalTasks().length > 0 ? (
              <div className="space-y-2">
                {getCriticalTasks().slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <Badge variant="destructive" className="text-xs">URGENT</Badge>
                    <span className="text-sm font-medium flex-1">{task.task_title}</span>
                    {task.device_triggered && (
                      <Badge variant="outline" className="text-xs">Device Alert</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No critical tasks</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Clock className="h-5 w-5" />
              Upcoming This Week ({getUpcomingTasks().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getUpcomingTasks().length > 0 ? (
              <div className="space-y-2">
                {getUpcomingTasks().slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded">
                    <Badge variant="secondary" className="text-xs">{task.program_type}</Badge>
                    <span className="text-sm flex-1">{task.task_title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming tasks</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Program-Specific Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {programStats.filter(stat => stat.tasks.length > 0).map(stat => {
          const Icon = stat.icon;
          const completedTasks = stat.tasks.filter(t => t.status === 'completed').length;
          const completionRate = stat.tasks.length > 0 ? (completedTasks / stat.tasks.length) * 100 : 0;
          
          return (
            <Card key={stat.name}>
              <CardHeader className={`${stat.bgColor} rounded-t-lg`}>
                <CardTitle className={`flex items-center gap-2 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                  {stat.name} Program
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasks</span>
                    <span className="font-medium">{stat.tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium">{completedTasks}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-medium">{Math.round(completionRate)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                  {stat.minutes !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Minutes</span>
                      <span className="font-medium">{stat.minutes} min</span>
                    </div>
                  )}
                  {stat.compliance !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Compliance</span>
                      <span className="font-medium">{Math.round(stat.compliance)}%</span>
                    </div>
                  )}
                  <Badge variant="outline" className="text-xs">
                    CPT: {stat.cptCodes}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task Tabs by Program */}
      <Card>
        <CardHeader>
          <CardTitle>Program Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="rpm">RPM</TabsTrigger>
              <TabsTrigger value="ccm">CCM</TabsTrigger>
              <TabsTrigger value="pcm">PCM</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <GetAllMenualTask 
                tasks={tasks} 
                fetchTask={loadUnifiedTasks}
              />
            </TabsContent>
            
            <TabsContent value="rpm">
              <GetAllMenualTask 
                tasks={filterTasksByProgram('RPM')} 
                fetchTask={loadUnifiedTasks}
              />
            </TabsContent>
            
            <TabsContent value="ccm">
              <GetAllMenualTask 
                tasks={filterTasksByProgram('CCM')} 
                fetchTask={loadUnifiedTasks}
              />
            </TabsContent>
            
            <TabsContent value="pcm">
              <GetAllMenualTask 
                tasks={filterTasksByProgram('PCM')} 
                fetchTask={loadUnifiedTasks}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <DollarSign className="h-5 w-5" />
            Monthly Billing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {metrics.rpmCompliance >= 75 ? '$90' : '$0'}
              </div>
              <div className="text-sm text-muted-foreground">RPM Billing</div>
              <div className="text-xs mt-1">
                {metrics.rpmCompliance || 0}% compliance
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {metrics.ccmMinutes >= 20 ? '$42' : '$0'}
              </div>
              <div className="text-sm text-muted-foreground">CCM Billing</div>
              <div className="text-xs mt-1">
                {metrics.ccmMinutes || 0}/20 min required
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {metrics.pcmMinutes >= 30 ? '$65' : '$0'}
              </div>
              <div className="text-sm text-muted-foreground">PCM Billing</div>
              <div className="text-xs mt-1">
                {metrics.pcmMinutes || 0}/30 min required
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedCareTaskManager;