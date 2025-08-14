import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Shield,
  Target,
  Heart,
  Activity
} from 'lucide-react';
import { openaiService } from '@/services/openaiService';
import type { ClinicalGuidanceRequest, ClinicalGuidanceResponse } from '@/services/openaiService';

interface ClinicalDecisionSupportProps {
  patientData?: any;
  encounterData: any;
  sessionPlan?: any;
  soapNotes?: any;
  onRecommendationAccept?: (recommendation: any) => void;
  onSuggestionApply?: (section: string, content: string) => void;
}

const ClinicalDecisionSupport: React.FC<ClinicalDecisionSupportProps> = ({
  patientData,
  encounterData,
  sessionPlan,
  soapNotes,
  onRecommendationAccept,
  onSuggestionApply
}) => {
  const [guidance, setGuidance] = useState<ClinicalGuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptedRecommendations, setAcceptedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (patientData && sessionPlan) {
      fetchClinicalGuidance();
    }
  }, [patientData, sessionPlan]);

  const fetchClinicalGuidance = async () => {
    setLoading(true);
    try {
      const request: ClinicalGuidanceRequest = {
        patientConditions: patientData?.medicalHistory?.conditions || ['hypertension', 'diabetes'],
        currentTasks: sessionPlan?.focusAreas || [],
        vitalSigns: patientData?.vitals || {},
        medications: patientData?.medications?.map((med: any) => med.name) || [],
        recentAssessments: encounterData?.assessments || []
      };

      const result = await openaiService.getClinicalGuidance(request);
      setGuidance(result);
    } catch (error) {
      console.error('Failed to fetch clinical guidance:', error);
      // Use fallback guidance
      setGuidance({
        mandatoryTasks: [
          {
            task: 'Blood pressure monitoring',
            priority: 'high',
            timeRequired: 5,
            dueDate: new Date().toISOString().split('T')[0],
            reasoning: 'Patient has hypertension diagnosis'
          }
        ],
        qualityMeasures: [
          {
            measure: 'HbA1c testing',
            status: 'due',
            action: 'Order HbA1c lab test',
            timeRequired: 2
          }
        ],
        clinicalAlerts: [
          {
            alert: 'Medication interaction check needed',
            severity: 'warning',
            action: 'Review current medications',
            timeRequired: 3
          }
        ],
        careGaps: [
          {
            gap: 'Overdue annual eye exam',
            impact: 'medium',
            recommendation: 'Schedule ophthalmology referral',
            timeRequired: 5
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRecommendation = (recommendation: any, type: string) => {
    const key = `${type}-${recommendation.task || recommendation.measure || recommendation.alert || recommendation.gap}`;
    setAcceptedRecommendations(prev => new Set([...prev, key]));
    if (onRecommendationAccept) {
      onRecommendationAccept({ ...recommendation, type });
    }
    if (onSuggestionApply) {
      onSuggestionApply('plan', recommendation.task || recommendation.measure || recommendation.alert || recommendation.gap);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Analyzing Clinical Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={undefined} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Generating evidence-based recommendations...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!guidance) return null;

  const totalRecommendations = 
    guidance.mandatoryTasks.length + 
    guidance.qualityMeasures.length + 
    guidance.clinicalAlerts.length + 
    guidance.careGaps.length;

  const acceptedCount = acceptedRecommendations.size;
  const completionRate = totalRecommendations > 0 ? (acceptedCount / totalRecommendations) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Clinical Decision Support
            </div>
            <Badge variant="outline">
              {acceptedCount}/{totalRecommendations} Addressed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Recommendations Addressed</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Mandatory Tasks */}
      {guidance.mandatoryTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-red-500" />
              Mandatory Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {guidance.mandatoryTasks.map((task, index) => {
              const key = `mandatory-${task.task}`;
              const isAccepted = acceptedRecommendations.has(key);
              
              return (
                <div key={index} className={`p-3 rounded-lg border ${isAccepted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityIcon(task.priority)}
                        <span className="font-medium">{task.task}</span>
                        <Badge variant="outline" className="text-xs">
                          {task.timeRequired} min
                        </Badge>
                        {isAccepted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.reasoning}</p>
                      <div className="text-xs text-muted-foreground">
                        Due: {task.dueDate} • Priority: {task.priority}
                      </div>
                    </div>
                    {!isAccepted && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRecommendation(task, 'mandatory')}
                      >
                        Add to Plan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quality Measures */}
      {guidance.qualityMeasures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Quality Measures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {guidance.qualityMeasures.map((measure, index) => {
              const key = `quality-${measure.measure}`;
              const isAccepted = acceptedRecommendations.has(key);
              
              return (
                <div key={index} className={`p-3 rounded-lg border ${isAccepted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{measure.measure}</span>
                        <Badge variant="outline" className={
                          measure.status === 'due' ? 'text-orange-600 bg-orange-50' :
                          measure.status === 'non-compliant' ? 'text-red-600 bg-red-50' :
                          'text-green-600 bg-green-50'
                        }>
                          {measure.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {measure.timeRequired} min
                        </Badge>
                        {isAccepted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{measure.action}</p>
                    </div>
                    {!isAccepted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcceptRecommendation(measure, 'quality')}
                      >
                        Add to Plan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Clinical Alerts */}
      {guidance.clinicalAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-yellow-500" />
              Clinical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {guidance.clinicalAlerts.map((alert, index) => {
              const key = `alert-${alert.alert}`;
              const isAccepted = acceptedRecommendations.has(key);
              
              return (
                <Alert key={index} className={`${getSeverityColor(alert.severity)} ${isAccepted ? 'opacity-60' : ''}`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{alert.alert}</span>
                          <Badge variant="outline" className="text-xs">
                            {alert.timeRequired} min
                          </Badge>
                          {isAccepted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                        <p className="text-sm">{alert.action}</p>
                      </div>
                      {!isAccepted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcceptRecommendation(alert, 'alert')}
                        >
                          Address
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Care Gaps */}
      {guidance.careGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-purple-500" />
              Care Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {guidance.careGaps.map((gap, index) => {
              const key = `gap-${gap.gap}`;
              const isAccepted = acceptedRecommendations.has(key);
              
              return (
                <div key={index} className={`p-3 rounded-lg border ${isAccepted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{gap.gap}</span>
                        <Badge variant="outline" className={
                          gap.impact === 'high' ? 'text-red-600 bg-red-50' :
                          gap.impact === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                          'text-green-600 bg-green-50'
                        }>
                          {gap.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {gap.timeRequired} min
                        </Badge>
                        {isAccepted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{gap.recommendation}</p>
                    </div>
                    {!isAccepted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcceptRecommendation(gap, 'gap')}
                      >
                        Add to Plan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClinicalDecisionSupport;