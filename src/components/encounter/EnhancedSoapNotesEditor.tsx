"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Mic,
  Save,
  Plus,
  Sparkles,
  FileText,
  Activity,
  Pill,
  Upload,
  AlertCircle,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Calculator,
  DollarSign,
  X,
  HelpCircle,
  User,
  Calendar,
  Phone,
  History,
  Eye,
} from "lucide-react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CustomQuestion {
  id: string
  question: string
  answer: string
}

interface VitalsData {
  height: string
  weight: string
  temperature: string
  pulse: string
  respiratoryRate: string
  o2Saturation: string
  bmi: string
  bloodPressureSystolic: string
  bloodPressureDiastolic: string
  painScale: string
}

interface MedicationData {
  id: string
  name: string
  dosage: string
  frequency: string
  route: string
  status: "active" | "discontinued" | "held"
}

interface DocumentData {
  id: string
  name: string
  type: string
  uploadDate: string
  size: string
}

interface SoapNotesData {
  subjective: string
  objective: string
  assessment: string
  plan: string
  subjectiveQuestions: CustomQuestion[]
  objectiveQuestions: CustomQuestion[]
  assessmentQuestions: CustomQuestion[]
  planQuestions: CustomQuestion[]
}

interface BillingCodes {
  icd10Codes: string[]
  primaryCpt: string
  secondaryCpts: string[]
}

interface EncounterData {
  chiefComplaint: string
  healthConcerns: string[]
  vitals: VitalsData
  medications: MedicationData[]
  documents: DocumentData[]
  soapNotes: SoapNotesData
  billingCodes: BillingCodes
}

interface PastEncounter {
  id: string
  date: string
  type: string
  provider: string
  chiefComplaint: string
  diagnosis: string[]
  status: "completed" | "in-progress" | "cancelled"
}

interface CompletePastEncounter {
  id: string
  date: string
  type: string
  provider: string
  chiefComplaint: string
  diagnosis: string[]
  status: "completed" | "in-progress" | "cancelled"
  vitals: VitalsData
  medications: MedicationData[]
  documents: DocumentData[]
  soapNotes: SoapNotesData
  billingCodes: BillingCodes
  healthConcerns: string[]
  duration: string
  location: string
}

interface AppointmentData {
  id: number
  patient: {
    id: string
    name: string
    phone: string
    email: string
  }
  date: string
  duration: string
  type: string
  status: string
  hasBilling: boolean
  providerId: string
  locationId: string
  reason: string
  template: {
    template_id: number
    encounter_name: string
    encounter_type: string
    visit_type: string
    is_default: number
    is_active: number
    soap_structure: {
      plan: string
      objective: string
      assessment: string
      subjective: string
    }
    billing_codes: {
      icd10Codes: string[]
      primaryCpt: string
      secondaryCpts: string[]
    }
    created_by: number
    created: string
  }
}

// Enhanced Rich Text Editor Component with better focus management
const RichTextEditor: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder: string
  height?: string
}> = ({ value, onChange, placeholder, height = "300px" }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const quillRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        recognitionInstance.onstart = () => {
          setIsRecording(true)
          setIsProcessing(false)
          setCurrentTranscript("")
        }

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setCurrentTranscript(finalTranscript + interimTranscript)

          if (finalTranscript) {
            const currentContent = value || ""
            const newContent = currentContent + (currentContent ? " " : "") + finalTranscript
            onChange(newContent)
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsRecording(false)
          setIsProcessing(false)
          setCurrentTranscript("")
        }

        recognitionInstance.onend = () => {
          setIsRecording(false)
          setIsProcessing(false)
          setCurrentTranscript("")
        }

        setRecognition(recognitionInstance)
        setIsSupported(true)
      } else {
        setIsSupported(false)
      }
    }
  }, [value, onChange])

  const startVoiceRecording = () => {
    if (recognition && !isRecording) {
      try {
        recognition.start()
        setIsProcessing(true)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
      }
    }
  }

  const stopVoiceRecording = () => {
    if (recognition && isRecording) {
      recognition.stop()
      setIsProcessing(true)
    }
  }

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["link"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"],
      ],
    }),
    [],
  )

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "color",
    "background",
    "align",
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex flex-wrap items-center gap-3">
          {isSupported ? (
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startVoiceRecording}
                  disabled={isProcessing}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm transition-all duration-200"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{isProcessing ? "Starting..." : "Start Recording"}</span>
                  <span className="sm:hidden">Voice</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={stopVoiceRecording}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300 animate-pulse shadow-sm"
                >
                  <div className="h-4 w-4 mr-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Stop Recording</span>
                  <span className="sm:hidden">Stop</span>
                </Button>
              )}
              {isRecording && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Recording...</span>
                  {currentTranscript && (
                    <span className="text-blue-600 italic bg-blue-50 px-2 py-1 rounded text-xs max-w-32 truncate">
                      "{currentTranscript.slice(-20)}..."
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <span className="hidden sm:inline">Voice input not supported in this browser</span>
              <span className="sm:hidden">Voice not supported</span>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(value + "\n\n**Template:** [Add common template text here]")}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300 shadow-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Quick Template</span>
            <span className="sm:hidden">Template</span>
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm" style={{ height }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{ height: `calc(${height} - 42px)` }}
        />
      </div>
    </div>
  )
}

// Enhanced Voice Input Component with better focus management
const VoiceInput: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  rows?: number
}> = ({ value, onChange, placeholder, className, rows = 3 }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        recognitionInstance.onstart = () => {
          setIsRecording(true)
          setIsProcessing(false)
          setCurrentTranscript("")
        }

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setCurrentTranscript(finalTranscript + interimTranscript)

          if (finalTranscript) {
            const currentContent = value || ""
            const newContent = currentContent + (currentContent ? " " : "") + finalTranscript
            onChange(newContent)
            // Maintain focus on textarea after voice input
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.focus()
                textareaRef.current.setSelectionRange(newContent.length, newContent.length)
              }
            }, 100)
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsRecording(false)
          setIsProcessing(false)
          setCurrentTranscript("")
        }

        recognitionInstance.onend = () => {
          setIsRecording(false)
          setIsProcessing(false)
          setCurrentTranscript("")
        }

        setRecognition(recognitionInstance)
        setIsSupported(true)
      } else {
        setIsSupported(false)
      }
    }
  }, [value, onChange])

  const startVoiceRecording = () => {
    if (recognition && !isRecording) {
      try {
        recognition.start()
        setIsProcessing(true)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
      }
    }
  }

  const stopVoiceRecording = () => {
    if (recognition && isRecording) {
      recognition.stop()
      setIsProcessing(true)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {isSupported ? (
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startVoiceRecording}
                disabled={isProcessing}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm"
              >
                <Mic className="h-3 w-3 mr-1" />
                {isProcessing ? "Starting..." : "Voice"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stopVoiceRecording}
                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300 animate-pulse shadow-sm"
              >
                <div className="h-3 w-3 mr-1 bg-red-500 rounded-full animate-pulse"></div>
                Stop
              </Button>
            )}
            {isRecording && currentTranscript && (
              <div className="flex items-center gap-1 text-blue-600 text-xs italic bg-blue-50 px-2 py-1 rounded max-w-32 truncate">
                "{currentTranscript.slice(-15)}..."
              </div>
            )}
          </div>
        ) : null}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${className}`}
      />
    </div>
  )
}

// Enhanced Custom Questions Component
const CustomQuestionsSection: React.FC<{
  questions: CustomQuestion[]
  onQuestionsChange: (questions: CustomQuestion[]) => void
  sectionTitle: string
}> = ({ questions, onQuestionsChange, sectionTitle }) => {
  const [newQuestion, setNewQuestion] = useState("")

  const addQuestion = () => {
    if (newQuestion.trim()) {
      const question: CustomQuestion = {
        id: Date.now().toString(),
        question: newQuestion.trim(),
        answer: "",
      }
      onQuestionsChange([...questions, question])
      setNewQuestion("")
    }
  }

  const updateQuestion = (id: string, field: "question" | "answer", value: string) => {
    onQuestionsChange(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const removeQuestion = (id: string) => {
    onQuestionsChange(questions.filter((q) => q.id !== id))
  }

  const getSectionColor = (section: string) => {
    switch (section.toLowerCase()) {
      case "subjective":
        return "emerald"
      case "objective":
        return "blue"
      case "assessment":
        return "amber"
      case "plan":
        return "purple"
      default:
        return "gray"
    }
  }

  const color = getSectionColor(sectionTitle)

  return (
    <div className="space-y-6">
      <div
        className={`flex items-center gap-3 p-4 bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-lg border border-${color}-200 shadow-sm`}
      >
        <HelpCircle className={`h-5 w-5 text-${color}-600 flex-shrink-0`} />
        <Label className={`text-base font-semibold text-${color}-700`}>Custom Questions for {sectionTitle}</Label>
      </div>

      {/* Add new question */}
      <div
        className={`p-4 sm:p-6 bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-xl border border-${color}-200 shadow-sm`}
      >
        <div className="space-y-4">
          <Label className={`text-sm font-medium text-${color}-700`}>Add New Question</Label>
          <VoiceInput
            value={newQuestion}
            onChange={setNewQuestion}
            placeholder={`Add a custom question for ${sectionTitle.toLowerCase()}...`}
            rows={2}
          />
          <Button
            onClick={addQuestion}
            size="sm"
            className={`bg-${color}-600 hover:bg-${color}-700 text-white shadow-sm w-full sm:w-auto`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Display existing questions */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="p-4 sm:p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Question {index + 1}:</Label>
                <VoiceInput
                  value={q.question}
                  onChange={(value) => updateQuestion(q.id, "question", value)}
                  placeholder="Enter your question..."
                  rows={2}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(q.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg self-start"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">Answer:</Label>
              <VoiceInput
                value={q.answer}
                onChange={(value) => updateQuestion(q.id, "answer", value)}
                placeholder="Enter your answer here..."
                rows={3}
              />
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <HelpCircle className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-base sm:text-lg font-medium">No custom questions added yet.</p>
            <p className="text-sm mt-2">Add questions specific to this {sectionTitle.toLowerCase()} section.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced Billing Section Component
const BillingSection: React.FC<{
  billingCodes: BillingCodes
  onBillingCodesChange: (codes: BillingCodes) => void
}> = ({ billingCodes, onBillingCodesChange }) => {
  const [newIcd10, setNewIcd10] = useState("")
  const [newSecondaryCpt, setNewSecondaryCpt] = useState("")

  const addIcd10Code = () => {
    if (newIcd10.trim()) {
      onBillingCodesChange({
        ...billingCodes,
        icd10Codes: [...billingCodes.icd10Codes, newIcd10.trim()],
      })
      setNewIcd10("")
    }
  }

  const removeIcd10Code = (index: number) => {
    onBillingCodesChange({
      ...billingCodes,
      icd10Codes: billingCodes.icd10Codes.filter((_, i) => i !== index),
    })
  }

  const addSecondaryCpt = () => {
    if (newSecondaryCpt.trim()) {
      onBillingCodesChange({
        ...billingCodes,
        secondaryCpts: [...billingCodes.secondaryCpts, newSecondaryCpt.trim()],
      })
      setNewSecondaryCpt("")
    }
  }

  const removeSecondaryCpt = (index: number) => {
    onBillingCodesChange({
      ...billingCodes,
      secondaryCpts: billingCodes.secondaryCpts.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Label className="text-base font-semibold text-gray-700 mb-3 block">Primary CPT Code</Label>
          <Input
            value={billingCodes.primaryCpt}
            onChange={(e) =>
              onBillingCodesChange({
                ...billingCodes,
                primaryCpt: e.target.value,
              })
            }
            placeholder="99213"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="lg:col-span-2">
          <Label className="text-base font-semibold text-gray-700 mb-3 block">ICD-10 Diagnosis Codes</Label>
          <div className="flex gap-2 mb-4">
            <Input
              value={newIcd10}
              onChange={(e) => setNewIcd10(e.target.value)}
              placeholder="Z00.00"
              onKeyPress={(e) => e.key === "Enter" && addIcd10Code()}
              className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button onClick={addIcd10Code} className="bg-blue-600 hover:bg-blue-700 shadow-sm flex-shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {billingCodes.icd10Codes.map((code, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1 text-sm font-mono bg-blue-100 text-blue-800 border border-blue-300"
              >
                {code}
                <button
                  onClick={() => removeIcd10Code(index)}
                  className="ml-1 text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold text-gray-700 mb-3 block">Secondary CPT Codes</Label>
        <div className="flex gap-2 mb-4">
          <Input
            value={newSecondaryCpt}
            onChange={(e) => setNewSecondaryCpt(e.target.value)}
            placeholder="99214"
            onKeyPress={(e) => e.key === "Enter" && addSecondaryCpt()}
            className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button onClick={addSecondaryCpt} className="bg-green-600 hover:bg-green-700 shadow-sm flex-shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {billingCodes.secondaryCpts.map((code, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex items-center gap-2 px-3 py-1 text-sm font-mono bg-green-50 text-green-800 border border-green-300"
            >
              {code}
              <button
                onClick={() => removeSecondaryCpt(index)}
                className="ml-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Past Encounters Component with detailed view
const PastEncountersPanel: React.FC<{
  patientId: string
  patientName: string
}> = ({ patientId, patientName }) => {
  const [selectedEncounter, setSelectedEncounter] = useState<CompletePastEncounter | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)

  // Mock complete past encounters data
  const completePastEncounters: CompletePastEncounter[] = [
    {
      id: "1",
      date: "2024-01-10T14:30:00Z",
      type: "Follow-up",
      provider: "Dr. Smith",
      chiefComplaint: "Follow-up for hypertension management and medication review",
      diagnosis: ["Essential hypertension", "Type 2 diabetes mellitus"],
      status: "completed",
      duration: "30 minutes",
      location: "Main Clinic - Room 205",
      vitals: {
        height: "70",
        weight: "180",
        temperature: "98.6",
        pulse: "78",
        respiratoryRate: "16",
        o2Saturation: "98",
        bmi: "25.8",
        bloodPressureSystolic: "135",
        bloodPressureDiastolic: "85",
        painScale: "2",
      },
      medications: [
        {
          id: "med1",
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          route: "Oral",
          status: "active",
        },
        {
          id: "med2",
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          route: "Oral",
          status: "active",
        },
      ],
      documents: [
        {
          id: "doc1",
          name: "Lab Results - Comprehensive Metabolic Panel",
          type: "Lab Report",
          uploadDate: "2024-01-10",
          size: "245 KB",
        },
        {
          id: "doc2",
          name: "EKG Report",
          type: "Diagnostic Report",
          uploadDate: "2024-01-10",
          size: "180 KB",
        },
      ],
      soapNotes: {
        subjective:
          "Patient reports feeling well overall. Blood pressure has been stable at home readings averaging 130/80. No chest pain, shortness of breath, or palpitations. Diabetes well controlled with current regimen. Patient compliant with medications and dietary modifications.",
        objective:
          "Vital signs stable. Physical examination reveals no acute distress. Heart rate regular, no murmurs. Lungs clear bilaterally. Extremities without edema. Recent lab work shows HbA1c of 6.8%, creatinine 1.1 mg/dL.",
        assessment:
          "1. Essential hypertension - well controlled on current regimen\n2. Type 2 diabetes mellitus - good glycemic control\n3. Patient demonstrates good medication compliance and lifestyle modifications",
        plan: "1. Continue current antihypertensive therapy with Lisinopril 10mg daily\n2. Continue Metformin 500mg twice daily\n3. Follow-up in 3 months\n4. Continue home blood pressure monitoring\n5. Annual ophthalmologic examination scheduled\n6. Repeat HbA1c in 3 months",
        subjectiveQuestions: [
          {
            id: "sq1",
            question: "How has your energy level been since the last visit?",
            answer: "Energy levels have been good, no significant fatigue or weakness reported.",
          },
        ],
        objectiveQuestions: [
          {
            id: "oq1",
            question: "Any signs of diabetic complications on examination?",
            answer: "No signs of diabetic retinopathy, neuropathy, or nephropathy on current examination.",
          },
        ],
        assessmentQuestions: [
          {
            id: "aq1",
            question: "Risk stratification for cardiovascular disease?",
            answer: "Low to moderate risk given controlled hypertension and diabetes with good compliance.",
          },
        ],
        planQuestions: [
          {
            id: "pq1",
            question: "Patient education topics covered?",
            answer: "Reviewed importance of medication compliance, dietary modifications, and regular monitoring.",
          },
        ],
      },
      billingCodes: {
        primaryCpt: "99213",
        secondaryCpts: ["36415"],
        icd10Codes: ["I10", "E11.9"],
      },
      healthConcerns: ["Hypertension management", "Diabetes control", "Cardiovascular risk reduction"],
    },
    {
      id: "2",
      date: "2023-12-15T10:00:00Z",
      type: "Annual Physical",
      provider: "Dr. Johnson",
      chiefComplaint: "Annual wellness visit and preventive care screening",
      diagnosis: ["Routine health maintenance", "Hyperlipidemia"],
      status: "completed",
      duration: "45 minutes",
      location: "Main Clinic - Room 101",
      vitals: {
        height: "70",
        weight: "175",
        temperature: "98.4",
        pulse: "72",
        respiratoryRate: "14",
        o2Saturation: "99",
        bmi: "25.1",
        bloodPressureSystolic: "128",
        bloodPressureDiastolic: "82",
        painScale: "0",
      },
      medications: [
        {
          id: "med3",
          name: "Atorvastatin",
          dosage: "20mg",
          frequency: "Once daily",
          route: "Oral",
          status: "active",
        },
      ],
      documents: [
        {
          id: "doc3",
          name: "Annual Physical Exam Summary",
          type: "Clinical Summary",
          uploadDate: "2023-12-15",
          size: "320 KB",
        },
        {
          id: "doc4",
          name: "Lipid Panel Results",
          type: "Lab Report",
          uploadDate: "2023-12-15",
          size: "156 KB",
        },
      ],
      soapNotes: {
        subjective:
          "Patient presents for annual wellness visit. Reports feeling well with no acute complaints. Exercises regularly, follows heart-healthy diet. No family history changes. Up to date with preventive screenings.",
        objective:
          "Well-appearing adult in no acute distress. Complete physical examination performed including cardiovascular, pulmonary, abdominal, and neurological systems. All within normal limits. Recent lipid panel shows improvement.",
        assessment:
          "1. Annual wellness visit - comprehensive examination completed\n2. Hyperlipidemia - improved on current statin therapy\n3. Overall health status excellent",
        plan: "1. Continue current preventive care measures\n2. Continue atorvastatin 20mg daily\n3. Routine cancer screenings up to date\n4. Follow-up in 12 months for next annual visit\n5. Contact office for any acute concerns",
        subjectiveQuestions: [],
        objectiveQuestions: [],
        assessmentQuestions: [],
        planQuestions: [],
      },
      billingCodes: {
        primaryCpt: "99395",
        secondaryCpts: ["80061"],
        icd10Codes: ["Z00.00", "E78.5"],
      },
      healthConcerns: ["Preventive care", "Cholesterol management"],
    },
    {
      id: "3",
      date: "2023-11-20T16:15:00Z",
      type: "Urgent Care",
      provider: "Dr. Williams",
      chiefComplaint: "Upper respiratory symptoms with cough and congestion for 5 days",
      diagnosis: ["Acute upper respiratory infection", "Acute bronchitis"],
      status: "completed",
      duration: "20 minutes",
      location: "Urgent Care Center",
      vitals: {
        height: "70",
        weight: "178",
        temperature: "100.2",
        pulse: "88",
        respiratoryRate: "18",
        o2Saturation: "97",
        bmi: "25.5",
        bloodPressureSystolic: "140",
        bloodPressureDiastolic: "88",
        painScale: "3",
      },
      medications: [
        {
          id: "med4",
          name: "Azithromycin",
          dosage: "250mg",
          frequency: "Once daily",
          route: "Oral",
          status: "discontinued",
        },
        {
          id: "med5",
          name: "Dextromethorphan",
          dosage: "15mg",
          frequency: "As needed",
          route: "Oral",
          status: "discontinued",
        },
      ],
      documents: [
        {
          id: "doc5",
          name: "Chest X-ray Report",
          type: "Radiology Report",
          uploadDate: "2023-11-20",
          size: "89 KB",
        },
      ],
      soapNotes: {
        subjective:
          "Patient presents with 5-day history of productive cough, nasal congestion, and low-grade fever. Reports fatigue and decreased appetite. No shortness of breath or chest pain. Symptoms gradually worsening.",
        objective:
          "Temperature 100.2°F, appears mildly ill. HEENT: nasal congestion, erythematous throat. Lungs: scattered rhonchi, no wheezes or rales. Heart: regular rate and rhythm. Chest X-ray shows no acute infiltrates.",
        assessment:
          "Acute upper respiratory infection with bronchitis. Likely viral etiology but given duration and symptoms, bacterial superinfection possible.",
        plan: "1. Azithromycin 250mg daily x 5 days\n2. Dextromethorphan for cough suppression\n3. Supportive care with rest and fluids\n4. Return if symptoms worsen or persist beyond 10 days\n5. Follow-up with primary care provider as needed",
        subjectiveQuestions: [],
        objectiveQuestions: [],
        assessmentQuestions: [],
        planQuestions: [],
      },
      billingCodes: {
        primaryCpt: "99213",
        secondaryCpts: ["71045"],
        icd10Codes: ["J06.9", "J20.9"],
      },
      healthConcerns: ["Respiratory infection", "Symptom management"],
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleViewEncounter = (encounter: CompletePastEncounter) => {
    setSelectedEncounter(encounter)
    setIsDetailViewOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <History className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Past Encounters</h3>
            <p className="text-sm text-blue-600">
              {patientName} (ID: {patientId})
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {completePastEncounters.map((encounter) => (
            <Card key={encounter.id} className="hover:shadow-md transition-shadow duration-200 border-gray-200">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">{formatDate(encounter.date)}</span>
                      <Badge variant="outline" className={getStatusColor(encounter.status)}>
                        {encounter.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        <span className="font-medium">Type:</span>
                        <span>{encounter.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Provider:</span>
                        <span>{encounter.provider}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 bg-transparent"
                    onClick={() => handleViewEncounter(encounter)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Chief Complaint:</span>
                    <p className="text-sm text-gray-600 mt-1">{encounter.chiefComplaint}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Diagnosis:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {encounter.diagnosis.map((diag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {diag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Encounter View Dialog */}
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-6 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Past Encounter Details - {selectedEncounter?.type}
            </DialogTitle>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">
                {formatDate(selectedEncounter?.date || "")}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
                {selectedEncounter?.provider}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300">
                {selectedEncounter?.duration}
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300">
                {selectedEncounter?.location}
              </Badge>
            </div>
          </DialogHeader>

          {selectedEncounter && (
            <div className="space-y-8 p-2">
              {/* Chief Complaint */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Chief Complaint
                </h3>
                <p className="text-gray-700">{selectedEncounter.chiefComplaint}</p>
              </div>

              {/* Vitals */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Vitals
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{selectedEncounter.vitals.height}"</div>
                    <div className="text-sm text-gray-600">Height</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">{selectedEncounter.vitals.weight} lbs</div>
                    <div className="text-sm text-gray-600">Weight</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-red-600">{selectedEncounter.vitals.temperature}°F</div>
                    <div className="text-sm text-gray-600">Temperature</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">{selectedEncounter.vitals.pulse} bpm</div>
                    <div className="text-sm text-gray-600">Pulse</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-indigo-600">
                      {selectedEncounter.vitals.bloodPressureSystolic}/{selectedEncounter.vitals.bloodPressureDiastolic}
                    </div>
                    <div className="text-sm text-gray-600">Blood Pressure</div>
                  </div>
                </div>
              </div>

              {/* SOAP Notes */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-indigo-600" />
                  SOAP Notes
                </h3>

                {/* Subjective */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-4 text-lg flex items-center gap-2">
                    <div className="h-6 w-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      S
                    </div>
                    Subjective
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-emerald-200 whitespace-pre-wrap text-sm">
                    {selectedEncounter.soapNotes.subjective}
                  </div>
                  {selectedEncounter.soapNotes.subjectiveQuestions.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-emerald-700 mb-3">Custom Questions:</h5>
                      {selectedEncounter.soapNotes.subjectiveQuestions.map((q, index) => (
                        <div key={q.id} className="bg-emerald-25 p-3 rounded-lg border-l-4 border-emerald-400 mb-3">
                          <p className="font-semibold text-sm text-emerald-800">
                            Q{index + 1}: {q.question}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Objective */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center gap-2">
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      O
                    </div>
                    Objective
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-blue-200 whitespace-pre-wrap text-sm">
                    {selectedEncounter.soapNotes.objective}
                  </div>
                  {selectedEncounter.soapNotes.objectiveQuestions.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-blue-700 mb-3">Custom Questions:</h5>
                      {selectedEncounter.soapNotes.objectiveQuestions.map((q, index) => (
                        <div key={q.id} className="bg-blue-25 p-3 rounded-lg border-l-4 border-blue-400 mb-3">
                          <p className="font-semibold text-sm text-blue-800">
                            Q{index + 1}: {q.question}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assessment */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-4 text-lg flex items-center gap-2">
                    <div className="h-6 w-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      A
                    </div>
                    Assessment
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-amber-200 whitespace-pre-wrap text-sm">
                    {selectedEncounter.soapNotes.assessment}
                  </div>
                  {selectedEncounter.soapNotes.assessmentQuestions.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-amber-700 mb-3">Custom Questions:</h5>
                      {selectedEncounter.soapNotes.assessmentQuestions.map((q, index) => (
                        <div key={q.id} className="bg-amber-25 p-3 rounded-lg border-l-4 border-amber-400 mb-3">
                          <p className="font-semibold text-sm text-amber-800">
                            Q{index + 1}: {q.question}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plan */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-4 text-lg flex items-center gap-2">
                    <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      P
                    </div>
                    Plan
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-purple-200 whitespace-pre-wrap text-sm">
                    {selectedEncounter.soapNotes.plan}
                  </div>
                  {selectedEncounter.soapNotes.planQuestions.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-purple-700 mb-3">Custom Questions:</h5>
                      {selectedEncounter.soapNotes.planQuestions.map((q, index) => (
                        <div key={q.id} className="bg-purple-25 p-3 rounded-lg border-l-4 border-purple-400 mb-3">
                          <p className="font-semibold text-sm text-purple-800">
                            Q{index + 1}: {q.question}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Medications */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medications
                </h3>
                <div className="space-y-3">
                  {selectedEncounter.medications.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{med.name}</div>
                        <div className="text-sm text-gray-600">
                          {med.dosage} • {med.frequency} • {med.route}
                        </div>
                      </div>
                      <Badge
                        variant={med.status === "active" ? "default" : "secondary"}
                        className={
                          med.status === "active"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                        }
                      >
                        {med.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documents
                </h3>
                <div className="space-y-3">
                  {selectedEncounter.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-purple-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-600">
                            {doc.type} • {doc.size} • {doc.uploadDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Concerns */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Health Concerns
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEncounter.healthConcerns.map((concern, index) => (
                    <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Billing Codes */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Billing Codes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-gray-600 mb-2">Primary CPT</div>
                    <div className="text-lg font-mono font-bold text-green-700">
                      {selectedEncounter.billingCodes.primaryCpt}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-gray-600 mb-2">Secondary CPTs</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedEncounter.billingCodes.secondaryCpts.map((code, index) => (
                        <Badge key={index} variant="outline" className="font-mono text-xs">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-gray-600 mb-2">ICD-10 Codes</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedEncounter.billingCodes.icd10Codes.map((code, index) => (
                        <Badge key={index} variant="secondary" className="font-mono text-xs">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

interface EnhancedEncounterManagementProps {
  appointment: AppointmentData
}

export default function EnhancedEncounterManagement({ appointment }: EnhancedEncounterManagementProps) {
  console.log("HELLO MITRA", appointment)

  // Initialize encounter data using the appointment prop
  const [encounterData, setEncounterData] = useState<EncounterData>({
    chiefComplaint: appointment.reason || "",
    healthConcerns: [],
    vitals: {
      height: "",
      weight: "",
      temperature: "",
      pulse: "",
      respiratoryRate: "",
      o2Saturation: "",
      bmi: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      painScale: "",
    },
    medications: [],
    documents: [],
    soapNotes: {
      subjective: appointment.template?.soap_structure.subjective || "",
      objective: appointment?.template?.soap_structure.objective || "",
      assessment: appointment?.template?.soap_structure.assessment || "",
      plan: appointment.template.soap_structure.plan || "",
      subjectiveQuestions: [],
      objectiveQuestions: [],
      assessmentQuestions: [],
      planQuestions: [],
    },
    billingCodes: {
      icd10Codes: appointment.template?.billing_codes?.icd10Codes ? [...appointment.template.billing_codes.icd10Codes] : [],
      primaryCpt: appointment.template?.billing_codes?.primaryCpt || "",
      secondaryCpts: appointment.template?.billing_codes?.secondaryCpts ? [...appointment.template.billing_codes.secondaryCpts] : [],
    },
  })

  const [newHealthConcern, setNewHealthConcern] = useState("")

  // Refs for vitals inputs to maintain focus
  const vitalsRefs = {
    height: useRef<HTMLInputElement>(null),
    weight: useRef<HTMLInputElement>(null),
    temperature: useRef<HTMLInputElement>(null),
    pulse: useRef<HTMLInputElement>(null),
    respiratoryRate: useRef<HTMLInputElement>(null),
    o2Saturation: useRef<HTMLInputElement>(null),
    bloodPressureSystolic: useRef<HTMLInputElement>(null),
    bloodPressureDiastolic: useRef<HTMLInputElement>(null),
    painScale: useRef<HTMLInputElement>(null),
  }

  const calculateBMI = () => {
    const height = Number.parseFloat(encounterData.vitals.height)
    const weight = Number.parseFloat(encounterData.vitals.weight)
    if (height && weight) {
      const heightInMeters = height * 0.0254
      const bmi = (weight * 0.453592) / (heightInMeters * heightInMeters)
      setEncounterData((prev) => ({
        ...prev,
        vitals: { ...prev.vitals, bmi: bmi.toFixed(1) },
      }))
    }
  }

  const addHealthConcern = () => {
    if (newHealthConcern.trim()) {
      setEncounterData((prev) => ({
        ...prev,
        healthConcerns: [...prev.healthConcerns, newHealthConcern.trim()],
      }))
      setNewHealthConcern("")
    }
  }

  const removeHealthConcern = (index: number) => {
    setEncounterData((prev) => ({
      ...prev,
      healthConcerns: prev.healthConcerns.filter((_, i) => i !== index),
    }))
  }

  const addMedication = () => {
    const newMed: MedicationData = {
      id: Date.now().toString(),
      name: "",
      dosage: "",
      frequency: "",
      route: "Oral",
      status: "active",
    }
    setEncounterData((prev) => ({
      ...prev,
      medications: [...prev.medications, newMed],
    }))
  }

  const updateMedication = (id: string, field: keyof MedicationData, value: string) => {
    setEncounterData((prev) => ({
      ...prev,
      medications: prev.medications.map((med) => (med.id === id ? { ...med, [field]: value } : med)),
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Enhanced Vitals Section with better focus management
  const VitalsSection = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Ruler className="h-4 w-4 text-blue-600" />
            Height (inches)
          </Label>
          <Input
            ref={vitalsRefs.height}
            type="number"
            value={encounterData.vitals.height}
            onChange={(e) =>
              setEncounterData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, height: e.target.value },
              }))
            }
            onFocus={(e) => e.target.select()}
            placeholder="70"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Weight className="h-4 w-4 text-green-600" />
            Weight (lbs)
          </Label>
          <Input
            ref={vitalsRefs.weight}
            type="number"
            value={encounterData.vitals.weight}
            onChange={(e) =>
              setEncounterData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, weight: e.target.value },
              }))
            }
            onFocus={(e) => e.target.select()}
            placeholder="150"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calculator className="h-4 w-4 text-purple-600" />
            BMI
          </Label>
          <div className="flex gap-2">
            <Input
              value={encounterData.vitals.bmi}
              readOnly
              placeholder="Auto-calculated"
              className="bg-gray-50 text-lg font-mono border-gray-300"
            />
            <Button onClick={calculateBMI} size="sm" className="bg-purple-600 hover:bg-purple-700 shadow-sm">
              <Calculator className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Thermometer className="h-4 w-4 text-red-600" />
            Temperature (°F)
          </Label>
          <Input
            ref={vitalsRefs.temperature}
            type="number"
            step="0.1"
            value={encounterData.vitals.temperature}
            onChange={(e) =>
              setEncounterData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, temperature: e.target.value },
              }))
            }
            onFocus={(e) => e.target.select()}
            placeholder="98.6"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Heart className="h-4 w-4 text-red-600" />
            Pulse (bpm)
          </Label>
          <Input
            ref={vitalsRefs.pulse}
            type="number"
            value={encounterData.vitals.pulse}
            onChange={(e) =>
              setEncounterData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, pulse: e.target.value },
              }))
            }
            onFocus={(e) => e.target.select()}
            placeholder="72"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity className="h-4 w-4 text-blue-600" />
            Respiratory Rate
          </Label>
          <Input
            ref={vitalsRefs.respiratoryRate}
            type="number"
            value={encounterData.vitals.respiratoryRate}
            onChange={(e) =>
              setEncounterData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, respiratoryRate: e.target.value },
              }))
            }
            onFocus={(e) => e.target.select()}
            placeholder="16"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity className="h-4 w-4 text-cyan-600" />
            O2 Saturation (%)
          </Label>
          <Input
            ref={vitalsRefs.o2Saturation}
            type="number"
            value={encounterData.vitals.o2Saturation}
            onChange={(e) =>
              setEncounterData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, o2Saturation: e.target.value },
              }))
            }
            onFocus={(e) => e.target.select()}
            placeholder="98"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Heart className="h-4 w-4 text-red-600" />
            BP Systolic
          </Label>
          <Input
            ref={vitalsRefs.bloodPressureSystolic}
            type="number"
            value={encounterData.vitals.bloodPressureSystolic}
            onChange={(e) =>
              setEncounterData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, bloodPressureSystolic: e.target.value },
              }))
            }
            onFocus={(e) => e.target.select()}
            placeholder="120"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Heart className="h-4 w-4 text-red-600" />
            BP Diastolic
          </Label>
          <Input
            ref={vitalsRefs.bloodPressureDiastolic}
            type="number"
            value={encounterData.vitals.bloodPressureDiastolic}
            onChange={(e) =>
              setEncounterData((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, bloodPressureDiastolic: e.target.value },
              }))
            }
            onFocus={(e) => e.target.select()}
            placeholder="80"
            className="text-lg font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Vitals Flowsheet - {appointment.patient.name}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  BP
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  HR
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Temp
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  RR
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  O2 Sat
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDate(appointment.date)}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {encounterData.vitals.bloodPressureSystolic && encounterData.vitals.bloodPressureDiastolic
                    ? `${encounterData.vitals.bloodPressureSystolic}/${encounterData.vitals.bloodPressureDiastolic}`
                    : "-"}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {encounterData.vitals.pulse || "-"}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {encounterData.vitals.temperature || "-"}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {encounterData.vitals.respiratoryRate || "-"}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {encounterData.vitals.o2Saturation || "-"}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {encounterData.vitals.weight || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-full mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
      {/* Enhanced Header Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-blue-50">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-gray-800">
              <FileText className="h-6 sm:h-7 w-6 sm:w-7 text-blue-600" />
              Patient Encounter Management
            </CardTitle>

            {/* Past Encounters Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm">
                  <History className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Past Encounters</span>
                  <span className="sm:hidden">History</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[500px] sm:max-w-[500px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    Past Encounters
                  </SheetTitle>
                  <SheetDescription>View previous encounters for this patient</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <PastEncountersPanel patientId={appointment.patient.id} patientName={appointment.patient.name} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Patient Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Patient</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{appointment.patient.name}</p>
                <p className="text-xs text-gray-500">ID: {appointment.patient.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Contact</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{appointment.patient.phone}</p>
                <p className="text-xs text-gray-500 truncate">{appointment.patient.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Appointment</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(appointment.date)}</p>
                <p className="text-xs text-gray-500">
                  {appointment.duration} min • {appointment.type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <FileText className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Template</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{appointment.template.encounter_name}</p>
                <p className="text-xs text-gray-500 truncate">{appointment.template.visit_type}</p>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap mt-4">
            <Badge variant="default" className="bg-blue-100 text-blue-800 border border-blue-300">
              {appointment.status}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-300">
              {appointment.template.encounter_type}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border border-purple-300">
              CPT: {appointment.template.billing_codes.primaryCpt}
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-800 border border-orange-300">
              ICD-10: {appointment.template.billing_codes.icd10Codes.join(", ")}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="chief-complaint" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-7 bg-white border border-gray-200 rounded-lg p-1 shadow-sm min-w-[700px]">
            <TabsTrigger
              value="chief-complaint"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Chief Complaint</span>
              <span className="sm:hidden">Chief</span>
            </TabsTrigger>
            <TabsTrigger
              value="vitals"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
            >
              Vitals
            </TabsTrigger>
            <TabsTrigger
              value="medications"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Medications</span>
              <span className="sm:hidden">Meds</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
            <TabsTrigger
              value="soap-notes"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
            >
              SOAP
            </TabsTrigger>
            <TabsTrigger
              value="health-concerns"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Health Concerns</span>
              <span className="sm:hidden">Health</span>
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm"
            >
              Billing
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chief-complaint">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-800">
                <AlertCircle className="h-5 sm:h-6 w-5 sm:w-6 text-red-600" />
                Chief Complaint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <RichTextEditor
                value={encounterData.chiefComplaint}
                onChange={(value) => setEncounterData((prev) => ({ ...prev, chiefComplaint: value }))}
                placeholder="Enter the patient's chief complaint or primary reason for today's visit..."
                height="350px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-800">
                <Activity className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                Vitals for this Encounter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <VitalsSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-800">
                  <Pill className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />
                  Current Medications
                </CardTitle>
                <Button onClick={addMedication} className="bg-green-600 hover:bg-green-700 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <div className="space-y-6">
                {encounterData.medications.map((med) => (
                  <div
                    key={med.id}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-4 sm:p-6 border border-gray-200 rounded-xl bg-white shadow-sm"
                  >
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="text-sm font-semibold text-gray-700">Medication Name</Label>
                      <Input
                        value={med.name}
                        onChange={(e) => updateMedication(med.id, "name", e.target.value)}
                        placeholder="Enter medication name"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Dosage</Label>
                      <Input
                        value={med.dosage}
                        onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                        placeholder="10mg"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Frequency</Label>
                      <Select
                        value={med.frequency}
                        onValueChange={(value) => updateMedication(med.id, "frequency", value)}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Once daily">Once daily</SelectItem>
                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                          <SelectItem value="Four times daily">Four times daily</SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Route</Label>
                      <Select value={med.route} onValueChange={(value) => updateMedication(med.id, "route", value)}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Oral">Oral</SelectItem>
                          <SelectItem value="IV">IV</SelectItem>
                          <SelectItem value="IM">IM</SelectItem>
                          <SelectItem value="Topical">Topical</SelectItem>
                          <SelectItem value="Inhaled">Inhaled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Status</Label>
                      <Select
                        value={med.status}
                        onValueChange={(value) => updateMedication(med.id, "status", value as any)}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                          <SelectItem value="held">Held</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Badge
                        variant={med.status === "active" ? "default" : "secondary"}
                        className={
                          med.status === "active"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                        }
                      >
                        {med.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {encounterData.medications.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Pill className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-base sm:text-lg font-medium">No medications added yet.</p>
                    <p className="text-sm mt-2">Add current medications for this patient.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-800">
                  <Upload className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
                  Documents Attached to Encounter
                </CardTitle>
                <Button className="bg-purple-600 hover:bg-purple-700 shadow-sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <div className="space-y-4">
                {encounterData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.type} • {doc.size} • Uploaded {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                {encounterData.documents.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Upload className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-base sm:text-lg font-medium">No documents uploaded yet.</p>
                    <p className="text-sm mt-2">Upload documents related to this encounter.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="soap-notes">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-800">
                <FileText className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-600" />
                SOAP Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8 space-y-8 sm:space-y-12">
              {/* Subjective Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    S
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-base sm:text-lg font-bold text-emerald-800">Subjective</Label>
                    <p className="text-sm text-emerald-600">Patient reports, symptoms, history of present illness</p>
                  </div>
                </div>
                <RichTextEditor
                  value={encounterData.soapNotes.subjective}
                  onChange={(value) =>
                    setEncounterData((prev) => ({
                      ...prev,
                      soapNotes: { ...prev.soapNotes, subjective: value },
                    }))
                  }
                  placeholder="Patient reports..."
                  height="350px"
                />

                <CustomQuestionsSection
                  questions={encounterData.soapNotes.subjectiveQuestions}
                  onQuestionsChange={(questions) =>
                    setEncounterData((prev) => ({
                      ...prev,
                      soapNotes: { ...prev.soapNotes, subjectiveQuestions: questions },
                    }))
                  }
                  sectionTitle="Subjective"
                />
              </div>

              <Separator className="my-6 sm:my-8" />

              {/* Objective Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    O
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-base sm:text-lg font-bold text-blue-800">Objective</Label>
                    <p className="text-sm text-blue-600">Physical exam findings, vital signs, test results</p>
                  </div>
                </div>
                <RichTextEditor
                  value={encounterData.soapNotes.objective}
                  onChange={(value) =>
                    setEncounterData((prev) => ({
                      ...prev,
                      soapNotes: { ...prev.soapNotes, objective: value },
                    }))
                  }
                  placeholder="Physical examination reveals..."
                  height="350px"
                />

                <CustomQuestionsSection
                  questions={encounterData.soapNotes.objectiveQuestions}
                  onQuestionsChange={(questions) =>
                    setEncounterData((prev) => ({
                      ...prev,
                      soapNotes: { ...prev.soapNotes, objectiveQuestions: questions },
                    }))
                  }
                  sectionTitle="Objective"
                />
              </div>

              <Separator className="my-6 sm:my-8" />

              {/* Assessment Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="h-8 w-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    A
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-base sm:text-lg font-bold text-amber-800">Assessment</Label>
                    <p className="text-sm text-amber-600">Diagnosis, clinical impression, differential diagnosis</p>
                  </div>
                </div>
                <RichTextEditor
                  value={encounterData.soapNotes.assessment}
                  onChange={(value) =>
                    setEncounterData((prev) => ({
                      ...prev,
                      soapNotes: { ...prev.soapNotes, assessment: value },
                    }))
                  }
                  placeholder="Clinical assessment..."
                  height="350px"
                />

                <CustomQuestionsSection
                  questions={encounterData.soapNotes.assessmentQuestions}
                  onQuestionsChange={(questions) =>
                    setEncounterData((prev) => ({
                      ...prev,
                      soapNotes: { ...prev.soapNotes, assessmentQuestions: questions },
                    }))
                  }
                  sectionTitle="Assessment"
                />
              </div>

              <Separator className="my-6 sm:my-8" />

              {/* Plan Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    P
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-base sm:text-lg font-bold text-purple-800">Plan</Label>
                    <p className="text-sm text-purple-600">Treatment plan, follow-up instructions, patient education</p>
                  </div>
                </div>
                <RichTextEditor
                  value={encounterData.soapNotes.plan}
                  onChange={(value) =>
                    setEncounterData((prev) => ({
                      ...prev,
                      soapNotes: { ...prev.soapNotes, plan: value },
                    }))
                  }
                  placeholder="Treatment plan..."
                  height="350px"
                />

                <CustomQuestionsSection
                  questions={encounterData.soapNotes.planQuestions}
                  onQuestionsChange={(questions) =>
                    setEncounterData((prev) => ({
                      ...prev,
                      soapNotes: { ...prev.soapNotes, planQuestions: questions },
                    }))
                  }
                  sectionTitle="Plan"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health-concerns">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-800">
                <AlertCircle className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-600" />
                Health Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={newHealthConcern}
                    onChange={(e) => setNewHealthConcern(e.target.value)}
                    placeholder="Add a health concern..."
                    onKeyPress={(e) => e.key === "Enter" && addHealthConcern()}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 flex-1"
                  />
                  <Button onClick={addHealthConcern} className="bg-yellow-600 hover:bg-yellow-700 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {encounterData.healthConcerns.map((concern, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm"
                    >
                      <span className="font-medium text-gray-800 flex-1">{concern}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHealthConcern(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 self-start sm:self-center"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {encounterData.healthConcerns.length === 0 && (
                    <div className="text-center py-8 sm:py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <AlertCircle className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-base sm:text-lg font-medium">No health concerns added yet.</p>
                      <p className="text-sm mt-2">Add any health concerns for this patient.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-800">
                <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />
                Billing Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <BillingSection
                billingCodes={encounterData.billingCodes}
                onBillingCodesChange={(codes) => setEncounterData((prev) => ({ ...prev, billingCodes: codes }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
        <Button
          variant="outline"
          className="px-6 sm:px-8 py-3 border-gray-300 hover:bg-gray-50 shadow-sm bg-transparent"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg">
          <FileText className="h-4 w-4 mr-2" />
          Complete Encounter
        </Button>
      </div>
    </div>
  )
}
