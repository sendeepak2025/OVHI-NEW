

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Heart,
  Brain,
  Activity,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
  FileText,
  Calendar,
  User,
  Shield,
  TrendingUp,
  Clock,
  Link,
  Timer,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getSinglePatientAPI } from "@/services/operations/patient";
import jsPDF from "jspdf";
import { sendPdfToBackendApi } from "@/services/operations/pdf";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { getPdfAPI } from "@/services/operations/settings";
import { generateProfessionalPDF } from "@/lib/pdf-pcm-generator";

interface Patient {
  id: number;
  firstName: string;
  condition: string;
  currentBP?: string;
  currentA1C?: string;
  medications: string[];
  age?: number;
  gender?: string;
}

interface AIAssessmentResponse {
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  riskScore: number;
  riskFactors: string[];
  riskAssessment: string;
  careRecommendations: string;
  immediateActions: string;
  followUpPlan: string;
  urgentConcerns: string;
  clinicalSummary: string;
}

const assessmentQuestions = [
  {
    category: "Symptom Assessment",
    icon: Stethoscope,
    color: "bg-blue-50 border-blue-200",
    questions: [
      "Rate your overall energy level (1-10, where 1=extremely low, 10=excellent)",
      "Any new or worsening symptoms in the past week?",
      "Current pain level assessment (0-10, where 0=no pain, 10=severe pain)",
      "Sleep quality evaluation (hours per night and quality)",
      "Any episodes of dizziness, shortness of breath, or chest discomfort?",
    ],
  },
  {
    category: "Vital Signs & Physical Health",
    icon: Heart,
    color: "bg-red-50 border-red-200",
    questions: [
      "Recent blood pressure readings (if available)",
      "Weight changes in the past month (gained/lost/stable)",
      "Heart rate irregularities or palpitations",
      "Any swelling in legs, ankles, or feet?",
      "Recent lab results or glucose readings (if applicable)",
    ],
  },
  {
    category: "Medication & Treatment Adherence",
    icon: Activity,
    color: "bg-green-50 border-green-200",
    questions: [
      "Missed medication doses in the past week (how many?)",
      "Any side effects from current medications?",
      "Medication timing compliance (taking at prescribed times)",
      "Pharmacy refill status and medication availability",
      "Any changes to medication regimen by other providers?",
    ],
  },
  {
    category: "Lifestyle & Psychosocial Factors",
    icon: Brain,
    color: "bg-purple-50 border-purple-200",
    questions: [
      "Exercise activity level (frequency and type)",
      "Dietary compliance and eating patterns",
      "Stress level evaluation (1-10 scale)",
      "Social support adequacy and family involvement",
      "Any financial barriers to care or medications?",
    ],
  },
];

// Enhanced AI assessment with risk calculation
const generateEnhancedAIAssessment = async (
  patient: Patient,
  assessmentData: Record<string, string>
): Promise<AIAssessmentResponse> => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_KEY;
  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API key not found, using mock assessment");
    return generateMockAssessment(patient, assessmentData);
  }

  const formattedAssessment = assessmentQuestions
    .map((category, categoryIndex) => {
      const categoryResponses = category.questions
        .map((question, questionIndex) => {
          const response =
            assessmentData[`${categoryIndex}-${questionIndex}`] ||
            "Not provided";
          return `  ${question}: ${response}`;
        })
        .join("\n");
      return `${category.category}:\n${categoryResponses}`;
    })
    .join("\n\n");

  const prompt = `You are a healthcare AI assistant conducting a comprehensive Patient Care Management (PCM) assessment. Analyze the patient data and assessment responses to provide a detailed clinical evaluation with risk stratification.

Patient Information:
- Name: ${patient.firstName}
- Primary Condition: ${patient.condition}
- Current Medications: ${patient.medications?.join(", ") || "Not specified"}
- Current BP: ${patient.currentBP || "Not recorded"}
- Current A1C: ${patient.currentA1C || "Not recorded"}
- Age: ${patient.age || "Not specified"}
- Gender: ${patient.gender || "Not specified"}

Assessment Responses:
${formattedAssessment}

Please provide your assessment in exactly this format:

RISK LEVEL: [LOW/MODERATE/HIGH/CRITICAL]
RISK SCORE: [Numerical score 0-100]
RISK FACTORS: [List specific risk factors identified, separated by semicolons]
CLINICAL SUMMARY: [Brief 2-3 sentence clinical overview of patient's current status]
RISK ASSESSMENT: [Detailed analysis of risk level based on symptoms, vital signs, medication adherence, and lifestyle factors]
CARE RECOMMENDATIONS: [Specific, evidence-based care recommendations including medication adjustments, lifestyle modifications, monitoring requirements]
IMMEDIATE ACTIONS: [Actions needed within 24-48 hours, prioritized by urgency]
FOLLOW-UP PLAN: [Structured follow-up schedule with specific timeframes and monitoring parameters]
URGENT CONCERNS: [Any responses indicating immediate medical attention needed, or "No immediate urgent concerns identified"]

Base the risk level on:
- LOW (0-25): Stable condition, good adherence, minimal symptoms
- MODERATE (26-50): Some concerning symptoms or adherence issues, requires monitoring
- HIGH (51-75): Multiple risk factors, significant symptoms, or poor adherence
- CRITICAL (76-100): Severe symptoms, multiple red flags, immediate intervention needed`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a qualified healthcare AI assistant specializing in patient care management and risk stratification. Provide evidence-based assessments while emphasizing that your recommendations supplement professional medical care.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "";

    // Parse the structured response
    const sections = text.split(
      /(?=RISK LEVEL:|RISK SCORE:|RISK FACTORS:|CLINICAL SUMMARY:|RISK ASSESSMENT:|CARE RECOMMENDATIONS:|IMMEDIATE ACTIONS:|FOLLOW-UP PLAN:|URGENT CONCERNS:)/
    );

    let riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "MODERATE";
    let riskScore = 50;
    let riskFactors: string[] = [];
    let clinicalSummary = "";
    let riskAssessment = "";
    let careRecommendations = "";
    let immediateActions = "";
    let followUpPlan = "";
    let urgentConcerns = "";

    sections.forEach((section) => {
      if (section.startsWith("RISK LEVEL:")) {
        const level = section.replace("RISK LEVEL:", "").trim();
        if (["LOW", "MODERATE", "HIGH", "CRITICAL"].includes(level)) {
          riskLevel = level as "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
        }
      } else if (section.startsWith("RISK SCORE:")) {
        const score = Number.parseInt(
          section.replace("RISK SCORE:", "").trim()
        );
        if (!isNaN(score)) riskScore = score;
      } else if (section.startsWith("RISK FACTORS:")) {
        const factors = section.replace("RISK FACTORS:", "").trim();
        riskFactors = factors
          .split(";")
          .map((f) => f.trim())
          .filter((f) => f);
      } else if (section.startsWith("CLINICAL SUMMARY:")) {
        clinicalSummary = section.replace("CLINICAL SUMMARY:", "").trim();
      } else if (section.startsWith("RISK ASSESSMENT:")) {
        riskAssessment = section.replace("RISK ASSESSMENT:", "").trim();
      } else if (section.startsWith("CARE RECOMMENDATIONS:")) {
        careRecommendations = section
          .replace("CARE RECOMMENDATIONS:", "")
          .trim();
      } else if (section.startsWith("IMMEDIATE ACTIONS:")) {
        immediateActions = section.replace("IMMEDIATE ACTIONS:", "").trim();
      } else if (section.startsWith("FOLLOW-UP PLAN:")) {
        followUpPlan = section.replace("FOLLOW-UP PLAN:", "").trim();
      } else if (section.startsWith("URGENT CONCERNS:")) {
        urgentConcerns = section.replace("URGENT CONCERNS:", "").trim();
      }
    });

    return {
      riskLevel,
      riskScore,
      riskFactors,
      clinicalSummary: clinicalSummary || "Clinical summary pending review.",
      riskAssessment: riskAssessment || "Risk assessment pending review.",
      careRecommendations:
        careRecommendations ||
        "Care recommendations will be provided after review.",
      immediateActions:
        immediateActions || "No immediate actions required at this time.",
      followUpPlan:
        followUpPlan ||
        "Follow-up plan will be determined based on assessment.",
      urgentConcerns:
        urgentConcerns || "No immediate urgent concerns identified.",
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    // Fallback to mock assessment
    return generateMockAssessment(patient, assessmentData);
  }
};

// Enhanced mock assessment with risk calculation
const generateMockAssessment = (
  patient: Patient,
  assessmentData: Record<string, string>
): AIAssessmentResponse => {
  // Analyze responses for risk factors
  const energyLevel = Number.parseInt(assessmentData["0-0"]) || 5;
  const painLevel = Number.parseInt(assessmentData["0-2"]) || 0;
  const symptoms = assessmentData["0-1"]?.toLowerCase() || "";
  const missedMeds = assessmentData["2-0"]?.toLowerCase() || "";
  const stressLevel = Number.parseInt(assessmentData["3-2"]) || 5;

  // Calculate risk score
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Energy level assessment
  if (energyLevel <= 3) {
    riskScore += 15;
    riskFactors.push("Low energy levels reported");
  }

  // Pain assessment
  if (painLevel >= 7) {
    riskScore += 20;
    riskFactors.push("High pain levels");
  }

  // New symptoms
  if (symptoms.includes("yes") || symptoms.includes("new")) {
    riskScore += 25;
    riskFactors.push("New or worsening symptoms");
  }

  // Medication adherence
  if (missedMeds.includes("yes") || missedMeds.includes("missed")) {
    riskScore += 20;
    riskFactors.push("Medication adherence issues");
  }

  // Stress level
  if (stressLevel >= 8) {
    riskScore += 10;
    riskFactors.push("High stress levels");
  }

  // Determine risk level
  let riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  if (riskScore <= 25) riskLevel = "LOW";
  else if (riskScore <= 50) riskLevel = "MODERATE";
  else if (riskScore <= 75) riskLevel = "HIGH";
  else riskLevel = "CRITICAL";

  return {
    riskLevel,
    riskScore,
    riskFactors,
    clinicalSummary: `${
      patient.firstName
    } presents with ${riskLevel.toLowerCase()} risk profile based on current assessment. Primary condition: ${
      patient.condition
    }. Overall risk score: ${riskScore}/100.`,
    riskAssessment: `Based on comprehensive assessment, ${
      patient.firstName
    } demonstrates a ${riskLevel.toLowerCase()} risk profile with a calculated risk score of ${riskScore}/100. Key contributing factors include: ${
      riskFactors.join(", ") || "stable clinical parameters"
    }.`,
    careRecommendations: `Personalized care plan for ${
      patient.firstName
    }:\n\n• Medication Management: ${
      missedMeds.includes("yes")
        ? "Implement adherence support strategies"
        : "Continue current regimen"
    }\n• Symptom Monitoring: ${
      symptoms.includes("new")
        ? "Close monitoring of new symptoms required"
        : "Routine monitoring adequate"
    }\n• Lifestyle Support: Focus on stress management and energy optimization\n• Follow-up Care: ${
      riskLevel === "HIGH" || riskLevel === "CRITICAL"
        ? "Frequent monitoring recommended"
        : "Standard follow-up schedule"
    }`,
    immediateActions:
      riskLevel === "CRITICAL"
        ? "• Contact healthcare provider within 24 hours\n• Monitor vital signs closely\n• Ensure medication compliance"
        : "• Continue current care plan\n• Monitor for any changes\n• Maintain medication schedule",
    followUpPlan: `• Next appointment: ${
      riskLevel === "HIGH" || riskLevel === "CRITICAL"
        ? "Within 1-2 weeks"
        : "Within 2-4 weeks"
    }\n• Monitoring frequency: ${
      riskLevel === "LOW" ? "Standard" : "Enhanced"
    }\n• Care coordination: ${
      riskLevel === "CRITICAL"
        ? "Immediate provider notification"
        : "Routine communication"
    }`,
    urgentConcerns:
      riskScore >= 75
        ? "⚠️ URGENT: High risk score identified. Recommend immediate clinical evaluation."
        : "No immediate urgent concerns identified based on current assessment.",
  };
};

// Enhanced PDF generation with professional healthcare design
const generateProfessionalPDF2 = (
  aiResponse: AIAssessmentResponse,
  patient: Patient,
  assessmentData: Record<string, string>,
  totalTime: string,
  pdfHeader: any
): { blob: Blob; fileName: string } => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 25;

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 25;
      return true;
    }
    return false;
  };

  // Header with logo placeholder and title
  doc.setFillColor(41, 128, 185); // Professional blue
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT CARE MANAGEMENT", margin, 20);
  doc.setFontSize(12);
  doc.text("Clinical Assessment Report", margin, 28);

  // Risk level badge
  const riskColors = {
    LOW: [46, 204, 113],
    MODERATE: [241, 196, 15],
    HIGH: [230, 126, 34],
    CRITICAL: [231, 76, 60],
  };
  const [r, g, b] = riskColors[aiResponse.riskLevel];
  doc.setFillColor(r, g, b);
  doc.roundedRect(pageWidth - 80, 8, 60, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`RISK: ${aiResponse.riskLevel}`, pageWidth - 75, 20);

  yPosition = 50;

  // Patient Information Section
  doc.setFillColor(248, 249, 250);
  doc.rect(margin, yPosition, maxWidth, 45, "F");
  doc.setDrawColor(220, 220, 220);
  doc.rect(margin, yPosition, maxWidth, 45);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT INFORMATION", margin + 5, yPosition + 10);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const patientInfo = [
    `Name: ${patient.firstName}`,
    `Condition: ${patient.condition}`,
    `Assessment Date: ${new Date().toLocaleDateString()}`,
    `Risk Score: ${aiResponse.riskScore}/100`,
    `Total Time: ${totalTime}`, // ✅ Added total time here
  ];

  patientInfo.forEach((info, index) => {
    const xPos = margin + 5 + (index % 2) * (maxWidth / 2);
    const yPos = yPosition + 20 + Math.floor(index / 2) * 8;
    doc.text(info, xPos, yPos);
  });

  yPosition += 55;

  // Clinical Summary
  checkNewPage(40);
  doc.setFillColor(52, 152, 219);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CLINICAL SUMMARY", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(
    aiResponse.clinicalSummary,
    maxWidth - 10
  );
  doc.text(summaryLines, margin + 5, yPosition);
  yPosition += summaryLines.length * 5 + 15;

  // Risk Assessment Section
  checkNewPage(50);
  doc.setFillColor(r, g, b);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RISK ASSESSMENT", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Risk factors
  if (aiResponse.riskFactors.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Identified Risk Factors:", margin + 5, yPosition);
    yPosition += 8;
    doc.setFont("helvetica", "normal");
    aiResponse.riskFactors.forEach((factor) => {
      doc.text(`• ${factor}`, margin + 10, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  const riskLines = doc.splitTextToSize(
    aiResponse.riskAssessment,
    maxWidth - 10
  );
  doc.text(riskLines, margin + 5, yPosition);
  yPosition += riskLines.length * 5 + 15;

  // Care Recommendations
  checkNewPage(50);
  doc.setFillColor(46, 204, 113);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CARE RECOMMENDATIONS", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const careLines = doc.splitTextToSize(
    aiResponse.careRecommendations,
    maxWidth - 10
  );
  doc.text(careLines, margin + 5, yPosition);
  yPosition += careLines.length * 5 + 15;

  // Immediate Actions
  checkNewPage(40);
  doc.setFillColor(155, 89, 182);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("IMMEDIATE ACTIONS", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const actionLines = doc.splitTextToSize(
    aiResponse.immediateActions,
    maxWidth - 10
  );
  doc.text(actionLines, margin + 5, yPosition);
  yPosition += actionLines.length * 5 + 15;

  // Follow-up Plan
  checkNewPage(40);
  doc.setFillColor(243, 156, 18);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("FOLLOW-UP PLAN", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const followUpLines = doc.splitTextToSize(
    aiResponse.followUpPlan,
    maxWidth - 10
  );
  doc.text(followUpLines, margin + 5, yPosition);
  yPosition += followUpLines.length * 5 + 15;

  // Urgent Concerns (if any)
  if (
    aiResponse.urgentConcerns &&
    !aiResponse.urgentConcerns.includes("No immediate urgent concerns")
  ) {
    checkNewPage(40);
    doc.setFillColor(231, 76, 60);
    doc.rect(margin, yPosition, maxWidth, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("⚠️ URGENT CONCERNS", margin + 5, yPosition + 6);

    yPosition += 15;
    doc.setTextColor(231, 76, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const urgentLines = doc.splitTextToSize(
      aiResponse.urgentConcerns,
      maxWidth - 10
    );
    doc.text(urgentLines, margin + 5, yPosition);
    yPosition += urgentLines.length * 5 + 15;
  }

  // Assessment Data Appendix
  doc.addPage();
  yPosition = 25;
  doc.setFillColor(52, 73, 94);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ASSESSMENT DATA SUMMARY", margin + 5, yPosition + 6);

  yPosition += 20;

  assessmentQuestions.forEach((category, categoryIndex) => {
    checkNewPage(60);
    doc.setFillColor(236, 240, 241);
    doc.rect(margin, yPosition, maxWidth, 6, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(category.category, margin + 5, yPosition + 4);
    yPosition += 12;

    category.questions.forEach((question, questionIndex) => {
      const response =
        assessmentData[`${categoryIndex}-${questionIndex}`] || "Not provided";
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 73, 94);
      const questionLines = doc.splitTextToSize(
        `Q: ${question}`,
        maxWidth - 10
      );
      doc.text(questionLines, margin + 5, yPosition);
      yPosition += questionLines.length * 4 + 2;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const responseLines = doc.splitTextToSize(
        `A: ${response}`,
        maxWidth - 10
      );
      doc.text(responseLines, margin + 5, yPosition);
      yPosition += responseLines.length * 4 + 8;

      checkNewPage(30);
    });

    yPosition += 5;
  });

  // Footer on all pages
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Footer background
    doc.setFillColor(248, 249, 250);
    doc.rect(0, pageHeight - 25, pageWidth, 25, "F");
    doc.setDrawColor(220, 220, 220);
    doc.line(0, pageHeight - 25, pageWidth, pageHeight - 25);

    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      margin,
      pageHeight - 15
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 15);
    doc.text(
      "This assessment supplements professional medical care - Not a substitute for clinical judgment",
      margin,
      pageHeight - 8
    );
  }

  // Generate blob and filename
  const fileName = `${patient.firstName}_PCM_Assessment_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  const pdfBlob = doc.output("blob");

  return { blob: pdfBlob, fileName };
};

export const PCMAssessment = () => {
  const { toast } = useToast();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [assessmentData, setAssessmentData] = useState<Record<string, string>>(
    {}
  );
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [isCompleted, setIsCompleted] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIAssessmentResponse | null>(
    null
  );
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);

  // ✅ Add timing states
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalTime, setTotalTime] = useState<string>("");

  const [now, setNow] = useState<Date>(new Date());

  // Update "now" every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  // ✅ Helper function to format time duration
  const formatDuration = (startTime: Date, endTime: Date): string => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);

    if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    }
    return `${diffSeconds}s`;
  };

  const handleDownloadPDF = async () => {
    if (!aiResponse || !patient) return;

    setUploadingPDF(true);

    try {
      // ✅ Fetch PDF header config with proper await
      let pdfHeader = null;
      try {
        const response = await getPdfAPI(user.id, token);
        pdfHeader = response?.data;
        // console.log("PDF Header Config:", pdfHeader);
      } catch (err) {
        console.error("❌ Failed to fetch PDF header config:", err);
      }
      let pdftype = "PCM";
      // ✅ Generate PDF with async header support
      const { blob, fileName } = await generateProfessionalPDF(
        aiResponse,
        patient,
        assessmentData,
        totalTime,
        pdfHeader,
        pdftype
      );

      // Download PDF locally
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Upload to backend API
      const formData = new FormData();
      formData.append("file", blob, fileName);
      formData.append("totalTime", totalTime);
      let type = "pcm";
      formData.append("type", type); // 👈 Add this line
      const response = await sendPdfToBackendApi(formData, id);

      toast({
        title: "PDF Generated Successfully! 📄",
        description: `Report "${fileName}" has been downloaded and uploaded.`,
      });

      // if (navigator.clipboard && response?.url) {
      //   await navigator.clipboard.writeText(response.url)
      //   toast({
      //     title: "URL Copied! 📋",
      //     description: "PDF URL has been copied to your clipboard.",
      //   })
      // }
    } catch (error) {
      console.error("PDF generation/upload error:", error);
      toast({
        title: "PDF Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate or upload PDF report.",
        variant: "destructive",
      });
    } finally {
      setUploadingPDF(false);
    }
  };

  const primaryDiagnosis = patient?.condition || "General Care";

  const generateAIAssessment = async () => {
    if (!patient || !startTime) return;

    setGeneratingResponse(true);
    try {
      // ✅ Calculate total time when assessment is completed
      const endTime = new Date();
      const calculatedTotalTime = formatDuration(startTime, endTime);
      setTotalTime(calculatedTotalTime);

      const response = await generateEnhancedAIAssessment(
        patient,
        assessmentData
      );
      setAiResponse(response);
      setIsCompleted(true);

      toast({
        title: "Assessment Complete! ✅",
        description: `PCM assessment for ${patient.firstName} completed with ${response.riskLevel} risk level in ${calculatedTotalTime}.`,
      });
    } catch (error: any) {
      console.error("Assessment generation error:", error);
      toast({
        title: "Assessment Failed",
        description: "Failed to generate assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingResponse(false);
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const progress = ((currentCategory + 1) / assessmentQuestions.length) * 100;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await getSinglePatientAPI(id, token);
        setPatient(res);
        // ✅ Start timing when patient data is loaded
        setStartTime(new Date());
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        });
      }
    };

    if (id) fetchPatient();
  }, [id]);

  if (generatingResponse) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-blue-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-blue-200 animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">
              🤖 AI Analysis in Progress
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Our advanced AI is analyzing {patient?.firstName}'s assessment
              data, calculating risk levels, and generating comprehensive
              clinical recommendations...
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>This typically takes 15-45 seconds</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted && aiResponse) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header Card */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-2xl text-green-800">
                    Assessment Complete
                  </CardTitle>
                  <p className="text-green-700 mt-1">
                    PCM Clinical Assessment for {patient?.firstName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  className={`px-4 py-2 text-sm font-semibold ${getRiskBadgeColor(
                    aiResponse.riskLevel
                  )}`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {aiResponse.riskLevel} RISK
                </Badge>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {aiResponse.riskScore}
                  </div>
                  <div className="text-sm text-gray-600">Risk Score</div>
                </div>
              </div>
            </div>

            {/* ✅ Display total time in the header */}
            {totalTime && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Assessment completed in: {totalTime}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => {
                  setIsCompleted(false);
                  setAiResponse(null);
                  setCurrentCategory(0);
                  setAssessmentData({});
                  setPdfUrl(null);
                  setStartTime(new Date()); // ✅ Reset timer for new assessment
                  setTotalTime("");
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                New Assessment
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={uploadingPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {uploadingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Professional Report
                  </>
                )}
              </Button>
            </div>

            {/* PDF URL Display */}
            {pdfUrl && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    PDF URL:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pdfUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-white border border-blue-300 rounded-md"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(pdfUrl);
                      toast({
                        title: "Copied!",
                        description: "PDF URL copied to clipboard",
                      });
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open(pdfUrl, "_blank")}
                  >
                    Open
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Clinical Summary */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <FileText className="h-5 w-5" />
              Clinical Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg">
              {aiResponse.clinicalSummary}
            </p>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        {aiResponse.riskFactors.length > 0 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Identified Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiResponse.riskFactors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-orange-800">{factor}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Heart className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {aiResponse.riskAssessment}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Stethoscope className="h-5 w-5" />
                Care Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {aiResponse.careRecommendations}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Activity className="h-5 w-5" />
                Immediate Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {aiResponse.immediateActions}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Calendar className="h-5 w-5" />
                Follow-up Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {aiResponse.followUpPlan}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Concerns */}
        {aiResponse.urgentConcerns &&
          !aiResponse.urgentConcerns.includes(
            "No immediate urgent concerns"
          ) && (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-6 w-6" />
                  ⚠️ Urgent Concerns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-800 whitespace-pre-wrap leading-relaxed font-medium text-lg">
                  {aiResponse.urgentConcerns}
                </p>
              </CardContent>
            </Card>
          )}

        {/* Patient Information Summary */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <User className="h-5 w-5" />
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Patient:</span>
                <div className="text-gray-800">{patient?.firstName}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Condition:</span>
                <div className="text-gray-800">
                  {primaryDiagnosis || "NA"}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Risk Level:</span>
                <div className="text-gray-800">{aiResponse.riskLevel}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Assessment Date:
                </span>
                <div className="text-gray-800">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              {/* ✅ Display total time in summary */}
              {totalTime && (
                <div>
                  <span className="font-medium text-gray-600">Total Time:</span>
                  <div className="text-gray-800">{totalTime}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment Form
  const currentAssessment = assessmentQuestions[currentCategory];
  const IconComponent = currentAssessment.icon;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <IconComponent className="h-7 w-7 text-blue-600" />
            <div>
              <div className="text-blue-800">PCM Clinical Assessment</div>
              <div className="text-lg text-gray-600 font-normal">
                {patient?.firstName} - {patient?.condition}
              </div>
            </div>
          </CardTitle>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600">Assessment Progress</span>
              <span className="text-blue-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Category {currentCategory + 1} of {assessmentQuestions.length}
              </span>
              <span>{currentAssessment.category}</span>
            </div>
            {/* ✅ Show elapsed time during assessment */}
            {startTime && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Timer className="h-3 w-3" />
                <span>Time elapsed: {formatDuration(startTime, now)}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div
              className={`p-6 rounded-lg border-2 ${currentAssessment.color}`}
            >
              <h3 className="font-semibold text-lg mb-6 flex items-center gap-3">
                <IconComponent className="h-6 w-6" />
                {currentAssessment.category}
              </h3>

              <div className="space-y-6">
                {currentAssessment.questions.map((question, index) => (
                  <div key={index} className="space-y-3">
                    <label className="text-sm font-medium text-gray-800 block">
                      <span className="inline-block w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold text-center leading-6 mr-2">
                        {index + 1}
                      </span>
                      {question}
                    </label>
                    <textarea
                      className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      rows={3}
                      placeholder="Please provide detailed information for accurate assessment..."
                      value={
                        assessmentData[`${currentCategory}-${index}`] || ""
                      }
                      onChange={(e) =>
                        setAssessmentData({
                          ...assessmentData,
                          [`${currentCategory}-${index}`]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentCategory(Math.max(0, currentCategory - 1))
                }
                disabled={currentCategory === 0}
                className="flex items-center gap-2"
              >
                ← Previous
              </Button>

              <div className="text-center">
                <div className="text-sm text-gray-600">
                  {
                    Object.keys(assessmentData).filter(
                      (key) => assessmentData[key].trim() !== ""
                    ).length
                  }{" "}
                  of{" "}
                  {assessmentQuestions.reduce(
                    (total, cat) => total + cat.questions.length,
                    0
                  )}{" "}
                  questions answered
                </div>
              </div>

              {currentCategory === assessmentQuestions.length - 1 ? (
                <Button
                  onClick={generateAIAssessment}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2 px-6"
                >
                  <Brain className="h-4 w-4" />
                  Generate AI Assessment
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentCategory(currentCategory + 1)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  Next →
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
