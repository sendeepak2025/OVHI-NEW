import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getTaskByPatientID } from "@/services/operations/task";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useParams } from "react-router-dom";

interface Task {
  id: number;
  patient_id: number;
  created_by: number;
  created: string;
  modified: string | null;
  status: string;
  assigned_to: number | null;
  task_description: string;
  task_title: string;
  priority: string;
  due_date: string;
  type: string;
  duration: string; // This is in seconds as a string
  frequency: number;
  frequency_type: string;
  task_notes: string | null;
  estimated_duration: number; // This is in minutes
  actual_duration: number | null; // This is in minutes
  auto_generated: number;
  condition_based: number;
  required_conditions: string | null;
  ai_confidence_score: number | null;
  program_type: string | null;
  cpt_code: string | null;
  billing_minutes: number | null;
}

interface ComplianceData {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  avg_completion_time: number; // in seconds
  compliance_rate: number;
}

interface QualityMetrics {
  avg_estimated_time: number; // in minutes
  avg_actual_time: number; // in seconds (converted from duration)
  over_time_tasks: number;
  under_time_tasks: number;
}

interface ComplianceReportViewerProps {
  patientId: string;
}

// Utility function to format time
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

// Convert seconds to minutes for comparison
const secondsToMinutes = (seconds: number): number => seconds / 60;

const ComplianceReportViewer: React.FC<ComplianceReportViewerProps> = ({
  patientId,
}) => {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(
    null
  );
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const fetchComplianceReport = async () => {
    setLoading(true);
    try {
      const response = await getTaskByPatientID(id, token);
      const tasks = response?.task_id || [];

      const total_tasks = tasks.length;
      const completed_tasks = tasks.filter(
        (task) => task.status === "completed"
      ).length;

      const currentDate = new Date();
      const overdue_tasks = tasks.filter(
        (task) =>
          task.status !== "completed" && new Date(task.due_date) < currentDate
      ).length;

      // Convert duration from string seconds to number seconds
      const actualDurationsInSeconds = tasks
        .filter((task) => task.duration != null && task.duration !== "")
        .map((task) => Number(task.duration));

      const avg_actual_time_seconds =
        actualDurationsInSeconds.length > 0
          ? actualDurationsInSeconds.reduce((a, b) => a + b, 0) /
            actualDurationsInSeconds.length
          : 0;

      // Estimated duration is in minutes
      const estimatedDurations = tasks
        .filter((task) => task.estimated_duration != null)
        .map((task) => task.estimated_duration);

      const avg_estimated_time =
        estimatedDurations.length > 0
          ? estimatedDurations.reduce((a, b) => a + b, 0) /
            estimatedDurations.length
          : 0;

      // For comparison, convert actual duration (seconds) to minutes
      const over_time_tasks = tasks.filter((task) => {
        if (task.duration == null || task.estimated_duration == null)
          return false;
        const actualMinutes = secondsToMinutes(Number(task.duration));
        return actualMinutes > task.estimated_duration;
      }).length;

      const under_time_tasks = tasks.filter((task) => {
        if (task.duration == null || task.estimated_duration == null)
          return false;
        const actualMinutes = secondsToMinutes(Number(task.duration));
        return actualMinutes < task.estimated_duration;
      }).length;

      const compliance_rate =
        total_tasks > 0
          ? Number.parseFloat(
              ((completed_tasks / total_tasks) * 100).toFixed(1)
            )
          : 0;

      setComplianceData({
        total_tasks,
        completed_tasks,
        overdue_tasks,
        avg_completion_time: avg_actual_time_seconds, // Keep in seconds
        compliance_rate,
      });

      setQualityMetrics({
        avg_estimated_time, // in minutes
        avg_actual_time: avg_actual_time_seconds, // in seconds
        over_time_tasks,
        under_time_tasks,
      });
    } catch (error) {
      console.error("Failed to fetch compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceReport();
  }, [patientId]);

  const getComplianceStatus = (rate: number) => {
    if (rate >= 80)
      return {
        status: "Excellent",
        color: "text-green-600",
        icon: CheckCircle,
      };
    if (rate >= 60)
      return { status: "Good", color: "text-yellow-600", icon: Clock };
    return {
      status: "Needs Improvement",
      color: "text-red-600",
      icon: AlertTriangle,
    };
  };

  const calculateAccuracy = () => {
    if (!qualityMetrics) return 0;
    const total =
      qualityMetrics.over_time_tasks + qualityMetrics.under_time_tasks;
    if (total === 0) return 100;
    return ((qualityMetrics.under_time_tasks / total) * 100).toFixed(1);
  };

  const exportReport = () => {
    console.log("Exporting compliance report...");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Compliance Report...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!complianceData || !qualityMetrics) return null;

  const complianceStatus = getComplianceStatus(complianceData.compliance_rate);
  const StatusIcon = complianceStatus.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Report</h2>
          <p className="text-muted-foreground">
            Task completion and quality analysis
          </p>
        </div>
        <Button onClick={exportReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={`h-5 w-5 ${complianceStatus.color}`} />
              <span className="text-2xl font-bold">
                {complianceData.compliance_rate.toFixed(1)}%
              </span>
            </div>
            <Progress value={complianceData.compliance_rate} className="mb-2" />
            <Badge className={"text-black"}>{complianceStatus.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Task Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {complianceData.completed_tasks}/{complianceData.total_tasks}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Completed</span>
                <span>{complianceData.completed_tasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Overdue</span>
                <span>{complianceData.overdue_tasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {complianceData.compliance_rate.toFixed(1)}%
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Avg. Time</span>
                <span>{(qualityMetrics.avg_actual_time)}m</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>
                Task completion statistics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceData.total_tasks}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Tasks
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {complianceData.completed_tasks}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {complianceData.overdue_tasks}
                  </div>
                  <div className="text-xs text-muted-foreground">Overdue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(complianceData.avg_completion_time)}m
                  </div>
                  <div className="text-xs text-muted-foreground">Avg. Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>
                Time estimation accuracy and task quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Time Estimation Accuracy
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {calculateAccuracy()}%
                    </span>
                  </div>
                  <Progress value={Number(calculateAccuracy())} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {qualityMetrics.over_time_tasks}
                    </div>
                    <div className="text-sm text-orange-700">Over Time</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {qualityMetrics.under_time_tasks}
                    </div>
                    <div className="text-sm text-green-700">Under Time</div>
                  </div>
                </div>

                {/* <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Time Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Estimated Time:</span>
                      <span className="font-medium">
                        {qualityMetrics.avg_estimated_time.toFixed(1)} minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Actual Time:</span>
                      <span className="font-medium">
                        {(qualityMetrics.avg_actual_time)}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Variance:</span>
                      <span
                        className={`font-medium ${
                          secondsToMinutes(qualityMetrics.avg_actual_time) >
                          qualityMetrics.avg_estimated_time
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {secondsToMinutes(qualityMetrics.avg_actual_time) -
                          qualityMetrics.avg_estimated_time >
                        0
                          ? "+"
                          : ""}
                        {(
                          secondsToMinutes(qualityMetrics.avg_actual_time) -
                          qualityMetrics.avg_estimated_time
                        ).toFixed(1)}{" "}
                        minutes
                      </span>
                    </div>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.compliance_rate < 80 && (
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-yellow-700">
                      Improve Task Completion Rate
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Current compliance rate is{" "}
                      {complianceData.compliance_rate.toFixed(1)}%. Consider
                      setting up automated reminders or breaking down complex
                      tasks.
                    </p>
                  </div>
                )}

                {complianceData.overdue_tasks > 3 && (
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-700">
                      Address Overdue Tasks
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You have {complianceData.overdue_tasks} overdue tasks.
                      Prioritize these tasks and consider adjusting deadlines.
                    </p>
                  </div>
                )}

                {secondsToMinutes(qualityMetrics.avg_actual_time) >
                  qualityMetrics.avg_estimated_time + 5 && (
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-orange-700">
                      Improve Time Estimation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Tasks are taking longer than estimated. Review time
                      estimates and consider additional training or resources.
                    </p>
                  </div>
                )}

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700">Strengths</h4>
                  <p className="text-sm text-muted-foreground">
                    {complianceData.completed_tasks} tasks completed
                    successfully. Continue maintaining good documentation
                    practices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceReportViewer;
