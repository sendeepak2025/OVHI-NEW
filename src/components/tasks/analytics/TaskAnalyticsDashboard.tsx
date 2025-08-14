import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  PieChart,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { getTaskByPatientID } from "@/services/operations/task";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface TaskAnalyticsData {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  avg_completion_time: number;
  compliance_rate: number;
}

interface TaskAnalyticsDashboardProps {
  patientId: string;
  onRefresh?: () => void;
}

const TaskAnalyticsDashboard: React.FC<TaskAnalyticsDashboardProps> = ({
  patientId,
  onRefresh,
}) => {
  const [analytics, setAnalytics] = useState<TaskAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await getTaskByPatientID(id, token);

      const tasks = response?.task_id || [];

      const total_tasks = tasks.length;
      const completed_tasks = tasks.filter(
        (task: any) => task.status === "completed"
      ).length;

      const overdue_tasks = tasks.filter((task: any) => {
        const dueDate = new Date(task.due_date);
        return task.status !== "completed" && dueDate < new Date();
      }).length;

      const completedDurations = tasks
        .filter(
          (task: any) => task.status === "completed" && task.actual_duration
        )
        .map((task: any) => Number(task.actual_duration));

      const avg_completion_time =
        completedDurations.length > 0
          ? completedDurations.reduce((a, b) => a + b, 0) /
            completedDurations.length
          : 0;

      const compliance_rate =
        total_tasks > 0 ? (completed_tasks / total_tasks) * 100 : 0;

      setAnalytics({
        total_tasks,
        completed_tasks,
        overdue_tasks,
        avg_completion_time,
        compliance_rate,
      });
    } catch (error) {
      console.error("Failed to fetch task analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 bg-green-50";
    if (rate >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Task Analytics
          </CardTitle>
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

  if (!analytics) return null;

  const completionRate =
    (analytics.completed_tasks / analytics.total_tasks) * 100;
  const pendingTasks = analytics.total_tasks - analytics.completed_tasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Analytics</h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_tasks}</div>
            <p className="text-xs text-muted-foreground">All assigned tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.completed_tasks}
            </div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              {analytics.overdue_tasks}
              {analytics.overdue_tasks > 0 && (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks} pending total
            </p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              {analytics.avg_completion_time.toFixed(1)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average time per task
            </p>
          </CardContent>
        </Card> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Compliance Overview
          </CardTitle>
          <CardDescription>Task completion and quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compliance Rate</span>
              <Badge className={getComplianceColor(analytics.compliance_rate)}>
                {analytics.compliance_rate.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={analytics.compliance_rate} className="h-2" />

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {analytics.completed_tasks}
                </div>
                <div className="text-xs text-green-700">Completed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {analytics.overdue_tasks}
                </div>
                <div className="text-xs text-red-700">Overdue</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskAnalyticsDashboard;
