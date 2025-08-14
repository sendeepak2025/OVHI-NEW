

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Loader2,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getSinglePatientAPI } from "@/services/operations/patient";
import jsPDF from "jspdf";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Patient {
  id: number;
  firstName: string;
  condition: string;
  riskLevel: string;
}

interface AIResponse {
  recommendations: string;
  riskAssessment: string;
  nextSteps: string;
  urgentConcerns: string;
}

const getConditionQuestions = (condition: string) => {
  if (condition?.includes("Hypertension")) {
    return [
      {
        id: "bp_monitoring",
        question: "How often do you check your blood pressure at home?",
        type: "radio",
        options: ["Daily", "2-3 times per week", "Weekly", "Rarely", "Never"],
      },
      {
        id: "bp_symptoms",
        question: "Have you experienced any of these symptoms recently?",
        type: "checkbox",
        options: [
          "Headaches",
          "Dizziness",
          "Chest pain",
          "Shortness of breath",
          "None",
        ],
      },
      {
        id: "medication_timing",
        question:
          "Do you take your blood pressure medications at the same time each day?",
        type: "radio",
        options: ["Always", "Usually", "Sometimes", "Rarely", "Never"],
      },
      {
        id: "lifestyle_changes",
        question: "Which lifestyle modifications are you following?",
        type: "checkbox",
        options: [
          "Low sodium diet",
          "Regular exercise",
          "Weight management",
          "Stress reduction",
          "Limit alcohol",
        ],
      },
      {
        id: "side_effects",
        question: "Are you experiencing any medication side effects?",
        type: "radio",
        options: ["None", "Mild", "Moderate", "Severe"],
      },
    ];
  } else if (condition?.includes("Diabetes")) {
    return [
      {
        id: "glucose_monitoring",
        question: "How often do you check your blood glucose?",
        type: "radio",
        options: [
          "Multiple times daily",
          "Daily",
          "Few times per week",
          "Weekly",
          "Rarely",
        ],
      },
      {
        id: "diabetes_symptoms",
        question: "Have you experienced any of these symptoms recently?",
        type: "checkbox",
        options: [
          "Excessive thirst",
          "Frequent urination",
          "Blurred vision",
          "Fatigue",
          "Slow healing wounds",
          "None",
        ],
      },
      {
        id: "insulin_adherence",
        question:
          "How consistent are you with your diabetes medications/insulin?",
        type: "radio",
        options: [
          "Very consistent",
          "Mostly consistent",
          "Sometimes miss doses",
          "Often miss doses",
          "Very inconsistent",
        ],
      },
      {
        id: "diet_management",
        question: "Which dietary practices are you following?",
        type: "checkbox",
        options: [
          "Carb counting",
          "Meal planning",
          "Portion control",
          "Regular meal timing",
          "None consistently",
        ],
      },
      {
        id: "hypoglycemia",
        question: "How often do you experience low blood sugar episodes?",
        type: "radio",
        options: [
          "Never",
          "Rarely",
          "Weekly",
          "Multiple times per week",
          "Daily",
        ],
      },
    ];
  }
  return [];
};

// OpenAI API call function - Direct integration
const generateOpenAIResponse = async (
  patient: Patient,
  answers: Record<string, string | string[]>,
  questions: any[]
) => {
  const OPENAI_API_KEY =
    '';

  // Format the questionnaire data for the AI prompt
  const formattedAnswers = questions
    .map((q: any) => {
      const answer = answers[q.id];
      const answerText = Array.isArray(answer) ? answer.join(", ") : answer;
      return `Q: ${q.question}\nA: ${answerText}`;
    })
    .join("\n\n");

  const prompt = `You are a qualified healthcare AI assistant specializing in patient care management (PCM). Analyze this patient questionnaire and provide a comprehensive health assessment.

Patient Information:
- Name: ${patient.firstName}
- Primary Condition: ${patient.condition}
- Current Risk Level: ${patient.riskLevel}

Questionnaire Responses:
${formattedAnswers}

Please provide your assessment in exactly this format:

RISK ASSESSMENT:
[Analyze the patient's current risk level based on their responses. Consider medication adherence, symptom frequency, lifestyle factors, and any concerning patterns. Be specific about what indicates higher or lower risk.]

RECOMMENDATIONS:
[Provide specific, actionable recommendations tailored to their condition and responses. Include:
- Medication management tips
- Lifestyle modifications
- Monitoring suggestions
- Self-care strategies
- Dietary recommendations if applicable]

NEXT STEPS:
[Outline immediate and long-term actions:
- When to contact healthcare providers
- Follow-up scheduling recommendations
- Monitoring frequency
- Warning signs to watch for]

URGENT CONCERNS:
[Identify any responses that indicate immediate medical attention may be needed. If no urgent concerns exist, state "No immediate urgent concerns identified based on current responses." Be conservative - err on the side of caution.]`;

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
              "You are a qualified healthcare AI assistant specializing in patient care management. Provide evidence-based health assessments while emphasizing that your recommendations supplement, not replace, professional medical care.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "";

    // Parse the response into structured format
    const sections = text.split(
      /(?=RISK ASSESSMENT:|RECOMMENDATIONS:|NEXT STEPS:|URGENT CONCERNS:)/
    );

    let riskAssessment = "";
    let recommendations = "";
    let nextSteps = "";
    let urgentConcerns = "";

    sections.forEach((section) => {
      if (section.startsWith("RISK ASSESSMENT:")) {
        riskAssessment = section.replace("RISK ASSESSMENT:", "").trim();
      } else if (section.startsWith("RECOMMENDATIONS:")) {
        recommendations = section.replace("RECOMMENDATIONS:", "").trim();
      } else if (section.startsWith("NEXT STEPS:")) {
        nextSteps = section.replace("NEXT STEPS:", "").trim();
      } else if (section.startsWith("URGENT CONCERNS:")) {
        urgentConcerns = section.replace("URGENT CONCERNS:", "").trim();
      }
    });

    return {
      riskAssessment:
        riskAssessment ||
        "Risk assessment is being processed. Please consult with your healthcare provider for detailed evaluation.",
      recommendations:
        recommendations ||
        "Personalized recommendations will be provided after thorough review of your responses.",
      nextSteps:
        nextSteps ||
        "Next steps will be determined based on your healthcare provider's assessment.",
      urgentConcerns:
        urgentConcerns ||
        "No immediate urgent concerns identified based on current responses.",
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

// Mock AI Response function for testing (fallback)
const generateMockAIResponse = (
  patient: Patient,
  answers: Record<string, string | string[]>
): AIResponse => {
  const isHypertension = patient.condition?.includes("Hypertension");
  const isDiabetes = patient.condition?.includes("Diabetes");
  const { token } = useSelector((state: RootState) => state.auth);

  if (isHypertension) {
    const bpMonitoring = answers.bp_monitoring as string;
    const symptoms = answers.bp_symptoms as string[];
    const medicationTiming = answers.medication_timing as string;
    const lifestyle = answers.lifestyle_changes as string[];
    const sideEffects = answers.side_effects as string;

    return {
      riskAssessment: `Based on ${
        patient.firstName
      }'s responses, your current hypertension management shows ${
        bpMonitoring === "Daily"
          ? "excellent"
          : bpMonitoring === "Weekly"
          ? "moderate"
          : "concerning"
      } blood pressure monitoring frequency. ${
        symptoms?.includes("Chest pain") ||
        symptoms?.includes("Shortness of breath")
          ? "The presence of chest pain or shortness of breath requires immediate attention."
          : "No immediate cardiovascular symptoms reported."
      } Your medication adherence appears ${
        medicationTiming === "Always"
          ? "excellent"
          : medicationTiming === "Usually"
          ? "good"
          : "needs improvement"
      }.`,

      recommendations: `For optimal hypertension management:
• ${
        bpMonitoring !== "Daily"
          ? "Increase blood pressure monitoring to daily readings, especially in the morning"
          : "Continue your excellent daily BP monitoring routine"
      }
• ${
        !lifestyle?.includes("Low sodium diet")
          ? "Adopt a low-sodium diet (less than 2,300mg daily)"
          : "Continue your low-sodium diet"
      }
• ${
        !lifestyle?.includes("Regular exercise")
          ? "Incorporate 30 minutes of moderate exercise 5 days per week"
          : "Maintain your regular exercise routine"
      }
• ${
        medicationTiming !== "Always"
          ? "Set daily reminders to take medications at the same time each day"
          : "Continue taking medications consistently"
      }
• ${
        !lifestyle?.includes("Stress reduction")
          ? "Practice stress management techniques like meditation or deep breathing"
          : "Continue your stress management practices"
      }`,

      nextSteps: `Immediate Actions:
• ${
        symptoms?.includes("Chest pain")
          ? "Contact your healthcare provider immediately about chest pain symptoms"
          : "Schedule routine follow-up with your healthcare provider within 2-4 weeks"
      }
• Keep a daily log of blood pressure readings, medications, and symptoms
• ${
        sideEffects !== "None"
          ? "Discuss medication side effects with your doctor"
          : "Continue current medication regimen as prescribed"
      }
• Monitor for warning signs: severe headaches, chest pain, difficulty breathing, or vision changes`,

      urgentConcerns:
        symptoms?.includes("Chest pain") ||
        symptoms?.includes("Shortness of breath")
          ? "⚠️ URGENT: You reported chest pain and/or shortness of breath. These symptoms require immediate medical evaluation. Please contact your healthcare provider or emergency services if symptoms are severe or worsening."
          : "No immediate urgent concerns identified based on current responses. Continue monitoring as recommended.",
    };
  }

  if (isDiabetes) {
    const glucoseMonitoring = answers.glucose_monitoring as string;
    const symptoms = answers.diabetes_symptoms as string[];
    const medicationAdherence = answers.insulin_adherence as string;
    const dietManagement = answers.diet_management as string[];
    const hypoglycemia = answers.hypoglycemia as string;

    return {
      riskAssessment: `${patient.firstName}'s diabetes management shows ${
        glucoseMonitoring === "Multiple times daily"
          ? "excellent"
          : glucoseMonitoring === "Daily"
          ? "good"
          : "inadequate"
      } glucose monitoring. ${
        symptoms?.includes("Blurred vision") ||
        symptoms?.includes("Slow healing wounds")
          ? "The presence of complications-related symptoms suggests suboptimal glucose control."
          : "No major diabetic complications symptoms reported."
      } Medication adherence is ${
        medicationAdherence === "Very consistent"
          ? "excellent"
          : medicationAdherence === "Mostly consistent"
          ? "good"
          : "concerning"
      }.`,

      recommendations: `For optimal diabetes management:
• ${
        glucoseMonitoring !== "Multiple times daily"
          ? "Increase glucose monitoring to multiple times daily (before meals and bedtime)"
          : "Continue your excellent glucose monitoring routine"
      }
• ${
        !dietManagement?.includes("Carb counting")
          ? "Learn and practice carbohydrate counting for better glucose control"
          : "Continue your carbohydrate counting practice"
      }
• ${
        !dietManagement?.includes("Meal planning")
          ? "Develop a consistent meal planning routine"
          : "Maintain your meal planning schedule"
      }
• ${
        medicationAdherence !== "Very consistent"
          ? "Set up medication reminders and never skip doses"
          : "Continue your excellent medication adherence"
      }
• ${
        hypoglycemia === "Daily" || hypoglycemia === "Multiple times per week"
          ? "Work with your healthcare team to adjust medication dosing to reduce hypoglycemic episodes"
          : "Continue monitoring for hypoglycemia symptoms"
      }`,

      nextSteps: `Immediate Actions:
• ${
        symptoms?.includes("Blurred vision") ||
        symptoms?.includes("Slow healing wounds")
          ? "Schedule urgent appointment with your healthcare provider to address complications"
          : "Schedule routine diabetes follow-up within 3 months"
      }
• Maintain detailed glucose logs with readings, meals, and medications
• ${
        hypoglycemia === "Daily"
          ? "Discuss frequent low blood sugar episodes with your doctor immediately"
          : "Continue monitoring for hypoglycemia"
      }
• Regular eye exams, foot checks, and kidney function tests as recommended`,

      urgentConcerns:
        symptoms?.includes("Blurred vision") ||
        symptoms?.includes("Slow healing wounds") ||
        hypoglycemia === "Daily"
          ? "⚠️ URGENT: You reported symptoms that may indicate diabetic complications or frequent hypoglycemia. Please contact your healthcare provider within 24-48 hours for evaluation and possible medication adjustment."
          : "No immediate urgent concerns identified based on current responses. Continue regular diabetes monitoring and care.",
    };
  }

  return {
    riskAssessment:
      "General health assessment completed based on your responses.",
    recommendations:
      "Continue following your healthcare provider's recommendations and maintain regular check-ups.",
    nextSteps:
      "Schedule regular follow-up appointments and continue monitoring your condition as advised.",
    urgentConcerns:
      "No immediate urgent concerns identified based on current responses.",
  };
};

export const PCMQuestionnaire = () => {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      if (!id) return;
      try {
        const res = await getSinglePatientAPI(id, token);
        if (res) {
          setPatient(res);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      }
      setLoading(false);
    };

    fetchPatient();
  }, [id]);

  const questions = getConditionQuestions(patient?.condition || "");

  const generateAIResponse = async (
    patientData: Patient,
    questionnaireAnswers: Record<string, string | string[]>
  ) => {
    try {
      // console.log("Generating AI response...");

      // Try OpenAI API first
      try {
        const response = await generateOpenAIResponse(
          patientData,
          questionnaireAnswers,
          questions
        );
        // console.log("OpenAI response generated successfully");
        return response;
      } catch (openaiError) {
        console.log("OpenAI failed, using mock response:", openaiError);
        // Fallback to mock response
        const mockResponse = generateMockAIResponse(
          patientData,
          questionnaireAnswers
        );
        // console.log("Mock response generated successfully");
        return mockResponse;
      }
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      throw new Error(
        "Unable to generate health assessment. Please try again."
      );
    }
  };

  const generatePDF = () => {
    if (!aiResponse || !patient) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 30;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Health Assessment Report - ${patient.firstName}`,
      margin,
      yPosition
    );

    yPosition += 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Condition: ${patient.condition}`, margin, yPosition);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      margin,
      yPosition + 10
    );
    doc.text(`Risk Level: ${patient.riskLevel}`, margin, yPosition + 20);

    yPosition += 40;

    // Risk Assessment
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Risk Assessment", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const riskLines = doc.splitTextToSize(aiResponse.riskAssessment, maxWidth);
    doc.text(riskLines, margin, yPosition);
    yPosition += riskLines.length * 5 + 15;

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    // Recommendations
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Personalized Recommendations", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const recLines = doc.splitTextToSize(aiResponse.recommendations, maxWidth);
    doc.text(recLines, margin, yPosition);
    yPosition += recLines.length * 5 + 15;

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    // Next Steps
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Next Steps", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const nextLines = doc.splitTextToSize(aiResponse.nextSteps, maxWidth);
    doc.text(nextLines, margin, yPosition);
    yPosition += nextLines.length * 5 + 15;

    // Urgent Concerns
    if (
      aiResponse.urgentConcerns &&
      !aiResponse.urgentConcerns.includes("No immediate urgent concerns")
    ) {
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38); // Red color for urgent
      doc.text("⚠️ URGENT CONCERNS", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Back to black
      const urgentLines = doc.splitTextToSize(
        aiResponse.urgentConcerns,
        maxWidth
      );
      doc.text(urgentLines, margin, yPosition);
    }

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
        margin,
        285
      );
      doc.text(
        "This assessment supplements, not replaces, professional medical care.",
        margin,
        290
      );
    }

    // Save the PDF
    doc.save(
      `${patient.firstName}_Health_Assessment_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    toast({
      title: "PDF Downloaded! 📄",
      description: `Health assessment report for ${patient.firstName} has been downloaded successfully.`,
    });
  };

  const handleRadioChange = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleCheckboxChange = (
    questionId: string,
    option: string,
    checked: boolean
  ) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    if (checked) {
      setAnswers({
        ...answers,
        [questionId]: [...currentAnswers, option],
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: currentAnswers.filter((item) => item !== option),
      });
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(
      (q) =>
        !answers[q.id] ||
        (Array.isArray(answers[q.id]) &&
          (answers[q.id] as string[]).length === 0)
    );

    if (unanswered.length > 0) {
      toast({
        title: "Incomplete Questionnaire",
        description: `Please answer all questions. ${unanswered.length} questions remaining.`,
        variant: "destructive",
      });
      return;
    }

    setGeneratingResponse(true);

    try {
      if (patient) {
        console.log("Starting AI assessment generation...");
        const response = await generateAIResponse(patient, answers);
        setAiResponse(response);
        setIsSubmitted(true);

        toast({
          title: "Assessment Complete! ✅",
          description: `Personalized health assessment for ${patient.firstName} has been generated successfully.`,
        });
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Assessment Failed",
        description:
          error.message ||
          "Failed to generate health assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingResponse(false);
    }
  };

  const getCompletionPercentage = () => {
    const answeredQuestions = questions.filter(
      (q) =>
        answers[q.id] &&
        (!Array.isArray(answers[q.id]) ||
          (Array.isArray(answers[q.id]) &&
            (answers[q.id] as string[]).length > 0))
    ).length;
    return Math.round((answeredQuestions / questions.length) * 100);
  };

  if (generatingResponse) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">
            🤖 Generating Health Assessment
          </h3>
          <p className="text-muted-foreground text-center">
            Our AI is analyzing {patient?.firstName}'s responses and generating
            personalized health recommendations...
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            This may take 10-30 seconds
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted && aiResponse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            🎉 Health Assessment Complete for {patient?.firstName}
          </CardTitle>
          <br />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setAiResponse(null);
              }}
            >
              Retake Assessment
            </Button>
            <Button
              variant="outline"
              onClick={generatePDF}
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                📊 Risk Assessment
              </h3>
              <p className="text-blue-700 whitespace-pre-wrap leading-relaxed">
                {aiResponse.riskAssessment}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                💡 Personalized Recommendations
              </h3>
              <p className="text-green-700 whitespace-pre-wrap leading-relaxed">
                {aiResponse.recommendations}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                📋 Next Steps
              </h3>
              <p className="text-purple-700 whitespace-pre-wrap leading-relaxed">
                {aiResponse.nextSteps}
              </p>
            </div>

            {aiResponse.urgentConcerns &&
              !aiResponse.urgentConcerns.includes(
                "No immediate urgent concerns"
              ) && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    ⚠️ Urgent Concerns
                  </h3>
                  <p className="text-red-700 whitespace-pre-wrap leading-relaxed font-medium">
                    {aiResponse.urgentConcerns}
                  </p>
                </div>
              )}

            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium mb-3 text-gray-800">
                📋 Assessment Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Patient:</span>{" "}
                  {patient?.firstName}
                </div>
                <div>
                  <span className="font-medium">Condition:</span>{" "}
                  {patient?.condition}
                </div>
                <div>
                  <span className="font-medium">Assessment Date:</span>{" "}
                  {new Date().toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Questions Completed:</span>{" "}
                  {questions.length}
                </div>
                <div>
                  <span className="font-medium">Risk Level:</span>{" "}
                  {patient?.riskLevel}
                </div>
                <div>
                  <span className="font-medium">Assessment Type:</span> PCM
                  Questionnaire
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading patient data...</span>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              🏥 PCM Health Assessment: {patient?.firstName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Completion: {getCompletionPercentage()}%</span>
              <span>•</span>
              <span>{patient?.condition}</span>
              <span>•</span>
              <span>Risk Level: {patient?.riskLevel}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="p-4 border-l-4 border-l-blue-500"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <h3 className="font-medium text-gray-800">
                        {question.question}
                      </h3>
                    </div>

                    {question.type === "radio" && (
                      <RadioGroup
                        value={(answers[question.id] as string) || ""}
                        onValueChange={(value) =>
                          handleRadioChange(question.id, value)
                        }
                      >
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`${question.id}-${optionIndex}`}
                            />
                            <Label
                              htmlFor={`${question.id}-${optionIndex}`}
                              className="cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === "checkbox" && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${question.id}-${optionIndex}`}
                              checked={(
                                (answers[question.id] as string[]) || []
                              )?.includes(option)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  question.id,
                                  option,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={`${question.id}-${optionIndex}`}
                              className="cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {getCompletionPercentage() < 100 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>
                        Please complete all questions before submitting
                      </span>
                    </div>
                  )}
                  {getCompletionPercentage() === 100 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        All questions completed! Ready to generate assessment.
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={getCompletionPercentage() < 100}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🤖 Generate AI Health Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
