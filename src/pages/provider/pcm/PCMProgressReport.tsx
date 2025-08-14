import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, FileText, Calendar, Activity, Target, Pill, AlertTriangle, CheckCircle, Download, Printer } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  condition: string;
  riskLevel: string;
  careGoals: string[];
  medications: string[];
}

interface PCMProgressReportProps {
  patient: Patient;
  onClose: () => void;
}

export const PCMProgressReport = ({ patient, onClose }: PCMProgressReportProps) => {
  const { toast } = useToast();
  const currentDate = new Date().toLocaleDateString();

  const getReportData = () => {
    if (patient.condition.includes("Hypertension")) {
      return {
        vitalTrends: [
          { metric: "Blood Pressure", current: "142/95", target: "130/80", trend: "improving", change: "-8/-3 mmHg" },
          { metric: "Weight", current: "185 lbs", target: "175 lbs", trend: "stable", change: "-2 lbs" },
          { metric: "Heart Rate", current: "78 bpm", target: "60-80 bpm", trend: "stable", change: "±2 bpm" }
        ],
        medicationAdherence: 91,
        lifestyleGoals: [
          { goal: "Reduce sodium intake", progress: 75, status: "improving" },
          { goal: "Regular exercise", progress: 60, status: "needs_improvement" },
          { goal: "Weight reduction", progress: 40, status: "on_track" }
        ],
        riskFactors: [
          { factor: "Hypertension control", level: "moderate", improving: true },
          { factor: "Cardiovascular risk", level: "elevated", improving: true },
          { factor: "Medication adherence", level: "good", improving: false }
        ],
        recommendations: [
          "Continue current medication regimen with excellent adherence",
          "Increase physical activity to 150 minutes per week",
          "Consider dietitian consultation for sodium reduction",
          "Schedule cardiology follow-up in 4 weeks"
        ]
      };
    } else {
      return {
        vitalTrends: [
          { metric: "HbA1c", current: "8.2%", target: "7.0%", trend: "improving", change: "-0.3%" },
          { metric: "Fasting Glucose", current: "145 mg/dL", target: "80-130 mg/dL", trend: "stable", change: "-15 mg/dL" },
          { metric: "Weight", current: "195 lbs", target: "180 lbs", trend: "improving", change: "-5 lbs" }
        ],
        medicationAdherence: 87,
        lifestyleGoals: [
          { goal: "Carbohydrate counting", progress: 80, status: "good" },
          { goal: "Physical activity", progress: 55, status: "needs_improvement" },
          { goal: "Weight management", progress: 35, status: "on_track" }
        ],
        riskFactors: [
          { factor: "Glycemic control", level: "suboptimal", improving: true },
          { factor: "Diabetic complications", level: "low", improving: false },
          { factor: "Lifestyle compliance", level: "moderate", improving: true }
        ],
        recommendations: [
          "Adjust insulin dosing based on glucose patterns",
          "Increase physical activity gradually",
          "Schedule nutrition counseling session",
          "Eye exam due within 3 months"
        ]
      };
    }
  };

  const reportData = getReportData();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": 
      case "improving": 
      case "on_track": return "default";
      case "needs_improvement": 
      case "moderate": return "secondary";
      case "poor": 
      case "elevated": 
      case "suboptimal": return "destructive";
      default: return "outline";
    }
  };

  const handleDownload = () => {
    // Create a new window for printing/PDF generation
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      // Get the report content
      const reportContent = document.querySelector('.pcm-report-content');
      
      if (reportContent) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>PCM Progress Report - ${patient.name}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  color: #000;
                  background: white;
                }
                .report-header {
                  text-align: center;
                  border-bottom: 2px solid #000;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .patient-info {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 20px;
                  margin-bottom: 30px;
                  padding: 15px;
                  background: #f5f5f5;
                  border-radius: 8px;
                }
                .section {
                  margin-bottom: 30px;
                }
                .section-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 15px;
                  color: #333;
                }
                .vital-card, .goal-card, .risk-card {
                  border: 1px solid #ddd;
                  padding: 15px;
                  margin-bottom: 10px;
                  border-radius: 5px;
                  background: white;
                }
                .progress-bar {
                  width: 100%;
                  height: 8px;
                  background: #e0e0e0;
                  border-radius: 4px;
                  margin: 8px 0;
                }
                .progress-fill {
                  height: 100%;
                  background: #4CAF50;
                  border-radius: 4px;
                }
                .recommendations ul {
                  list-style-type: disc;
                  padding-left: 20px;
                }
                .footer {
                  margin-top: 40px;
                  text-align: center;
                  font-size: 12px;
                  color: #666;
                  border-top: 1px solid #ddd;
                  padding-top: 20px;
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="report-header">
                <h1>PCM Progress Report</h1>
                <p>Generated on ${currentDate} for ${patient.name}</p>
              </div>
              
              <div class="patient-info">
                <div><strong>Patient:</strong> ${patient.name}</div>
                <div><strong>Condition:</strong> ${patient.condition}</div>
                <div><strong>Risk Level:</strong> ${patient.riskLevel.toUpperCase()}</div>
              </div>

              <div class="section">
                <h2 class="section-title">Vital Signs & Trends</h2>
                ${reportData.vitalTrends.map(vital => `
                  <div class="vital-card">
                    <h3>${vital.metric}</h3>
                    <p><strong>Current:</strong> ${vital.current}</p>
                    <p><strong>Target:</strong> ${vital.target}</p>
                    <p><strong>Change:</strong> ${vital.change}</p>
                  </div>
                `).join('')}
              </div>

              <div class="section">
                <h2 class="section-title">Medication Adherence</h2>
                <div class="vital-card">
                  <p><strong>Overall Adherence Rate:</strong> ${reportData.medicationAdherence}%</p>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${reportData.medicationAdherence}%"></div>
                  </div>
                  <p>${reportData.medicationAdherence >= 90 ? "Excellent adherence" : 
                        reportData.medicationAdherence >= 80 ? "Good adherence" : "Needs improvement"}</p>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">Lifestyle Goals Progress</h2>
                ${reportData.lifestyleGoals.map(goal => `
                  <div class="goal-card">
                    <h3>${goal.goal}</h3>
                    <p><strong>Progress:</strong> ${goal.progress}% - ${goal.status.replace("_", " ")}</p>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="section">
                <h2 class="section-title">Risk Factor Analysis</h2>
                ${reportData.riskFactors.map(risk => `
                  <div class="risk-card">
                    <h3>${risk.factor}</h3>
                    <p><strong>Level:</strong> ${risk.level.toUpperCase()}</p>
                    <p><strong>Status:</strong> ${risk.improving ? "Improving" : "Stable"}</p>
                  </div>
                `).join('')}
              </div>

              <div class="section recommendations">
                <h2 class="section-title">Clinical Recommendations</h2>
                <ul>
                  ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              </div>

              <div class="footer">
                <p>This report was generated automatically by the PCM system on ${currentDate}</p>
                <p>Report ID: PCM-${patient.id}-${Date.now()}</p>
              </div>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        
        // Trigger print dialog which allows saving as PDF
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
        
        toast({
          title: "PDF Download Started",
          description: "Use the print dialog to save as PDF.",
        });
      }
    } else {
      toast({
        title: "Download Failed",
        description: "Unable to open print dialog. Please check popup blockers.",
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Report Printed",
      description: "PCM progress report has been sent to printer.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="print:hidden">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PCM Progress Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generated on {currentDate} for {patient.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pcm-report-content">
          {/* Patient Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Patient</h3>
              <p className="font-semibold">{patient.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Condition</h3>
              <p className="font-semibold">{patient.condition}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Risk Level</h3>
              <Badge variant={getStatusColor(patient.riskLevel)}>
                {patient.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Vital Signs Trends */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs & Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.vitalTrends.map((vital, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{vital.metric}</h4>
                    {getTrendIcon(vital.trend)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Current:</span>
                      <span className="font-medium">{vital.current}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target:</span>
                      <span className="text-muted-foreground">{vital.target}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Change:</span>
                      <span className={vital.trend === "improving" ? "text-green-600" : "text-blue-600"}>
                        {vital.change}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Medication Adherence */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medication Adherence
            </h3>
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Overall Adherence Rate</span>
                <span className="text-2xl font-bold text-green-600">{reportData.medicationAdherence}%</span>
              </div>
              <Progress value={reportData.medicationAdherence} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {reportData.medicationAdherence >= 90 ? "Excellent adherence" : 
                 reportData.medicationAdherence >= 80 ? "Good adherence" : "Needs improvement"}
              </p>
            </Card>
          </div>

          {/* Lifestyle Goals Progress */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Lifestyle Goals Progress
            </h3>
            <div className="space-y-3">
              {reportData.lifestyleGoals.map((goal, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{goal.goal}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(goal.status)}>
                        {goal.status.replace("_", " ")}
                      </Badge>
                      <span className="font-bold">{goal.progress}%</span>
                    </div>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </Card>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Factor Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.riskFactors.map((risk, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{risk.factor}</h4>
                    {risk.improving ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    }
                  </div>
                  <Badge variant={getStatusColor(risk.level)} className="text-xs">
                    {risk.level.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {risk.improving ? "Improving" : "Stable"}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Clinical Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Clinical Recommendations
            </h3>
            <Card className="p-4">
              <ul className="space-y-2">
                {reportData.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Report Footer */}
          <div className="border-t pt-4 text-center text-sm text-muted-foreground">
            <p>This report was generated automatically by the PCM system on {currentDate}</p>
            <p>Report ID: PCM-{patient.id}-{Date.now()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
