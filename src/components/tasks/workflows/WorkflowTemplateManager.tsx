"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Workflow, Plus, Edit, Trash2, Play, Clock, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  createWorkflow,
  getWorkflowsByProviderId,
  updateWorkflow,
  deleteWorkflow,
} from "@/services/operations/workflow.js"
import type { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
import AddManualTask from "@/components/patient/AddManualTask"
import { useParams } from "react-router-dom"
import { createTaskAPI } from "@/services/operations/task";
import { addMonths, formatISO } from "date-fns";

interface ICDOption {
  value: string
  label: string
}

interface WorkflowTask {
  title: string
  description: string
  task_notes?: string
  estimated_duration: number
  required_conditions?: string[]
  ai_confidence_score?: number
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  estimated_duration: number
  tasks: WorkflowTask[]
  conditions: string[]
  created_at?: string
  provider_id?: string
}

interface WorkflowTemplateManagerProps {
  onApplyWorkflow?: (templateId: string, patientId: string) => void
  patient?:any
}

const WorkflowTemplateManager: React.FC<WorkflowTemplateManagerProps> = ({ onApplyWorkflow,patient }) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [icdOptions, setIcdOptions] = useState<ICDOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()
  const { token, user } = useSelector((state: RootState) => state.auth)
  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  const [tempData,setTempData] = useState(null)
  const { id } = useParams();

  const [newTemplate, setNewTemplate] = useState<Partial<WorkflowTemplate>>({
    name: "",
    description: "",
    category: "care_coordination",
    estimated_duration: 30,
    tasks: [],
    conditions: [],
  })

  const [newTask, setNewTask] = useState<WorkflowTask>({
    title: "",
    description: "",
    estimated_duration: 15,
    ai_confidence_score: 0.8,
  })

  const categories = ["care_coordination", "medication_management", "monitoring", "laboratory", "preventive_care"]

  // ICD Code Search Effect
  useEffect(() => {
    const fetchICDCodes = async () => {
      if (!searchTerm) {
        setIcdOptions([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(
          `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code&terms=${searchTerm}`,
        )
        const data = await response.json()
        if (Array.isArray(data[3])) {
          const options = data[3].map(([code, desc]: [string, string]) => ({
            value: code,
            label: `${code} - ${desc}`,
          }))
          setIcdOptions(options)
        }
      } catch (err) {
        console.error("Failed to fetch ICD codes:", err)
      } finally {
        setIsSearching(false)
      }
    }

    const timeout = setTimeout(fetchICDCodes, 300) // debounce
    return () => clearTimeout(timeout)
  }, [searchTerm])

  const fetchTemplates = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await getWorkflowsByProviderId(user.id, token)
      console.log(res)
      setTemplates(res)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch workflow templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const addTaskToTemplate = (isEdit = false) => {
    if (!newTask.title || !newTask.description) return

    if (isEdit && editingTemplate) {
      setEditingTemplate((prev) =>
        prev
          ? {
              ...prev,
              tasks: [...prev.tasks, { ...newTask }],
            }
          : null,
      )
    } else {
      setNewTemplate((prev) => ({
        ...prev,
        tasks: [...(prev.tasks || []), { ...newTask }],
      }))
    }

    setNewTask({
      title: "",
      description: "",
      estimated_duration: 15,
      ai_confidence_score: 0.8,
    })
  }

  const removeTaskFromTemplate = (index: number, isEdit = false) => {
    if (isEdit && editingTemplate) {
      setEditingTemplate((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.filter((_, i) => i !== index),
            }
          : null,
      )
    } else {
      setNewTemplate((prev) => ({
        ...prev,
        tasks: prev.tasks?.filter((_, i) => i !== index) || [],
      }))
    }
  }

  const addConditionFromICD = (icdOption: ICDOption, isEdit = false) => {
    if (isEdit && editingTemplate) {
      if (!editingTemplate.conditions.includes(icdOption.label)) {
        setEditingTemplate((prev) =>
          prev
            ? {
                ...prev,
                conditions: [...prev.conditions, icdOption.label],
              }
            : null,
        )
      }
    } else {
      if (!newTemplate.conditions?.includes(icdOption.label)) {
        setNewTemplate((prev) => ({
          ...prev,
          conditions: [...(prev.conditions || []), icdOption.label],
        }))
      }
    }
    setSearchTerm("")
    setIcdOptions([])
  }

  const removeCondition = (condition: string, isEdit = false) => {
    if (isEdit && editingTemplate) {
      setEditingTemplate((prev) =>
        prev
          ? {
              ...prev,
              conditions: prev.conditions.filter((c) => c !== condition),
            }
          : null,
      )
    } else {
      setNewTemplate((prev) => ({
        ...prev,
        conditions: prev.conditions?.filter((c) => c !== condition) || [],
      }))
    }
  }

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.description || !newTemplate.tasks?.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one task",
        variant: "destructive",
      })
      return
    }

    try {
      const mockTemplate: WorkflowTemplate = {
        ...(newTemplate as WorkflowTemplate),
        id: `tem_${Date.now()}`,
        created_at: new Date().toISOString(),
        provider_id: user?.id,
      }

      console.log(mockTemplate)
      await createWorkflow(mockTemplate, token)
      setTemplates((prev) => [...prev, mockTemplate])
      setIsCreateDialogOpen(false)
      resetNewTemplate()

      toast({
        title: "Success",
        description: "Workflow template created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow template",
        variant: "destructive",
      })
    }
  }

  const updateTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.description || !editingTemplate.tasks?.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one task",
        variant: "destructive",
      })
      return
    }

    try {
      await updateWorkflow(editingTemplate.id, editingTemplate, token)
      setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t)))
      setIsEditDialogOpen(false)
      setEditingTemplate(null)

      toast({
        title: "Success",
        description: "Workflow template updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow template",
        variant: "destructive",
      })
    }
  }

  const handleEditTemplate = (template: WorkflowTemplate) => {
    setEditingTemplate({ ...template })
    setIsEditDialogOpen(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this workflow template?")) {
      return
    }

    try {
      await deleteWorkflow(templateId, token)
      setTemplates((prev) => prev.filter((t) => t.id !== templateId))

      toast({
        title: "Success",
        description: "Workflow template deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const resetNewTemplate = () => {
    setNewTemplate({
      name: "",
      description: "",
      category: "care_coordination",
      estimated_duration: 30,
      tasks: [],
      conditions: [],
    })
    setNewTask({
      title: "",
      description: "",
      estimated_duration: 15,
      ai_confidence_score: 0.8,
    })
  }

const applyTemplate = async (template: any) => {
  setTempData(null)
  const today = new Date();
  const oneMonthLater = addMonths(today, 1);
  const formattedDueDate = formatISO(oneMonthLater);

  for (const task of template.tasks) {
    const taskData = {
      title: task.title,
      description: task.description,
      duration: task.estimated_duration,
      priority: "medium",
      frequencyType: "Daily",
      status: "pending",
      frequency: 'Daily',
      type:"workflow",
      dueDate: formattedDueDate,
    };


    setTempData(taskData)
    setOpenTaskDialog(true)
    // try {
    //   const response = await createTaskAPI(taskData, id, token);
    //   console.log("Task created:", response);
    // } catch (error) {
    //   console.error("Error creating task:", error);
    // }
  }

  toast({
    title: "Workflow Applied",
    description: "All tasks from the workflow template have been generated.",
  });
};

  const renderTemplateForm = (isEdit = false) => {
    const template = isEdit ? editingTemplate : newTemplate
    const setTemplate = isEdit ? setEditingTemplate : setNewTemplate

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={template?.name || ""}
              onChange={(e) => setTemplate((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-category">Category</Label>
            <Select
              value={template?.category || "care_coordination"}
              onValueChange={(value) => setTemplate((prev) => (prev ? { ...prev, category: value } : null))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-description">Description</Label>
          <Textarea
            id="template-description"
            value={template?.description || ""}
            onChange={(e) => setTemplate((prev) => (prev ? { ...prev, description: e.target.value } : null))}
            placeholder="Describe this workflow template"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>ICD Code Search & Conditions</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ICD codes (e.g., diabetes, hypertension)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {icdOptions.length > 0 && (
            <div className="border rounded-md max-h-40 overflow-y-auto">
              {icdOptions.map((option, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                  onClick={() => addConditionFromICD(option, isEdit)}
                >
                  <div className="text-sm font-medium">{option.value}</div>
                  <div className="text-xs text-muted-foreground">{option.label.split(" - ")[1]}</div>
                </div>
              ))}
            </div>
          )}

          {template?.conditions && template.conditions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Selected Conditions:</Label>
              <div className="flex flex-wrap gap-2">
                {template.conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {condition}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeCondition(condition, isEdit)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <Label className="text-base font-semibold">Tasks</Label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-duration">Duration (min)</Label>
              <Input
                id="task-duration"
                type="number"
                value={newTask.estimated_duration}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, estimated_duration: Number.parseInt(e.target.value) }))
                }
                min="5"
                max="240"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Task Description</Label>
            <Textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Task description"
              rows={2}
            />
          </div>

          <Button type="button" onClick={() => addTaskToTemplate(isEdit)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>

          {template?.tasks && template.tasks.length > 0 && (
            <div className="space-y-2">
              <Label>Template Tasks</Label>
              {template.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeTaskFromTemplate(index, isEdit)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Templates</h2>
          <p className="text-muted-foreground">Manage automated task workflows</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Workflow Template</DialogTitle>
            </DialogHeader>

            {renderTemplateForm(false)}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetNewTemplate()
                }}
              >
                Cancel
              </Button>
              <Button onClick={createTemplate}>Create Template</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workflow Template</DialogTitle>
          </DialogHeader>

          {renderTemplateForm(true)}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingTemplate(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={updateTemplate}>Update Template</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Badge variant="outline">{template.category.replace("_", " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {template.estimated_duration}m
                </div>
                <div className="flex items-center gap-1">
                  <Workflow className="h-4 w-4" />
                  {template.tasks.length} tasks
                </div>
              </div>

              {template.conditions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs">Required Conditions:</Label>
                  <div className="flex flex-wrap gap-1">
                    {template.conditions.slice(0, 3).map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {condition.length > 20 ? `${condition.substring(0, 20)}...` : condition}
                      </Badge>
                    ))}
                    {template.conditions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.conditions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={() => applyTemplate(template)} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Apply
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workflow Templates</h3>
            <p className="text-muted-foreground mb-4">
              Create your first workflow template to automate task generation
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

        <AddManualTask
              open={openTaskDialog}
              onOpenChange={setOpenTaskDialog}
              fetchTask={()=>console.log("fetch")}
              taskData={tempData}
                            patient={patient}

            />
    </div>
  )
}

export default WorkflowTemplateManager
