import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Clock, 
  AlertTriangle, 
  Target, 
  CheckCircle,
  Activity,
  Shield,
  TrendingUp,
  Timer,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import { openaiService, type ClinicalGuidanceRequest, type ClinicalGuidanceResponse } from '@/services/openaiService';
import { ccmService } from '@/services/ccmService';

interface AIClinicalGuidanceProps {
  patientId: string;
  providerId: string;
  patientConditions: string[];
  currentTasks: string[];
  vitalSigns?: any;
  medications?: string[];
}

const AIClinicalGuidance: React.FC<AIClinicalGuidanceProps> = ({
  patientId,
  providerId,
  patientConditions,
  currentTasks,
  vitalSigns,
  medications
}) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<ClinicalGuidanceResponse | null>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);

  useEffect(() => {
    // Auto-load guidance if API key is set
    if (apiKey) {
      loadClinicalGuidance();
    }
  }, [patientConditions, currentTasks]);

  const loadClinicalGuidance = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your OpenAI API key');
      return;
    }

    setLoading(true);
    try {
      openaiService.setApiKey(apiKey);
      
      const request: ClinicalGuidanceRequest = {
        patientConditions,
        currentTasks,
        vitalSigns,
        medications
      };

      const response = await openaiService.getClinicalGuidance(request);
      setGuidance(response);
      toast.success('AI clinical guidance loaded successfully');
    } catch (error) {
      console.error('Error loading clinical guidance:', error);
      toast.error('Failed to load clinical guidance');
    } finally {
      setLoading(false);
    }
  };

  const startTask = (taskName: string, timeRequired: number) => {
    setActiveTask(taskName);
    setTaskStartTime(new Date());
    
    // Start CCM time tracking with correct parameters
    ccmService.startTimeTracking(
      patientId, 
      providerId, 
      'care_coordination', 
      `AI-guided task: ${taskName}`
    );
    
    toast.success(`Started task: ${taskName} (Est. ${timeRequired} min)`);
  };

  const completeTask = () => {
    if (!activeTask || !taskStartTime) return;

    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - taskStartTime.getTime()) / (1000 * 60));
    
    // Stop CCM time tracking - need to find the active timer
    // For now, we'll create a simple implementation
    toast.success(`Completed: ${activeTask} (${timeSpent} minutes)`);
    setActiveTask(null);
    setTaskStartTime(null);
  };

  const getTaskTimer = () => {
    if (!taskStartTime) return '00:00';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - taskStartTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const getTotalTimeRequired = () => {
    if (!guidance) return 0;
    
    return [
      ...guidance.mandatoryTasks.map(t => t.timeRequired),
      ...guidance.qualityMeasures.map(q => q.timeRequired),
      ...guidance.clinicalAlerts.map(a => a.timeRequired),
      ...guidance.careGaps.map(g => g.timeRequired)
    ].reduce((sum, time) => sum + time, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Clinical Guidance System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered clinical decision support for CCM compliance and quality care
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="password"
                placeholder="Enter OpenAI API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={loadClinicalGuidance} 
                disabled={loading || !apiKey.trim()}
              >
                {loading ? 'Analyzing...' : 'Get AI Guidance'}
              </Button>
            </div>

            {activeTask && (
              <Alert className="bg-blue-50 border-blue-200">
                <Timer className="h-4 w-4" />
                <AlertTitle>Active Task: {activeTask}</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono text-lg">{getTaskTimer()}</span>
                    </div>
                    <Button size="sm" onClick={completeTask}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Task
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {guidance && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Clinical Guidance Summary</CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Total Est. Time: {getTotalTimeRequired()} minutes
                </div>
                <Button size="sm" variant="outline" onClick={loadClinicalGuidance}>
                  Refresh Guidance
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {guidance.mandatoryTasks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mandatory Tasks
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {guidance.qualityMeasures.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quality Measures
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {guidance.clinicalAlerts.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Clinical Alerts
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {guidance.careGaps.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Care Gaps
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="mandatory" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="mandatory">Mandatory Tasks</TabsTrigger>
                <TabsTrigger value="quality">Quality Measures</TabsTrigger>
                <TabsTrigger value="alerts">Clinical Alerts</TabsTrigger>
                <TabsTrigger value="gaps">Care Gaps</TabsTrigger>
              </TabsList>

              <TabsContent value="mandatory" className="space-y-4">
                <div className="space-y-3">
                  {guidance.mandatoryTasks.map((task, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              {task.task}
                              <Badge variant={getPriorityColor(task.priority)}>
                                {task.priority.toUpperCase()}
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.reasoning}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.timeRequired} minutes
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <Button 
                            size="sm"
                            onClick={() => startTask(task.task, task.timeRequired)}
                            disabled={!!activeTask}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start Task
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <div className="space-y-3">
                  {guidance.qualityMeasures.map((measure, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              {measure.measure}
                              <Badge variant={measure.status === 'compliant' ? 'default' : 'destructive'}>
                                {measure.status.toUpperCase()}
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Action: {measure.action}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Est. {measure.timeRequired} minutes
                          </div>
                          
                          <Button 
                            size="sm"
                            onClick={() => startTask(measure.measure, measure.timeRequired)}
                            disabled={!!activeTask}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Address
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <div className="space-y-3">
                  {guidance.clinicalAlerts.map((alert, index) => (
                    <Alert key={index} variant={getSeverityColor(alert.severity) as any}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {alert.alert}
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <p>Action: {alert.action}</p>
                            <p className="text-xs text-muted-foreground">
                              Est. time: {alert.timeRequired} minutes
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => startTask(alert.alert, alert.timeRequired)}
                            disabled={!!activeTask}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Address
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gaps" className="space-y-4">
                <div className="space-y-3">
                  {guidance.careGaps.map((gap, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              {gap.gap}
                              <Badge variant={gap.impact === 'high' ? 'destructive' : 'secondary'}>
                                {gap.impact.toUpperCase()} IMPACT
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Recommendation: {gap.recommendation}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Est. {gap.timeRequired} minutes
                          </div>
                          
                          <Button 
                            size="sm"
                            onClick={() => startTask(gap.gap, gap.timeRequired)}
                            disabled={!!activeTask}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Address Gap
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIClinicalGuidance;
