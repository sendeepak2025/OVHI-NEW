import type React from "react";
import { useEffect, useState, useRef } from "react"; // Import useRef
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
import { getTaskByPatientID } from "@/services/operations/task";

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
} from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { createTaskAPI } from "@/services/operations/task";
import { useParams } from "react-router-dom";

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
});

type ManualTaskFormValues = z.infer<typeof manualTaskSchema>;

interface AddManualTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchTask: () => void;
}

const AddCcmTaskDialog: React.FC<AddManualTaskDialogProps> = ({
  open,
  onOpenChange,
  fetchTask,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();

  const [startTimeDisplay, setStartTimeDisplay] = useState<string | null>(null); // For displaying HH:MM
  const startTimeRef = useRef<number | null>(null); // To store the actual timestamp when timer starts
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerIntervalId = useRef<NodeJS.Timeout | null>(null); // Use useRef for interval ID

  const form = useForm<ManualTaskFormValues>({
    resolver: zodResolver(manualTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      frequencyType: "Daily",
      frequency: null,
      status: "pending",
    },
  });

  const frequencyType = form.watch("frequencyType");

  useEffect(() => {
    if (open && inputFocused && startTimeRef.current !== null) {
      // Clear any existing interval to prevent multiple timers
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
      }

      timerIntervalId.current = setInterval(() => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTimeRef.current!) / 1000)); // Calculate elapsed seconds
      }, 1000);
    } else if (!open && timerIntervalId.current) {
      // Clear interval when dialog closes
      clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
    }

    return () => {
      // Cleanup on component unmount or dependency change
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
    };
  }, [open, inputFocused]); // No need to depend on startTimeDisplay or startTimeRef.current directly here

  // Effect to reset form and states when dialog opens/closes
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
      });
      setStartTimeDisplay(null);
      startTimeRef.current = null; // Clear the actual start timestamp
      setInputFocused(false);
      setElapsedTime(0);
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
    }
  }, [open, form]);

  // Function to format elapsed time for display
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((unit) => String(unit).padStart(2, "0"))
      .join(":");
  };

  // Handler for input focus to start the timer
  const handleInputFocus = () => {
    if (!inputFocused) {
      setInputFocused(true);
      if (startTimeRef.current === null) {
        const now = new Date();
        startTimeRef.current = now.getTime(); // Store exact timestamp
        setStartTimeDisplay(now.toTimeString().split(" ")[0].substring(0, 5)); // Store for display
      }
    }
  };

  const onSubmit = async (data: ManualTaskFormValues) => {
    try {
      let type = "ccm";
      const taskData = {
        ...data,
        duration: elapsedTime,
        type,
      };

      const response = await createTaskAPI(taskData, id, token);
      console.log("Task data to be submitted:", taskData);
      console.log("res bmitted:", response);
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

        {/* Real-time Timer Display */}
        {inputFocused && startTimeRef.current !== null && (
          <div className="flex items-center justify-center p-2 bg-blue-50 text-blue-800 rounded-md shadow-sm mb-4">
            <Timer className="h-5 w-5 mr-2" />
            <span className="font-mono text-lg">
              Elapsed Time: {formatTime(elapsedTime)}
            </span>
          </div>
        )}

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
                          <Input
                            placeholder="Task title"
                            {...field}
                            onFocus={handleInputFocus}
                          />
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

                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Frequency
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 7 (for every 7 days/weeks/months)"
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              );
                            }}
                            onFocus={handleInputFocus}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add detailed description for the task..."
                            className="min-h-[100px]"
                            {...field}
                            onFocus={handleInputFocus}
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

export default AddCcmTaskDialog;
