import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Target,
  Phone,
  Mail,
  FileText,
  Bot,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

interface CollectionWorkflow {
  id: string;
  name: string;
  triggerDays: number;
  method: 'email' | 'phone' | 'letter' | 'sms';
  template: string;
  automationEnabled: boolean;
  successRate: number;
  lastExecuted: string;
}

interface CollectionActivity {
  id: string;
  patientName: string;
  balance: number;
  daysPastDue: number;
  workflowStep: string;
  nextAction: string;
  nextActionDate: string;
  priority: 'high' | 'medium' | 'low';
  contactAttempts: number;
  lastContact: string;
  responseRate: number;
}

const CollectionsWorkflowManager: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [automationEnabled, setAutomationEnabled] = useState(true);

  // Mock workflow data
  const workflows: CollectionWorkflow[] = [
    {
      id: 'WF001',
      name: '30-Day Reminder',
      triggerDays: 30,
      method: 'email',
      template: 'Friendly payment reminder with portal link',
      automationEnabled: true,
      successRate: 45.2,
      lastExecuted: '2024-01-14'
    },
    {
      id: 'WF002', 
      name: '60-Day Follow-up',
      triggerDays: 60,
      method: 'phone',
      template: 'Personal call with payment plan options',
      automationEnabled: true,
      successRate: 62.8,
      lastExecuted: '2024-01-13'
    },
    {
      id: 'WF003',
      name: '90-Day Final Notice',
      triggerDays: 90,
      method: 'letter',
      template: 'Final notice before collections agency',
      automationEnabled: false,
      successRate: 38.5,
      lastExecuted: '2024-01-12'
    }
  ];

  const activities: CollectionActivity[] = [
    {
      id: 'CA001',
      patientName: 'John Smith',
      balance: 1250.00,
      daysPastDue: 35,
      workflowStep: '30-Day Reminder',
      nextAction: 'Send follow-up email',
      nextActionDate: '2024-01-18',
      priority: 'medium',
      contactAttempts: 2,
      lastContact: '2024-01-10',
      responseRate: 65
    },
    {
      id: 'CA002',
      patientName: 'Sarah Johnson',
      balance: 850.00,
      daysPastDue: 65,
      workflowStep: '60-Day Follow-up',
      nextAction: 'Schedule phone call',
      nextActionDate: '2024-01-17',
      priority: 'high',
      contactAttempts: 3,
      lastContact: '2024-01-08',
      responseRate: 40
    },
    {
      id: 'CA003',
      patientName: 'Michael Brown',
      balance: 2100.00,
      daysPastDue: 95,
      workflowStep: '90-Day Final Notice',
      nextAction: 'Send final notice letter',
      nextActionDate: '2024-01-16',
      priority: 'high',
      contactAttempts: 5,
      lastContact: '2024-01-05',
      responseRate: 20
    }
  ];

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Workflow executed successfully');
    } catch (error) {
      toast.error('Workflow execution failed');
    }
  };

  const handleManualContact = async (activityId: string, method: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${method} contact initiated`);
    } catch (error) {
      toast.error('Contact attempt failed');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'letter': return FileText;
      case 'sms': return Phone;
      default: return Mail;
    }
  };

  const collectionsStats = {
    totalInCollections: activities.reduce((sum, a) => sum + a.balance, 0),
    averageResponseRate: activities.reduce((sum, a) => sum + a.responseRate, 0) / activities.length,
    activeWorkflows: workflows.filter(w => w.automationEnabled).length,
    scheduledActions: activities.length
  };

  return (
    <div className="space-y-6">
      {/* Collections Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Collections</p>
                <p className="text-2xl font-bold">${collectionsStats.totalInCollections.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{collectionsStats.averageResponseRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{collectionsStats.activeWorkflows}</p>
              </div>
              <Bot className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Actions</p>
                <p className="text-2xl font-bold">{collectionsStats.scheduledActions}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automated Collections Workflows
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Global Automation:</span>
              <input
                type="checkbox"
                checked={automationEnabled}
                onChange={(e) => setAutomationEnabled(e.target.checked)}
                className="rounded"
              />
            </div>
            <Button size="sm">
              <Target className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map((workflow) => {
              const IconComponent = getMethodIcon(workflow.method);
              return (
                <div key={workflow.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{workflow.name}</span>
                      <Badge variant="outline">{workflow.triggerDays} days</Badge>
                      {workflow.automationEnabled && (
                        <Badge variant="secondary">
                          <Bot className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{workflow.successRate}%</p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{workflow.template}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <p className="font-medium capitalize">{workflow.method}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trigger:</span>
                      <p className="font-medium">{workflow.triggerDays} days past due</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Executed:</span>
                      <p className="font-medium">{workflow.lastExecuted}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">
                        {workflow.automationEnabled ? 'Active' : 'Manual'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleExecuteWorkflow(workflow.id)}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Execute Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Edit Template
                    </Button>
                    <Button size="sm" variant="ghost">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Collections Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Collections Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{activity.patientName}</span>
                    <Badge className={getPriorityColor(activity.priority)}>
                      {activity.priority}
                    </Badge>
                    <Badge variant="outline">{activity.daysPastDue} days</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${activity.balance.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{activity.contactAttempts} attempts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current Step:</span>
                    <p className="font-medium">{activity.workflowStep}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Action:</span>
                    <p className="font-medium">{activity.nextAction}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <p className="font-medium">{activity.nextActionDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Contact:</span>
                    <p className="font-medium">{activity.lastContact}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Response Rate</span>
                    <span>{activity.responseRate}%</span>
                  </div>
                  <Progress value={activity.responseRate} className="w-full" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleManualContact(activity.id, 'Phone')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleManualContact(activity.id, 'Email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button size="sm" variant="ghost">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionsWorkflowManager;