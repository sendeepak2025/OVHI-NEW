import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  FileText,
  CalendarDays,
  Clock,
  Repeat,
  ListPlus,
  Timer,
  DollarSign,
  Activity,
  Stethoscope,
  Heart,
  Pill,
} from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { createTaskAPI } from "@/services/operations/task";
import { useParams } from "react-router-dom";

const programTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty."),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Please select a priority.",
  }),
  dueDate: z.string().optional(),
  frequencyType: z
    .enum(["Daily", "Weekly", "Monthly", "Custom"], {
      required_error: "Please select a frequency type.",
    })
    .optional(),
  frequency: z.any().optional(),
  status: z.enum(["pending", "in_progress", "completed"], {
    required_error: "Please select a status.",
  }),
  program_type: z.enum(["RPM", "CCM", "PCM", "General"], {
    required_error: "Please select a program type.",
  }),
  cpt_code: z.string().optional(),
  billing_minutes: z.any().optional(),
  billable_activity: z.boolean().default(false),
});

type ProgramTaskFormValues = z.infer<typeof programTaskSchema>;

interface ProgramTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchTask: () => void;
  patientId?: string;
  patient?: any;
}

// Program-specific task templates
const PROGRAM_TEMPLATES = {
  RPM: [
    {
      title: "Device Setup & Training",
      description:
        "Set up remote monitoring device and train patient on proper usage",
      cpt_code: "99457",
      billing_minutes: 20,
      priority: "high" as const,
    },
    {
      title: "Daily Reading Review",
      description: "Review and analyze patient's daily vital signs readings",
      cpt_code: "99458",
      billing_minutes: 15,
      priority: "medium" as const,
    },
    {
      title: "Threshold Alert Response",
      description:
        "Respond to abnormal reading alerts and contact patient if needed",
      cpt_code: "99458",
      billing_minutes: 10,
      priority: "urgent" as const,
    },
  ],
  CCM: [
    {
      title: "Monthly Care Plan Review",
      description: "Comprehensive review and update of patient care plan",
      cpt_code: "99490",
      billing_minutes: 20,
      priority: "high" as const,
    },
    {
      title: "Medication Reconciliation",
      description:
        "Complete medication review including adherence and interactions",
      cpt_code: "99490",
      billing_minutes: 15,
      priority: "medium" as const,
    },
    {
      title: "Care Coordination Call",
      description: "Coordinate care with specialists and other providers",
      cpt_code: "99491",
      billing_minutes: 25,
      priority: "medium" as const,
    },
  ],
  PCM: [
    {
      title: "Single Condition Assessment",
      description: "Focused assessment of primary chronic condition",
      cpt_code: "99424",
      billing_minutes: 20,
      priority: "high" as const,
    },
    {
      title: "Treatment Plan Update",
      description: "Update treatment plan based on patient progress",
      cpt_code: "99425",
      billing_minutes: 15,
      priority: "medium" as const,
    },
    {
      title: "Patient Education Session",
      description: "Educate patient on condition management and self-care",
      cpt_code: "99426",
      billing_minutes: 30,
      priority: "medium" as const,
    },
  ],
};

const ProgramTaskDialog: React.FC<ProgramTaskDialogProps> = ({
  open,
  onOpenChange,
  fetchTask,
  patientId,
  patient,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();

  const [startTimeDisplay, setStartTimeDisplay] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerIntervalId = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<ProgramTaskFormValues>({
    resolver: zodResolver(programTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      frequencyType: "Daily",
      frequency: null,
      status: "pending",
      program_type: "General",
      cpt_code: "",
      billing_minutes: "",
      billable_activity: false,
    },
  });

  const selectedProgramType = form.watch("program_type");

  useEffect(() => {
    if (open && inputFocused && startTimeRef.current !== null) {
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
      }

      timerIntervalId.current = setInterval(() => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTimeRef.current!) / 1000));
      }, 1000);
    } else if (!open && timerIntervalId.current) {
      clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
    }

    return () => {
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
    };
  }, [open, inputFocused]);

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        frequencyType: "Daily",
        frequency: null,
        status: "pending",
        program_type: "General",
        cpt_code: "",
        billing_minutes: "",
        billable_activity: false,
      });
      setStartTimeDisplay(null);
      startTimeRef.current = null;
      setInputFocused(false);
      setElapsedTime(0);
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
    }
  }, [open, form]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((unit) => String(unit).padStart(2, "0"))
      .join(":");
  };

  const handleInputFocus = () => {
    if (!inputFocused) {
      setInputFocused(true);
      if (startTimeRef.current === null) {
        const now = new Date();
        startTimeRef.current = now.getTime();
        setStartTimeDisplay(now.toTimeString().split(" ")[0].substring(0, 5));
      }
    }
  };

  const applyTemplate = (template: any) => {
    form.setValue("title", template.title);
    form.setValue("description", template.description);
    form.setValue("cpt_code", template.cpt_code);
    form.setValue("billing_minutes", template.billing_minutes);
    form.setValue("priority", template.priority);
    form.setValue("billable_activity", true);
    toast.success("Template applied successfully!");
  };

  const onSubmit = async (data: ProgramTaskFormValues) => {
    try {
      const taskData = {
        ...data,
        duration: data.billable_activity ? data.billing_minutes : elapsedTime,
        type: data.program_type.toLowerCase(),
      };

      const response = await createTaskAPI(taskData, id, token);
      console.log("Program task created:", response);

      fetchTask();
      form.reset();
      setStartTimeDisplay(null);
      startTimeRef.current = null;
      setInputFocused(false);
      setElapsedTime(0);
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
      onOpenChange(false);
      toast.success(`${data.program_type} task created successfully!`);
    } catch (error) {
      console.error("Error creating program task:", error);
      toast.error("Failed to create program task.");
    }
  };

  const getProgramIcon = (programType: string) => {
    switch (programType) {
      case "RPM":
        return <Activity className="h-4 w-4" />;
      case "CCM":
        return <Heart className="h-4 w-4" />;
      case "PCM":
        return <Stethoscope className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-primary" />
            Create Program Task
          </DialogTitle>
          <DialogDescription>
            Create tasks for RPM, CCM, PCM programs with billing compliance
            tracking.
          </DialogDescription>
        </DialogHeader>

        {inputFocused && startTimeRef.current !== null && (
          <div className="flex items-center justify-center p-2 bg-primary/10 text-primary rounded-md shadow-sm mb-4">
            <Timer className="h-5 w-5 mr-2" />
            <span className="font-mono text-lg">
              Elapsed Time: {formatTime(elapsedTime)}
            </span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="program" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="program">Program Details</TabsTrigger>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="billing">Billing & Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter task title"
                            {...field}
                            onFocus={handleInputFocus}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">🟢 Low</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="high">🟠 High</SelectItem>
                            <SelectItem value="urgent">🔴 Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">📋 Pending</SelectItem>
                            <SelectItem value="in_progress">
                              ⚡ In Progress
                            </SelectItem>
                            <SelectItem value="completed">
                              ✅ Completed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" /> Due Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            onFocus={handleInputFocus}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed task description..."
                          className="min-h-[100px]"
                          {...field}
                          onFocus={handleInputFocus}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="program" className="space-y-4">
                <FormField
                  control={form.control}
                  name="program_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="General">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              General Task
                            </div>
                          </SelectItem>
                          <SelectItem value="RPM">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Remote Patient Monitoring
                            </div>
                          </SelectItem>
                          <SelectItem value="CCM">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Chronic Care Management
                            </div>
                          </SelectItem>
                          <SelectItem value="PCM">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4" />
                              Principal Care Management
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedProgramType !== "General" &&
                  PROGRAM_TEMPLATES[selectedProgramType] && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getProgramIcon(selectedProgramType)}
                        <span className="font-medium">
                          {selectedProgramType} Task Templates
                        </span>
                      </div>
                      <div className="grid gap-2">
                        {PROGRAM_TEMPLATES[selectedProgramType].map(
                          (template, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                              onClick={() => applyTemplate(template)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {template.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {template.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {template.cpt_code}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {template.billing_minutes}min
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cpt_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" /> CPT Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 99490, 99457"
                            {...field}
                            onFocus={handleInputFocus}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billing_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> Billing Minutes
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="20"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            onFocus={handleInputFocus}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="billable_activity"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        This is a billable activity requiring compliance
                        tracking
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-accent/30 rounded-lg">
                  <h4 className="font-medium mb-2">Billing Guidelines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• RPM: 99457 (setup), 99458 (monthly monitoring)</li>
                    <li>• CCM: 99490 (20+ min), 99491 (30+ min)</li>
                    <li>• PCM: 99424-99427 (condition-specific)</li>
                    <li>
                      • Ensure proper documentation for billing compliance
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramTaskDialog;
