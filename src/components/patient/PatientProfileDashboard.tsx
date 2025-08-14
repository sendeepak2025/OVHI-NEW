import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Activity, Heart, AlertTriangle, Clock, 
  FileText, Pill, Shield, Video, MessageSquare,
  Phone, Calendar, TrendingUp, Star
} from 'lucide-react';
import { Patient } from '@/types/dataTypes';

interface PatientProfileDashboardProps {
  patient: Patient;
  onActionClick: (action: string) => void;
}

interface DashboardWidget {
  id: string;
  title: string;
  icon: any;
  value: string | number;
  trend?: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export const PatientProfileDashboard: React.FC<PatientProfileDashboardProps> = ({
  patient,
  onActionClick
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');

  useEffect(() => {
    initializeDashboard();
  }, [patient]);

  const initializeDashboard = () => {
    // Calculate risk stratification
    calculateRiskLevel();
    
    // Initialize dashboard widgets
    const dashboardWidgets: DashboardWidget[] = [
      {
        id: 'vitals',
        title: 'Latest Vitals',
        icon: Heart,
        value: patient.bloodPressure || 'N/A',
        trend: '+2%',
        color: 'text-red-500',
        priority: 'high'
      },
      {
        id: 'medications',
        title: 'Active Medications',
        icon: Pill,
        value: patient.currentMedications?.length || 0,
        color: 'text-green-500',
        priority: 'medium'
      },
      {
        id: 'appointments',
        title: 'Next Appointment',
        icon: Calendar,
        value: 'Mar 25',
        color: 'text-blue-500',
        priority: 'medium'
      },
      {
        id: 'alerts',
        title: 'Active Alerts',
        icon: AlertTriangle,
        value: calculateActiveAlerts(),
        color: 'text-orange-500',
        priority: 'high'
      }
    ];

    setWidgets(dashboardWidgets);
    loadRecentActivity();
  };

  const calculateRiskLevel = () => {
    let riskScore = 0;
    
    // Age factor
    const age = calculateAge(patient.birthDate || '');
    if (age > 65) riskScore += 2;
    else if (age > 50) riskScore += 1;
    
    // Medication count
    const medCount = patient.currentMedications?.length || 0;
    if (medCount > 5) riskScore += 2;
    else if (medCount > 3) riskScore += 1;
    
    // Diagnosis severity
    const hasChronicConditions = patient.diagnosis?.some(d => 
      d.status === 'Active' && ['diabetes', 'hypertension', 'heart'].some(condition => 
        d.diagnosis.toLowerCase().includes(condition)
      )
    );
    if (hasChronicConditions) riskScore += 2;
    
    // Set risk level
    if (riskScore >= 4) setRiskLevel('high');
    else if (riskScore >= 2) setRiskLevel('medium');
    else setRiskLevel('low');
  };

  const calculateActiveAlerts = () => {
    let alerts = 0;
    
    // Drug interactions
    if ((patient.currentMedications?.length || 0) > 3) alerts++;
    
    // Allergy alerts
    if ((patient.allergies?.length || 0) > 0) alerts++;
    
    // Vital sign alerts
    const bp = patient.bloodPressure;
    if (bp && (bp > 140 || bp < 90)) alerts++;
    
    return alerts;
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const loadRecentActivity = () => {
    // Mock recent activity data
    const activities = [
      {
        id: '1',
        type: 'vital_signs',
        description: 'Blood pressure recorded: 128/82',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        icon: Heart,
        priority: 'medium'
      },
      {
        id: '2',
        type: 'medication',
        description: 'Prescribed Lisinopril 10mg',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        icon: Pill,
        priority: 'high'
      },
      {
        id: '3',
        type: 'appointment',
        description: 'Completed telehealth consultation',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        icon: Video,
        priority: 'low'
      }
    ];
    
    setRecentActivity(activities);
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const quickActions = [
    { id: 'send-message', label: 'Send Message', icon: MessageSquare, color: 'blue' },
    { id: 'schedule-appointment', label: 'Schedule Appointment', icon: Calendar, color: 'green' },
    { id: 'start-telehealth', label: 'Start Telehealth', icon: Video, color: 'purple' },
    { id: 'add-note', label: 'Add Note', icon: FileText, color: 'orange' },
    { id: 'prescribe-medication', label: 'Prescribe Medication', icon: Pill, color: 'red' },
    { id: 'order-labs', label: 'Order Labs', icon: Activity, color: 'indigo' }
  ];

  return (
    <div className="space-y-6">
      {/* Patient Header with Risk Stratification */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-user.jpg" alt="Patient" />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {patient.firstName} {patient.lastName}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {calculateAge(patient.birthDate || '')} years • {patient.gender}
                  </span>
                  <Badge className={getRiskBadgeColor(riskLevel)}>
                    <Star className="h-3 w-3 mr-1" />
                    {riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Last Visit</div>
              <div className="font-medium">{patient.lastVisit || 'N/A'}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget) => {
          const IconComponent = widget.icon;
          return (
            <Card key={widget.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onActionClick(widget.id)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {widget.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold">{widget.value}</p>
                      {widget.trend && (
                        <span className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {widget.trend}
                        </span>
                      )}
                    </div>
                  </div>
                  <IconComponent className={`h-8 w-8 ${widget.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => onActionClick(action.id)}
                >
                  <IconComponent className={`h-6 w-6 text-${action.color}-500`} />
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-muted-foreground mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Clinical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Clinical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      {patient.allergies.length} Active Allergies
                    </span>
                  </div>
                </div>
              )}
              
              {(patient.currentMedications?.length || 0) > 5 && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center">
                    <Pill className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">
                      High Medication Count ({patient.currentMedications?.length} active)
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Vital Signs Due for Review
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfileDashboard;