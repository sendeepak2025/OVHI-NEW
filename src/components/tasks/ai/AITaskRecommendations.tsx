"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Brain, Plus, Clock, Target, AlertCircle, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addMonths, formatISO } from "date-fns"
import { createTaskAPI } from "@/services/operations/task";
import { RootState } from "@/redux/store"
import { useSelector } from "react-redux"

interface TaskRecommendation {
  id: string
  patient_id: string
  task_title: string
  task_description: string
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  estimated_duration: number
  confidence_score: number
  reasoning: string
  required_conditions: string[]
  potential_impact: string
  suggested_frequency?: string
  created_at: string
}

interface AITaskRecommendationsProps {
  patientId: string
  patientConditions?: string[]
  patientAge?: number
  patientGender?: string
  patient?: any
  recentVitals?: Record<string, any>
  onAddTask?: (recommendation: TaskRecommendation) => void
  fetchTasks?: () => void
}

const AITaskRecommendations: React.FC<AITaskRecommendationsProps> = ({
  patientId,
  fetchTasks,
  patientConditions = [],
  patientAge,
  patientGender,
  recentVitals,
  onAddTask,
  patient
}) => {
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()
  const { token, user } = useSelector((state: RootState) => state.auth)

  console.log(patient)
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }



  console.log(patient)
const generateAIRecommendations = async () => {
  
  if (patientConditions.length === 0) {
    toast({
      title: "No Conditions",
      description: "Please add patient conditions to generate AI recommendations",
      variant: "destructive",
    });
    return;
  }

  setGenerating(true);

  // Format medications
const formattedMedications = patient.currentMedications?.length > 0
  ? patient.currentMedications.map(m => `${m.name} (${m.dosage}, ${m.frequency}, from ${new Date(m.startDate).toLocaleDateString()} to ${new Date(m.endDate).toLocaleDateString()})`).join("; ")
  : "None";

// Format allergies
const formattedAllergies = patient.allergies?.length > 0
  ? patient.allergies.map(a => `${a.allergen} (Reaction: ${a.reaction})`).join("; ")
  : "None";



  const systemPrompt = `You are an expert healthcare AI assistant for a Primary Care Management (PCM) system. Generate personalized task recommendations for patients based on their medical conditions and profile.

You must respond in valid JSON format with this exact structure:
{
  "recommendations": [
    {
      "task_title": "string",
      "task_description": "string", 
      "priority": "low|medium|high|urgent",
      "category": "monitoring|medication_management|care_coordination|laboratory|preventive_care|lifestyle_modification",
      "estimated_duration": number,
      "confidence_score": number (0.0 to 1.0),
      "reasoning": "string",
      "required_conditions": ["string array"],
      "potential_impact": "string",
      "suggested_frequency": "string"
    }
  ]
}

Generate 3-5 specific, actionable, medically appropriate task recommendations. Each task should be:
- Specific and actionable for healthcare providers
- Medically appropriate for the listed conditions
- Include realistic time estimates (5-120 minutes)
- Have clear medical reasoning
- Include appropriate priority levels based on clinical urgency
- Consider patient age and gender when relevant

IMPORTANT: Return ONLY valid JSON, no additional text, explanations, or markdown formatting.`;

const ageInYears = patient?.birthDate
  ? Math.floor((new Date().getTime() - new Date(patient?.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  : "Not specified";

const userPrompt = `You are a clinical AI tasked with generating task recommendations for a patient enrolled in a Primary Care Management program.

Use the following patient demographics and clinical data (including device readings) to create accurate and medically relevant recommendations:

Patient Demographics:
- Patient ID: ${patient.patientId}
- Full Name: ${patient.firstName} ${patient.middleName || ""} ${patient.lastName}
- Age: ${ageInYears}
- Gender: ${patient.gender || "Not specified"}
- Status: ${patient.status}
- Last Visit: ${patient.lastVisit || "Unknown"}

Clinical Data:
- Active Diagnoses: ${patient.diagnosis?.length > 0  ? patient.diagnosis.map(d => d.diagnosis).join(", ")    : "None"}
- Current Medications: ${formattedMedications}
- Allergies: ${formattedAllergies}


Vital Signs:
- Blood Pressure: ${patient.bloodPressure || "Not available"}
- Heart Rate: ${patient.heartRate || "Not available"}
- Temperature: ${patient.temperature || "Not available"}
- BMI: ${patient.bmi || "Not available"}
- Height: ${patient.height || "Not available"}
- Weight: ${patient.weight || "Not available"}

Device Readings:
- Blood Glucose: ${patient.deviceReadings?.bloodGlucose || "Not available"}
- SpO2: ${patient.deviceReadings?.spo2 || "Not available"}
- Systolic BP: ${patient.deviceReadings?.systolicBP || "Not available"}
- Diastolic BP: ${patient.deviceReadings?.diastolicBP || "Not available"}
- Steps Walked: ${patient.deviceReadings?.steps || "Not available"}
- Sleep Hours: ${patient.deviceReadings?.sleepHours || "Not available"}

Instructions:
Using this information, generate 3 to 5 highly specific, medically actionable task recommendations. Each task must:
- Be relevant to patient vitals, diagnosis, medications, age, gender, and device data
- Have estimated duration in minutes (5-120)
- Be categorized (monitoring, medication_management, care_coordination, etc.)
- Include priority (low, medium, high, urgent)
- Contain detailed clinical reasoning

Return ONLY valid JSON in the structure previously defined.`;

console.log("🧠 AI User Prompt:\n", userPrompt);



  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPEN_AI_KEY || "your_api_key_here"}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`OpenAI API error: ${err.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.recommendations)) throw new Error("Invalid response structure");

    const aiRecommendations: TaskRecommendation[] = parsed.recommendations.map((rec: any, i: number) => ({
      id: `ai_${Date.now()}_${i}`,
      patient_id: patientId,
      task_title: rec.task_title || "Health Assessment",
      task_description: rec.task_description || "Complete health evaluation",
      priority: rec.priority || "medium",
      category: rec.category || "care_coordination",
      estimated_duration: rec.estimated_duration || 30,
      confidence_score: rec.confidence_score || 0.7,
      reasoning: rec.reasoning || "Based on patient conditions",
      required_conditions: rec.required_conditions || patientConditions,
      potential_impact: rec.potential_impact || "Improves patient care outcomes",
      suggested_frequency: rec.suggested_frequency || "as needed",
      created_at: new Date().toISOString(),
    }));

    setRecommendations(aiRecommendations);
    toast({
      title: "AI Analysis Complete",
      description: `Generated ${aiRecommendations.length} personalized task recommendations`,
    });
  } catch (error: any) {
    console.error("Error generating AI recommendations:", error);

    // Fallback
    const fallbackRecommendations: TaskRecommendation[] = [
      {
        id: `fallback_${Date.now()}_1`,
        patient_id: patientId,
        task_title: "Comprehensive Health Assessment",
        task_description: "Complete evaluation of patient's current health status based on their conditions",
        priority: "medium",
        category: "care_coordination",
        estimated_duration: 45,
        confidence_score: 0.7,
        reasoning: `Based on conditions: ${patientConditions.join(", ")}`,
        required_conditions: patientConditions,
        potential_impact: "Improves patient outcomes",
        suggested_frequency: "monthly",
        created_at: new Date().toISOString(),
      },
      {
        id: `fallback_${Date.now()}_2`,
        patient_id: patientId,
        task_title: "Medication Review",
        task_description: "Review medications for interactions and efficacy",
        priority: "high",
        category: "medication_management",
        estimated_duration: 30,
        confidence_score: 0.8,
        reasoning: "Multiple chronic conditions require medication adjustments",
        required_conditions: patientConditions,
        potential_impact: "Reduces adverse reactions",
        suggested_frequency: "bi-weekly",
        created_at: new Date().toISOString(),
      },
      {
        id: `fallback_${Date.now()}_3`,
        patient_id: patientId,
        task_title: "Vital Signs Monitoring",
        task_description: "Regularly check blood pressure and heart rate",
        priority: "high",
        category: "monitoring",
        estimated_duration: 15,
        confidence_score: 0.9,
        reasoning: "Essential for managing chronic illnesses",
        required_conditions: patientConditions,
        potential_impact: "Early detection of issues",
        suggested_frequency: "daily",
        created_at: new Date().toISOString(),
      },
    ];

    setRecommendations(fallbackRecommendations);
    toast({
      title: "Fallback Recommendations",
      description: "Used fallback recommendations based on patient conditions",
    });
  } finally {
    setGenerating(false);
  }
};






  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      if (recommendations.length === 0 && patientConditions.length > 0) {
        await generateAIRecommendations()
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (patientConditions.length > 0) {
      fetchRecommendations()
    } else {
      setRecommendations([])
    }
  }, [patientId, JSON.stringify(patientConditions)])

  const addTaskFromRecommendation = async(recommendation: TaskRecommendation) => {
    console.log(recommendation)
    onAddTask?.(recommendation)
  const today = new Date();
  const oneMonthLater = addMonths(today, 1);
  const formattedDueDate = formatISO(oneMonthLater);
    const taskData = {
  title: recommendation.task_title,
  description: recommendation.task_description,
  duration: recommendation.estimated_duration,
  priority: recommendation.priority || "medium",
  frequencyType: recommendation.suggested_frequency || "Daily",
  status: "pending",
  frequency: recommendation.suggested_frequency || "Daily",
  type: "ai",
  dueDate: formattedDueDate, 
};


      const response = await createTaskAPI(taskData, patient.patientId, token);

fetchTasks()
  }

  if (loading && recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Task Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="text-muted-foreground">Generating AI recommendations...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Task Recommendations
          </h2>
          <p className="text-muted-foreground">
            Intelligent task suggestions powered by OpenAI based on patient conditions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateAIRecommendations}
            disabled={generating || patientConditions.length === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={generateAIRecommendations}
            disabled={generating || patientConditions.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Tasks
              </>
            )}
          </Button>
        </div>
      </div>

      {patientConditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Profile</CardTitle>
            <CardDescription>AI recommendations are based on this patient information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {patientAge && (
                <div>
                  <span className="font-medium">Age:</span> {patientAge} years
                </div>
              )}
              {patientGender && (
                <div>
                  <span className="font-medium">Gender:</span> {patientGender}
                </div>
              )}
              <div>
                <span className="font-medium">Conditions:</span> {patientConditions.length}
              </div>
            </div>
            <div>
              <span className="font-medium text-sm">Medical Conditions:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {patientConditions.map((condition) => (
                  <Badge key={condition} variant="outline" className="bg-blue-50">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{recommendation.task_title}</CardTitle>
                    <Badge className={getPriorityColor(recommendation.priority)}>{recommendation.priority}</Badge>
                  </div>
                  <CardDescription>{recommendation.task_description}</CardDescription>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">AI Confidence:</span>
                    <span className={`font-semibold ${getConfidenceColor(recommendation.confidence_score)}`}>
                      {(recommendation.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={recommendation.confidence_score * 100} className="w-20 h-2" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Est. {recommendation.estimated_duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="capitalize">{recommendation.category.replace("_", " ")}</span>
                </div>
                {recommendation.suggested_frequency && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="capitalize">{recommendation.suggested_frequency}</span>
                  </div>
                )}
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">AI Reasoning:</h4>
                <p className="text-sm text-purple-700">{recommendation.reasoning}</p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">Potential Impact:</h4>
                <p className="text-sm text-green-700">{recommendation.potential_impact}</p>
              </div>

              {recommendation.required_conditions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Relevant Conditions:</h4>
                  <div className="flex flex-wrap gap-1">
                    {recommendation.required_conditions.map((condition) => (
                      <Badge key={condition} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => addTaskFromRecommendation(recommendation)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && !loading && patientConditions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Patient Conditions</h3>
            <p className="text-muted-foreground mb-4">
              Add patient conditions to generate AI-powered task recommendations
            </p>
          </CardContent>
        </Card>
      )}

      {recommendations.length === 0 && !loading && !generating && patientConditions.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI-powered task recommendations based on patient conditions
            </p>
            <Button onClick={generateAIRecommendations} disabled={generating}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Generate Recommendations"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AITaskRecommendations
