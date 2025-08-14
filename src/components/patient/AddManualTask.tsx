import type React from "react";
import { useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { FileText, CalendarDays, Repeat, ListPlus, Clock } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { createTaskAPI } from "@/services/operations/task";
import { useParams } from "react-router-dom";

// ✅ Schema updated with type
const manualTaskSchema = z.object({
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
  duration: z
    .number({
      required_error: "Please enter duration.",
      invalid_type_error: "Duration must be a number",
    })
    .positive("Duration must be greater than 0"),
  type: z.enum(["rpm", "ccm", "pcm"], {
    required_error: "Please select a type unit.",
  }),
});

type ManualTaskFormValues = z.infer<typeof manualTaskSchema>;

interface AddManualTaskDialogProps {
  open: boolean;
  taskData?: any;
  patient?: any;
  onOpenChange: (open: boolean) => void;
  fetchTask: () => void;
}

const AddManualTask: React.FC<AddManualTaskDialogProps> = ({
  open,
  onOpenChange,
  fetchTask,
  taskData = null,
  patient,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();


  console.log(taskData)
  const form = useForm<ManualTaskFormValues>({
    resolver: zodResolver(manualTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      frequencyType: "Daily",
      status: "pending",
      frequency: null,
      dueDate: "",
      duration: undefined,
      type: "rpm",
    },
  });


  const { reset } = form;
  const serviceTypeMap: { [key: number]: string } = {
    1: "rpm",
    2: "ccm",
    3: "pcm",
  };
  useEffect(() => {
    if (taskData) {
      reset({
        title: taskData.title || "",
        description: taskData.description || "",
        priority: taskData.priority || "medium",
        frequencyType: taskData.frequencyType || "Daily",
        status: taskData.status || "pending",
        frequency: taskData.frequency || null,
        dueDate: taskData.dueDate || "",
        duration: taskData.duration ?? undefined,
        type: taskData.type || "rpm",
      });
    }
  }, [taskData, reset]);


  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: ManualTaskFormValues) => {
    try {
      const taskData = {
        ...data,
      };

      const response = await createTaskAPI(taskData, id, token);
      console.log("Submitted task data:", taskData);
      console.log("API response:", response);

      fetchTask();
      form.reset();
      onOpenChange(false);
      toast.success("Manual task added successfully!");
    } catch (error) {
      console.error("Error adding manual task:", error);
      toast.error("Failed to add manual task.");
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Please correct the form errors.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-blue-600" />
            Add New Manual Task
          </DialogTitle>
          <DialogDescription>
            Fill in the details to add a new manual task.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <Tabs defaultValue="task" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="task">Task Details</TabsTrigger>
              </TabsList>

              <TabsContent value="task" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium">Task Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Priority */}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Due Date */}
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" /> Due Date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Frequency Type */}
                  <FormField
                    control={form.control}
                    name="frequencyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Repeat className="h-4 w-4" /> Frequency Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Frequency */}
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 7"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> Duration (in minutes)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your time in minutes"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ✅ Type Unit (rpm, ccm, pcm) */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Select Service Type
                    </label>
                    <Controller
                      name="type"
                      control={form.control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 mt-1 border rounded-md text-sm"
                        >
                          <option value="">Select a service</option>
                          {patient?.patientService?.length > 0 &&
                            patient.patientService
                              .filter((id: number) => serviceTypeMap[id])
                              .map((id: number) => (
                                <option key={id} value={serviceTypeMap[id]}>
                                  {serviceTypeMap[id]}
                                </option>
                              ))}
                        </select>
                      )}
                    />
                    {form.formState.errors.type && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.type.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add detailed description..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddManualTask;
