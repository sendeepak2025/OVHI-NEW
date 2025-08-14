"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  Save,
  Plus,
  Edit,
  Eye,
  FileText,
  Clock,
  User,
  Stethoscope,
  X,
  Mic,
  Sparkles,
  HelpCircle,
  Settings,
  Filter,
} from "lucide-react"
import {
  createEncounterTemplatePraticeAPI,
  updateEncounterTemplatePraticeAPI,
  getAllEncounterTemplatePraticeAPI,
} from "@/services/operations/auth"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

interface CustomQuestion {
  id: string
  question: string
  answer: string
}

interface EncounterTemplate {
  id: string
  name: string
  specialty: string
  visitType: string
  procedureType?: string
  careManagementType?: string
  soapStructure: {
    subjective: string
    objective: string
    assessment: string
    plan: string
    subjectiveQuestions?: CustomQuestion[]
    objectiveQuestions?: CustomQuestion[]
    assessmentQuestions?: CustomQuestion[]
    planQuestions?: CustomQuestion[]
  }
  billingCodes: {
    primaryCpt: string
    secondaryCpts: string[]
    icd10Codes: string[]
  }
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// Enhanced Rich Text Editor Component
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
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3">
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
                  {isProcessing ? "Starting..." : "Start Recording"}
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
                  Stop Recording
                </Button>
              )}
              {isRecording && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  Recording...
                  {currentTranscript && (
                    <span className="text-blue-600 italic bg-blue-50 px-2 py-1 rounded">
                      "{currentTranscript.slice(-30)}..."
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              Voice input not supported in this browser
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
            Quick Template
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm" style={{ height }}>
        <ReactQuill
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

// Enhanced Voice Input Component
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-1 text-blue-600 text-xs italic bg-blue-50 px-2 py-1 rounded">
                "{currentTranscript.slice(-20)}..."
              </div>
            )}
          </div>
        ) : null}
      </div>
      <Textarea
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
        <HelpCircle className={`h-5 w-5 text-${color}-600`} />
        <Label className={`text-base font-semibold text-${color}-700`}>Custom Questions for {sectionTitle}</Label>
      </div>

      {/* Add new question */}
      <div
        className={`p-6 bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-xl border border-${color}-200 shadow-sm`}
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
            className={`bg-${color}-600 hover:bg-${color}-700 text-white shadow-sm`}
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
            className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
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
                className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
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
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No custom questions added yet.</p>
            <p className="text-sm mt-2">Add questions specific to this {sectionTitle.toLowerCase()} section.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const SPECIALTIES = [
  "Primary Care",
  "Mental Health",
  "Neurology",
  "Urgent Care",
  "Cardiology",
  "Endocrinology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "OB/GYN",
]

const VISIT_TYPES = [
  "New Patient",
  "Established Patient",
  "Follow-up",
  "Annual/Preventive",
  "Urgent",
  "Telehealth",
  "Consultation",
]

const PROCEDURE_TYPES = ["Minor Procedure", "Pre-op", "Post-op", "Wound Care", "Injection/Immunization"]
const CARE_MANAGEMENT_TYPES = ["CCM Monthly", "RPM Monthly", "PCM Monthly", "TCM", "Medicare AWV"]

const EncounterTemplateSettings: React.FC = () => {
  const [templates, setTemplates] = useState<EncounterTemplate[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<EncounterTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useSelector((state: RootState) => state.auth)

  // Create template form state
  const [newTemplate, setNewTemplate] = useState<Partial<EncounterTemplate>>({
    name: "",
    specialty: "",
    visitType: "",
    procedureType: "",
    careManagementType: "",
    soapStructure: {
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      subjectiveQuestions: [],
      objectiveQuestions: [],
      assessmentQuestions: [],
      planQuestions: [],
    },
    billingCodes: {
      primaryCpt: "",
      secondaryCpts: [],
      icd10Codes: [],
    },
    isActive: true,
    isDefault: false,
  })
  const [secondaryCptInput, setSecondaryCptInput] = useState("")
  const [icd10Input, setIcd10Input] = useState("")

  // Edit template form state
  const [editTemplate, setEditTemplate] = useState<EncounterTemplate | null>(null)
  const [editSecondaryCptInput, setEditSecondaryCptInput] = useState("")
  const [editIcd10Input, setEditIcd10Input] = useState("")

  const fetchTemplatePractish = async () => {
    try {
      const response = await getAllEncounterTemplatePraticeAPI(token)
      console.log(response?.data)
      if (response?.success && Array.isArray(response.data)) {
        // Transform API response into required format
        const formattedTemplates = response.data.map((item, index) => ({
          name: item.encounter_name,
          specialty: item.encounter_type,
          visitType: item.visit_type,
          isActive: item.is_active === 1,
          isDefault: item.is_default === 1,
          soapStructure: {
            ...item.soap_structure,
            subjectiveQuestions: item.soap_structure.subjectiveQuestions || [],
            objectiveQuestions: item.soap_structure.objectiveQuestions || [],
            assessmentQuestions: item.soap_structure.assessmentQuestions || [],
            planQuestions: item.soap_structure.planQuestions || [],
          },
          billingCodes: item.billing_codes,
          createdAt: item.created,
          updatedAt: item.created,
          id: item?.template_id,
        }))
        setTemplates(formattedTemplates)
      } else {
        setTemplates([])
      }
    } catch (error) {
      console.error("Error fetching encounter templates:", error)
      setTemplates([])
    }
  }

  useEffect(() => {
    fetchTemplatePractish()
  }, [])

  const filteredTemplates =
    selectedSpecialty === "all" ? templates : templates.filter((t) => t.specialty === selectedSpecialty)

  const handlePreviewTemplate = (template: EncounterTemplate) => {
    setSelectedTemplate(template)
    setIsPreviewOpen(true)
  }

  const handleEditTemplate = (template: EncounterTemplate) => {
    setEditTemplate({ ...template })
    setSelectedTemplate(template)
    setIsEditOpen(true)
    console.log(template, "edit")
  }

  const handleSaveTemplate = async () => {
    if (!editTemplate) return

    // Validation
    if (!editTemplate.name || !editTemplate.specialty || !editTemplate.visitType) {
      toast.error("Please fill in all required fields")
      return
    }

    if (
      !editTemplate.soapStructure?.subjective ||
      !editTemplate.soapStructure?.objective ||
      !editTemplate.soapStructure?.assessment ||
      !editTemplate.soapStructure?.plan
    ) {
      toast.error("Please fill in all SOAP sections")
      return
    }

    if (!editTemplate.billingCodes?.primaryCpt) {
      toast.error("Please enter a primary CPT code")
      return
    }

    setIsLoading(true)
    try {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === editTemplate.id ? { ...editTemplate, updatedAt: new Date().toISOString() } : template,
        ),
      )
      await updateEncounterTemplatePraticeAPI(editTemplate, token)
      setIsEditOpen(false)
      setEditTemplate(null)
      toast.success("Template updated successfully")
    } catch (error) {
      toast.error("Failed to update template")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    // Validation
    if (!newTemplate.name || !newTemplate.specialty || !newTemplate.visitType) {
      toast.error("Please fill in all required fields")
      return
    }

    if (
      !newTemplate.soapStructure?.subjective ||
      !newTemplate.soapStructure?.objective ||
      !newTemplate.soapStructure?.assessment ||
      !newTemplate.soapStructure?.plan
    ) {
      toast.error("Please fill in all SOAP sections")
      return
    }

    if (!newTemplate.billingCodes?.primaryCpt) {
      toast.error("Please enter a primary CPT code")
      return
    }

    setIsLoading(true)
    try {
      const templateToAdd: EncounterTemplate = {
        id: `custom-${Date.now()}`,
        name: newTemplate.name!,
        specialty: newTemplate.specialty!,
        visitType: newTemplate.visitType!,
        procedureType: newTemplate.procedureType,
        careManagementType: newTemplate.careManagementType,
        soapStructure: newTemplate.soapStructure!,
        billingCodes: newTemplate.billingCodes!,
        isActive: newTemplate.isActive!,
        isDefault: newTemplate.isDefault!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await createEncounterTemplatePraticeAPI(templateToAdd, token)
      setTemplates((prev) => [...prev, templateToAdd])

      // Reset form
      setNewTemplate({
        name: "",
        specialty: "",
        visitType: "",
        procedureType: "",
        careManagementType: "",
        soapStructure: {
          subjective: "",
          objective: "",
          assessment: "",
          plan: "",
          subjectiveQuestions: [],
          objectiveQuestions: [],
          assessmentQuestions: [],
          planQuestions: [],
        },
        billingCodes: {
          primaryCpt: "",
          secondaryCpts: [],
          icd10Codes: [],
        },
        isActive: true,
        isDefault: false,
      })
      setSecondaryCptInput("")
      setIcd10Input("")
      setIsCreateOpen(false)
      toast.success("Template created successfully")
    } catch (error) {
      toast.error("Failed to create template")
    } finally {
      setIsLoading(false)
    }
  }

  const addSecondaryCpt = () => {
    if (secondaryCptInput.trim()) {
      setNewTemplate((prev) => ({
        ...prev,
        billingCodes: {
          ...prev.billingCodes!,
          secondaryCpts: [...(prev.billingCodes?.secondaryCpts || []), secondaryCptInput.trim()],
        },
      }))
      setSecondaryCptInput("")
    }
  }

  const removeSecondaryCpt = (index: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      billingCodes: {
        ...prev.billingCodes!,
        secondaryCpts: prev.billingCodes?.secondaryCpts?.filter((_, i) => i !== index) || [],
      },
    }))
  }

  const addIcd10Code = () => {
    if (icd10Input.trim()) {
      setNewTemplate((prev) => ({
        ...prev,
        billingCodes: {
          ...prev.billingCodes!,
          icd10Codes: [...(prev.billingCodes?.icd10Codes || []), icd10Input.trim()],
        },
      }))
      setIcd10Input("")
    }
  }

  const removeIcd10Code = (index: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      billingCodes: {
        ...prev.billingCodes!,
        icd10Codes: prev.billingCodes?.icd10Codes?.filter((_, i) => i !== index) || [],
      },
    }))
  }

  const addEditSecondaryCpt = () => {
    if (editSecondaryCptInput.trim() && editTemplate) {
      setEditTemplate((prev) =>
        prev
          ? {
              ...prev,
              billingCodes: {
                ...prev.billingCodes,
                secondaryCpts: [...prev.billingCodes.secondaryCpts, editSecondaryCptInput.trim()],
              },
            }
          : null,
      )
      setEditSecondaryCptInput("")
    }
  }

  const removeEditSecondaryCpt = (index: number) => {
    if (editTemplate) {
      setEditTemplate((prev) =>
        prev
          ? {
              ...prev,
              billingCodes: {
                ...prev.billingCodes,
                secondaryCpts: prev.billingCodes.secondaryCpts.filter((_, i) => i !== index),
              },
            }
          : null,
      )
    }
  }

  const addEditIcd10Code = () => {
    if (editIcd10Input.trim() && editTemplate) {
      setEditTemplate((prev) =>
        prev
          ? {
              ...prev,
              billingCodes: {
                ...prev.billingCodes,
                icd10Codes: [...prev.billingCodes.icd10Codes, editIcd10Input.trim()],
              },
            }
          : null,
      )
      setEditIcd10Input("")
    }
  }

  const removeEditIcd10Code = (index: number) => {
    if (editTemplate) {
      setEditTemplate((prev) =>
        prev
          ? {
              ...prev,
              billingCodes: {
                ...prev.billingCodes,
                icd10Codes: prev.billingCodes.icd10Codes.filter((_, i) => i !== index),
              },
            }
          : null,
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Encounter Templates</h1>
            <p className="text-lg text-gray-600">Create and manage your clinical documentation templates</p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg px-8 py-3 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Template
          </Button>
        </div>

        {/* Enhanced Filter Controls */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-blue-600" />
                <Label className="text-base font-semibold text-gray-700">Filter Templates</Label>
              </div>
              <div className="space-y-2">
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-[250px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
            >
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </CardTitle>
                  {template.isDefault && (
                    <Badge variant="default" className="bg-blue-100 text-blue-800 border border-blue-300 font-semibold">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-medium">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {template.specialty}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 border border-purple-300 font-medium"
                  >
                    <User className="h-3 w-3 mr-1" />
                    {template.visitType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Primary CPT:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                      {template.billingCodes.primaryCpt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Last updated:</span>
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex-1 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 border-gray-300 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border-0 max-w-md mx-auto">
              <Settings className="h-16 w-16 mx-auto mb-6 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-6">
                {selectedSpecialty === "all"
                  ? "Create your first encounter template to get started."
                  : `No templates found for ${selectedSpecialty}. Try a different specialty or create a new template.`}
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        )}

        {/* Create Template Dialog - Enhanced */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
            <DialogHeader className="pb-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Plus className="h-6 w-6 text-blue-600" />
                Create New Template
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-8 p-2">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="template-name" className="text-sm font-semibold text-gray-700">
                      Template Name *
                    </Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name || ""}
                      onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="specialty" className="text-sm font-semibold text-gray-700">
                      Specialty *
                    </Label>
                    <Select
                      value={newTemplate.specialty || ""}
                      onValueChange={(value) => setNewTemplate((prev) => ({ ...prev, specialty: value }))}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="visit-type" className="text-sm font-semibold text-gray-700">
                      Visit Type *
                    </Label>
                    <Select
                      value={newTemplate.visitType || ""}
                      onValueChange={(value) => setNewTemplate((prev) => ({ ...prev, visitType: value }))}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select visit type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="procedure-type" className="text-sm font-semibold text-gray-700">
                      Procedure Type (Optional)
                    </Label>
                    <Select
                      value={newTemplate.procedureType || ""}
                      onValueChange={(value) => setNewTemplate((prev) => ({ ...prev, procedureType: value }))}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select procedure type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROCEDURE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SOAP Structure with Rich Text Editor and Custom Questions */}
              <div className="space-y-8">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-indigo-600" />
                  SOAP Structure
                </h3>

                {/* Subjective Section */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div>
                      <Label className="text-lg font-bold text-emerald-800">Subjective *</Label>
                      <p className="text-sm text-emerald-600">Patient reports, symptoms, history of present illness</p>
                    </div>
                  </div>
                  <RichTextEditor
                    value={newTemplate.soapStructure?.subjective || ""}
                    onChange={(value) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        soapStructure: {
                          ...prev.soapStructure!,
                          subjective: value,
                        },
                      }))
                    }
                    placeholder="Enter subjective template content..."
                    height="300px"
                  />
                  <div className="mt-6">
                    <CustomQuestionsSection
                      questions={newTemplate.soapStructure?.subjectiveQuestions || []}
                      onQuestionsChange={(questions) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          soapStructure: {
                            ...prev.soapStructure!,
                            subjectiveQuestions: questions,
                          },
                        }))
                      }
                      sectionTitle="Subjective"
                    />
                  </div>
                </div>

                {/* Objective Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      O
                    </div>
                    <div>
                      <Label className="text-lg font-bold text-blue-800">Objective *</Label>
                      <p className="text-sm text-blue-600">Physical exam findings, vital signs, test results</p>
                    </div>
                  </div>
                  <RichTextEditor
                    value={newTemplate.soapStructure?.objective || ""}
                    onChange={(value) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        soapStructure: {
                          ...prev.soapStructure!,
                          objective: value,
                        },
                      }))
                    }
                    placeholder="Enter objective template content..."
                    height="300px"
                  />
                  <div className="mt-6">
                    <CustomQuestionsSection
                      questions={newTemplate.soapStructure?.objectiveQuestions || []}
                      onQuestionsChange={(questions) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          soapStructure: {
                            ...prev.soapStructure!,
                            objectiveQuestions: questions,
                          },
                        }))
                      }
                      sectionTitle="Objective"
                    />
                  </div>
                </div>

                {/* Assessment Section */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <Label className="text-lg font-bold text-amber-800">Assessment *</Label>
                      <p className="text-sm text-amber-600">Diagnosis, clinical impression, differential diagnosis</p>
                    </div>
                  </div>
                  <RichTextEditor
                    value={newTemplate.soapStructure?.assessment || ""}
                    onChange={(value) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        soapStructure: {
                          ...prev.soapStructure!,
                          assessment: value,
                        },
                      }))
                    }
                    placeholder="Enter assessment template content..."
                    height="250px"
                  />
                  <div className="mt-6">
                    <CustomQuestionsSection
                      questions={newTemplate.soapStructure?.assessmentQuestions || []}
                      onQuestionsChange={(questions) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          soapStructure: {
                            ...prev.soapStructure!,
                            assessmentQuestions: questions,
                          },
                        }))
                      }
                      sectionTitle="Assessment"
                    />
                  </div>
                </div>

                {/* Plan Section */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <Label className="text-lg font-bold text-purple-800">Plan *</Label>
                      <p className="text-sm text-purple-600">
                        Treatment plan, follow-up instructions, patient education
                      </p>
                    </div>
                  </div>
                  <RichTextEditor
                    value={newTemplate.soapStructure?.plan || ""}
                    onChange={(value) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        soapStructure: {
                          ...prev.soapStructure!,
                          plan: value,
                        },
                      }))
                    }
                    placeholder="Enter plan template content..."
                    height="300px"
                  />
                  <div className="mt-6">
                    <CustomQuestionsSection
                      questions={newTemplate.soapStructure?.planQuestions || []}
                      onQuestionsChange={(questions) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          soapStructure: {
                            ...prev.soapStructure!,
                            planQuestions: questions,
                          },
                        }))
                      }
                      sectionTitle="Plan"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Billing Codes */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Billing Codes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="primary-cpt" className="text-sm font-semibold text-gray-700">
                      Primary CPT Code *
                    </Label>
                    <Input
                      id="primary-cpt"
                      value={newTemplate.billingCodes?.primaryCpt || ""}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          billingCodes: {
                            ...prev.billingCodes!,
                            primaryCpt: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g., 99213"
                      className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Secondary CPT Codes</Label>
                    <div className="flex gap-2">
                      <Input
                        value={secondaryCptInput}
                        onChange={(e) => setSecondaryCptInput(e.target.value)}
                        placeholder="e.g., 99401"
                        onKeyPress={(e) => e.key === "Enter" && addSecondaryCpt()}
                        className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        onClick={addSecondaryCpt}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newTemplate.billingCodes?.secondaryCpts?.map((code, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1 bg-green-100 text-green-800 border border-green-300"
                        >
                          {code}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeSecondaryCpt(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mt-6">
                  <Label className="text-sm font-semibold text-gray-700">ICD-10 Codes</Label>
                  <div className="flex gap-2">
                    <Input
                      value={icd10Input}
                      onChange={(e) => setIcd10Input(e.target.value)}
                      placeholder="e.g., Z00.00"
                      onKeyPress={(e) => e.key === "Enter" && addIcd10Code()}
                      className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button type="button" onClick={addIcd10Code} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTemplate.billingCodes?.icd10Codes?.map((code, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="gap-1 bg-blue-50 text-blue-800 border border-blue-300"
                      >
                        {code}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeIcd10Code(index)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Template Settings */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Template Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="is-active"
                      checked={newTemplate.isActive}
                      onCheckedChange={(checked) => setNewTemplate((prev) => ({ ...prev, isActive: !!checked }))}
                    />
                    <Label htmlFor="is-active" className="text-sm font-medium text-gray-700">
                      Active Template
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="is-default"
                      checked={newTemplate.isDefault}
                      onCheckedChange={(checked) => setNewTemplate((prev) => ({ ...prev, isDefault: !!checked }))}
                    />
                    <Label htmlFor="is-default" className="text-sm font-medium text-gray-700">
                      Set as Default for Specialty
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="px-8 py-3">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog - Enhanced */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="pb-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Eye className="h-6 w-6 text-blue-600" />
                Template Preview: {selectedTemplate?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-6 p-2">
                <div className="flex gap-3 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 px-3 py-1">
                    {selectedTemplate.specialty}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-purple-50 text-purple-800 border border-purple-300 px-3 py-1"
                  >
                    {selectedTemplate.visitType}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300 px-3 py-1">
                    CPT: {selectedTemplate.billingCodes.primaryCpt}
                  </Badge>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 mb-4 text-lg flex items-center gap-2">
                      <div className="h-6 w-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        S
                      </div>
                      Subjective
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-emerald-200 whitespace-pre-wrap text-sm">
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.soapStructure.subjective }} />
                    </div>
                    {selectedTemplate.soapStructure.subjectiveQuestions &&
                      selectedTemplate.soapStructure.subjectiveQuestions.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-emerald-700 mb-3">Custom Questions:</h5>
                          {selectedTemplate.soapStructure.subjectiveQuestions.map((q, index) => (
                            <div key={q.id} className="bg-emerald-25 p-3 rounded-lg border-l-4 border-emerald-400 mb-3">
                              <p className="font-semibold text-sm text-emerald-800">
                                Q{index + 1}: {q.question}
                              </p>
                              {q.answer && <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center gap-2">
                      <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        O
                      </div>
                      Objective
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-blue-200 whitespace-pre-wrap text-sm">
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.soapStructure.objective }} />
                    </div>
                    {selectedTemplate.soapStructure.objectiveQuestions &&
                      selectedTemplate.soapStructure.objectiveQuestions.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-blue-700 mb-3">Custom Questions:</h5>
                          {selectedTemplate.soapStructure.objectiveQuestions.map((q, index) => (
                            <div key={q.id} className="bg-blue-25 p-3 rounded-lg border-l-4 border-blue-400 mb-3">
                              <p className="font-semibold text-sm text-blue-800">
                                Q{index + 1}: {q.question}
                              </p>
                              {q.answer && <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                    <h4 className="font-bold text-amber-800 mb-4 text-lg flex items-center gap-2">
                      <div className="h-6 w-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        A
                      </div>
                      Assessment
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-amber-200 whitespace-pre-wrap text-sm">
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.soapStructure.assessment }} />
                    </div>
                    {selectedTemplate.soapStructure.assessmentQuestions &&
                      selectedTemplate.soapStructure.assessmentQuestions.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-amber-700 mb-3">Custom Questions:</h5>
                          {selectedTemplate.soapStructure.assessmentQuestions.map((q, index) => (
                            <div key={q.id} className="bg-amber-25 p-3 rounded-lg border-l-4 border-amber-400 mb-3">
                              <p className="font-semibold text-sm text-amber-800">
                                Q{index + 1}: {q.question}
                              </p>
                              {q.answer && <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-4 text-lg flex items-center gap-2">
                      <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        P
                      </div>
                      Plan
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-purple-200 whitespace-pre-wrap text-sm">
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.soapStructure.plan }} />
                    </div>
                    {selectedTemplate.soapStructure.planQuestions &&
                      selectedTemplate.soapStructure.planQuestions.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-purple-700 mb-3">Custom Questions:</h5>
                          {selectedTemplate.soapStructure.planQuestions.map((q, index) => (
                            <div key={q.id} className="bg-purple-25 p-3 rounded-lg border-l-4 border-purple-400 mb-3">
                              <p className="font-semibold text-sm text-purple-800">
                                Q{index + 1}: {q.question}
                              </p>
                              {q.answer && <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Template Edit Dialog - Enhanced */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) {
              setEditTemplate(null)
              setEditSecondaryCptInput("")
              setEditIcd10Input("")
            }
          }}
        >
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
            <DialogHeader className="pb-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Edit className="h-6 w-6 text-green-600" />
                Edit Template: {editTemplate?.name}
              </DialogTitle>
            </DialogHeader>
            {editTemplate && (
              <div className="space-y-8 p-2">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="edit-template-name" className="text-sm font-semibold text-gray-700">
                        Template Name *
                      </Label>
                      <Input
                        id="edit-template-name"
                        value={editTemplate.name}
                        onChange={(e) => setEditTemplate((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                        placeholder="Template name"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="edit-specialty" className="text-sm font-semibold text-gray-700">
                        Specialty *
                      </Label>
                      <Select
                        value={editTemplate.specialty}
                        onValueChange={(value) => setEditTemplate((prev) => (prev ? { ...prev, specialty: value } : null))}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="edit-visit-type" className="text-sm font-semibold text-gray-700">
                        Visit Type *
                      </Label>
                      <Select
                        value={editTemplate.visitType}
                        onValueChange={(value) => setEditTemplate((prev) => (prev ? { ...prev, visitType: value } : null))}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VISIT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="edit-procedure-type" className="text-sm font-semibold text-gray-700">
                        Procedure Type (Optional)
                      </Label>
                      <Select
                        value={editTemplate.procedureType || ""}
                        onValueChange={(value) =>
                          setEditTemplate((prev) => (prev ? { ...prev, procedureType: value } : null))
                        }
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select procedure type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROCEDURE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* SOAP Structure with Rich Text Editor and Custom Questions */}
                <div className="space-y-8">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-indigo-600" />
                    SOAP Structure
                  </h3>

                  {/* Subjective Section */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        S
                      </div>
                      <div>
                        <Label className="text-lg font-bold text-emerald-800">Subjective *</Label>
                        <p className="text-sm text-emerald-600">
                          Patient reports, symptoms, history of present illness
                        </p>
                      </div>
                    </div>
                    <RichTextEditor
                      value={editTemplate.soapStructure.subjective}
                      onChange={(value) =>
                        setEditTemplate((prev) =>
                          prev
                            ? {
                                ...prev,
                                soapStructure: {
                                  ...prev.soapStructure,
                                  subjective: value,
                                },
                              }
                            : null,
                        )
                      }
                      placeholder="Enter subjective template content..."
                      height="300px"
                    />
                    <div className="mt-6">
                      <CustomQuestionsSection
                        questions={editTemplate.soapStructure.subjectiveQuestions || []}
                        onQuestionsChange={(questions) =>
                          setEditTemplate((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  soapStructure: {
                                    ...prev.soapStructure,
                                    subjectiveQuestions: questions,
                                  },
                                }
                              : null,
                          )
                        }
                        sectionTitle="Subjective"
                      />
                    </div>
                  </div>

                  {/* Objective Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        O
                      </div>
                      <div>
                        <Label className="text-lg font-bold text-blue-800">Objective *</Label>
                        <p className="text-sm text-blue-600">Physical exam findings, vital signs, test results</p>
                      </div>
                    </div>
                    <RichTextEditor
                      value={editTemplate.soapStructure.objective}
                      onChange={(value) =>
                        setEditTemplate((prev) =>
                          prev
                            ? {
                                ...prev,
                                soapStructure: {
                                  ...prev.soapStructure,
                                  objective: value,
                                },
                              }
                            : null,
                        )
                      }
                      placeholder="Enter objective template content..."
                      height="300px"
                    />
                    <div className="mt-6">
                      <CustomQuestionsSection
                        questions={editTemplate.soapStructure.objectiveQuestions || []}
                        onQuestionsChange={(questions) =>
                          setEditTemplate((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  soapStructure: {
                                    ...prev.soapStructure,
                                    objectiveQuestions: questions,
                                  },
                                }
                              : null,
                          )
                        }
                        sectionTitle="Objective"
                      />
                    </div>
                  </div>

                  {/* Assessment Section */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <div>
                        <Label className="text-lg font-bold text-amber-800">Assessment *</Label>
                        <p className="text-sm text-amber-600">Diagnosis, clinical impression, differential diagnosis</p>
                      </div>
                    </div>
                    <RichTextEditor
                      value={editTemplate.soapStructure.assessment}
                      onChange={(value) =>
                        setEditTemplate((prev) =>
                          prev
                            ? {
                                ...prev,
                                soapStructure: {
                                  ...prev.soapStructure,
                                  assessment: value,
                                },
                              }
                            : null,
                        )
                      }
                      placeholder="Enter assessment template content..."
                      height="250px"
                    />
                    <div className="mt-6">
                      <CustomQuestionsSection
                        questions={editTemplate.soapStructure.assessmentQuestions || []}
                        onQuestionsChange={(questions) =>
                          setEditTemplate((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  soapStructure: {
                                    ...prev.soapStructure,
                                    assessmentQuestions: questions,
                                  },
                                }
                              : null,
                          )
                        }
                        sectionTitle="Assessment"
                      />
                    </div>
                  </div>

                  {/* Plan Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        P
                      </div>
                      <div>
                        <Label className="text-lg font-bold text-purple-800">Plan *</Label>
                        <p className="text-sm text-purple-600">
                          Treatment plan, follow-up instructions, patient education
                        </p>
                      </div>
                    </div>
                    <RichTextEditor
                      value={editTemplate.soapStructure.plan}
                      onChange={(value) =>
                        setEditTemplate((prev) =>
                          prev
                            ? {
                                ...prev,
                                soapStructure: {
                                  ...prev.soapStructure,
                                  plan: value,
                                },
                              }
                            : null,
                        )
                      }
                      placeholder="Enter plan template content..."
                      height="300px"
                    />
                    <div className="mt-6">
                      <CustomQuestionsSection
                        questions={editTemplate.soapStructure.planQuestions || []}
                        onQuestionsChange={(questions) =>
                          setEditTemplate((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  soapStructure: {
                                    ...prev.soapStructure,
                                    planQuestions: questions,
                                  },
                                }
                              : null,
                          )
                        }
                        sectionTitle="Plan"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Billing Codes */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Billing Codes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="edit-primary-cpt" className="text-sm font-semibold text-gray-700">
                        Primary CPT Code *
                      </Label>
                      <Input
                        id="edit-primary-cpt"
                        value={editTemplate.billingCodes.primaryCpt}
                        onChange={(e) =>
                          setEditTemplate((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  billingCodes: {
                                    ...prev.billingCodes,
                                    primaryCpt: e.target.value,
                                  },
                                }
                              : null,
                          )
                        }
                        placeholder="e.g., 99213"
                        className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Secondary CPT Codes</Label>
                      <div className="flex gap-2">
                        <Input
                          value={editSecondaryCptInput}
                          onChange={(e) => setEditSecondaryCptInput(e.target.value)}
                          placeholder="e.g., 99401"
                          onKeyPress={(e) => e.key === "Enter" && addEditSecondaryCpt()}
                          className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          onClick={addEditSecondaryCpt}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editTemplate.billingCodes.secondaryCpts.map((code, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1 bg-green-100 text-green-800 border border-green-300"
                          >
                            {code}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeEditSecondaryCpt(index)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-6">
                    <Label className="text-sm font-semibold text-gray-700">ICD-10 Codes</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editIcd10Input}
                        onChange={(e) => setEditIcd10Input(e.target.value)}
                        placeholder="e.g., Z00.00"
                        onKeyPress={(e) => e.key === "Enter" && addEditIcd10Code()}
                        className="font-mono border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        onClick={addEditIcd10Code}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editTemplate.billingCodes.icd10Codes.map((code, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="gap-1 bg-blue-50 text-blue-800 border border-blue-300"
                        >
                          {code}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeEditIcd10Code(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Template Settings */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Template Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="edit-is-active"
                        checked={editTemplate.isActive}
                        onCheckedChange={(checked) =>
                          setEditTemplate((prev) => (prev ? { ...prev, isActive: !!checked } : null))
                        }
                      />
                      <Label htmlFor="edit-is-active" className="text-sm font-medium text-gray-700">
                        Active Template
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="edit-is-default"
                        checked={editTemplate.isDefault}
                        onCheckedChange={(checked) =>
                          setEditTemplate((prev) => (prev ? { ...prev, isDefault: !!checked } : null))
                        }
                      />
                      <Label htmlFor="edit-is-default" className="text-sm font-medium text-gray-700">
                        Set as Default for Specialty
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} className="px-8 py-3">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={isLoading}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Template"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default EncounterTemplateSettings
