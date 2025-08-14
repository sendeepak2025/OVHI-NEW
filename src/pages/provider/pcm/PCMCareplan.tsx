import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Target,
  Calendar,
  Activity,
  Pill,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { PCMProgressReport } from "./PCMProgressReport";

interface Patient {
  id: number;
  name: string;
  condition: string;
  riskLevel: string;
  careGoals: string[];
  medications: string[];
}

interface PCMCareplanProps {
  patient: Patient;
}

const careplanItems = {
  "Severe Hypertension": {
    medications: [
      {
        name: "Lisinopril",
        dosage: "20mg",
        frequency: "Once daily",
        adherence: 95,
        status: "optimal",
      },
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily",
        adherence: 88,
        status: "good",
      },
    ],
    monitoring: [
      {
        task: "Blood pressure check",
        frequency: "Daily",
        completed: 6,
        target: 7,
        period: "week",
      },
      {
        task: "Weight monitoring",
        frequency: "Weekly",
        completed: 3,
        target: 4,
        period: "month",
      },
      {
        task: "Symptom tracking",
        frequency: "Daily",
        completed: 5,
        target: 7,
        period: "week",
      },
    ],
    lifestyle: [
      {
        goal: "Reduce sodium intake",
        target: "<2300mg/day",
        progress: 75,
        status: "improving",
      },
      {
        goal: "Regular exercise",
        target: "150min/week",
        progress: 60,
        status: "needs_improvement",
      },
      {
        goal: "Weight reduction",
        target: "Lose 10 lbs",
        progress: 40,
        status: "on_track",
      },
    ],
    appointments: [
      { type: "Follow-up visit", date: "Next week", status: "scheduled" },
      { type: "Lab work", date: "2 weeks", status: "pending" },
      { type: "Cardiology consult", date: "1 month", status: "recommended" },
    ],
  },
  "Advanced Diabetes Type 2": {
    medications: [
      {
        name: "Metformin",
        dosage: "1000mg",
        frequency: "Twice daily",
        adherence: 92,
        status: "optimal",
      },
      {
        name: "Insulin Glargine",
        dosage: "25 units",
        frequency: "Bedtime",
        adherence: 85,
        status: "good",
      },
    ],
    monitoring: [
      {
        task: "Blood glucose check",
        frequency: "4x daily",
        completed: 25,
        target: 28,
        period: "week",
      },
      {
        task: "A1C tracking",
        frequency: "Quarterly",
        completed: 1,
        target: 1,
        period: "quarter",
      },
      {
        task: "Foot examination",
        frequency: "Daily",
        completed: 6,
        target: 7,
        period: "week",
      },
    ],
    lifestyle: [
      {
        goal: "Carbohydrate counting",
        target: "45-60g per meal",
        progress: 80,
        status: "good",
      },
      {
        goal: "Physical activity",
        target: "30min/day",
        progress: 55,
        status: "needs_improvement",
      },
      {
        goal: "Weight management",
        target: "Lose 15 lbs",
        progress: 35,
        status: "on_track",
      },
    ],
    appointments: [
      { type: "Endocrinology follow-up", date: "2 weeks", status: "scheduled" },
      { type: "Eye exam", date: "3 months", status: "due" },
      { type: "Nutrition counseling", date: "1 month", status: "recommended" },
    ],
  },
};

export const PCMCareplan = ({ patient }: PCMCareplanProps) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("medications");
  const [showProgressReport, setShowProgressReport] = useState(false);

  const careplan =
    careplanItems[patient.condition as keyof typeof careplanItems];

  const handleUpdateGoal = (goal: string) => {
    toast({
      title: "Goal Updated",
      description: `Care plan goal "${goal}" has been updated.`,
    });
  };

  const handleGenerateReport = () => {
    setShowProgressReport(true);
    toast({
      title: "Progress Report Generated",
      description: "Comprehensive PCM progress report has been generated.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
      case "good":
      case "completed":
      case "scheduled":
        return "default";
      case "improving":
      case "on_track":
        return "secondary";
      case "needs_improvement":
      case "pending":
      case "due":
        return "destructive";
      case "recommended":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!careplan) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground">
            Care plan not available for this condition.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PCM Care Plan: {patient.name}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{patient.condition}</Badge>
            <Badge
              variant={
                patient.riskLevel === "high" ? "destructive" : "secondary"
              }
            >
              {patient.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2">
              {["medications", "monitoring", "lifestyle", "appointments"].map(
                (section) => (
                  <Button
                    key={section}
                    variant={activeSection === section ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSection(section)}
                  >
                    {section === "medications" && (
                      <Pill className="h-4 w-4 mr-2" />
                    )}
                    {section === "monitoring" && (
                      <Activity className="h-4 w-4 mr-2" />
                    )}
                    {section === "lifestyle" && (
                      <Target className="h-4 w-4 mr-2" />
                    )}
                    {section === "appointments" && (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </Button>
                )
              )}
            </div>

            {/* Medications Section */}
            {activeSection === "medications" && (
              <div className="space-y-4">
                <h3 className="font-semibold">Medication Management</h3>
                {careplan.medications.map((med, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          {med.name} {med.dosage}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {med.frequency}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(med.status)}>
                        {med.adherence}% adherence
                      </Badge>
                    </div>
                    <Progress value={med.adherence} className="h-2" />
                  </Card>
                ))}
              </div>
            )}

            {/* Monitoring Section */}
            {activeSection === "monitoring" && (
              <div className="space-y-4">
                <h3 className="font-semibold">Monitoring Tasks</h3>
                {careplan.monitoring.map((task, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium">{task.task}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.frequency}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {task.completed}/{task.target} this {task.period}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((task.completed / task.target) * 100)}%
                          complete
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={(task.completed / task.target) * 100}
                      className="h-2"
                    />
                  </Card>
                ))}
              </div>
            )}

            {/* Lifestyle Section */}
            {activeSection === "lifestyle" && (
              <div className="space-y-4">
                <h3 className="font-semibold">Lifestyle Goals</h3>
                {careplan.lifestyle.map((goal, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{goal.goal}</h4>
                        <p className="text-sm text-muted-foreground">
                          Target: {goal.target}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(goal.status)}>
                          {goal.status.replace("_", " ")}
                        </Badge>
                        <span className="text-sm font-medium">
                          {goal.progress}%
                        </span>
                      </div>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleUpdateGoal(goal.goal)}
                    >
                      Update Progress
                    </Button>
                  </Card>
                ))}
              </div>
            )}

            {/* Appointments Section */}
            {activeSection === "appointments" && (
              <div className="space-y-4">
                <h3 className="font-semibold">Upcoming Care Activities</h3>
                {careplan.appointments.map((appointment, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{appointment.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.date}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Summary Actions */}
            <div className="border-t pt-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleGenerateReport}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Progress Report
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Update Care Plan
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Report Modal */}
      {showProgressReport && (
        <PCMProgressReport
          patient={patient}
          onClose={() => setShowProgressReport(false)}
        />
      )}
    </>
  );
};
