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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Calendar, Pill } from "lucide-react"; // Changed icon to Pill for medication
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { addPatinetMediationAPI } from "@/services/operations/patient";
import { useParams } from "react-router-dom";

// Define the schema for a single medication entry using Zod
const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required."),
  dosage: z.string().min(1, "Dosage is required."),
  frequency: z.string().min(1, "Frequency is required."),
  refills: z.string().optional(),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional().nullable(), // End date is optional and can be null
  status: z.enum(["Active", "Inactive", "Discontinued"], {
    errorMap: () => ({ message: "Please select a valid status." }),
  }),
});

// Infer the TypeScript type from the Zod schema
type MedicationFormValues = z.infer<typeof medicationSchema>;

// Define props for the component
interface AddMedicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchPatient: () => void; // Function to refresh patient data after adding medication
}

const AddMedicationsDialog: React.FC<AddMedicationsDialogProps> = ({
  open,
  onOpenChange,
  fetchPatient,
}) => {
  // Get authentication token from Redux store
  const { token } = useSelector((state: RootState) => state.auth);
  // Get patient ID from URL parameters
  const { id } = useParams();

  // Initialize react-hook-form with Zod resolver for validation
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      refills: "",
      startDate: "",
      endDate: "", // Set default to empty string for optional date input
      status: "Active",
    },
  });

  // Effect to reset the form when the dialog opens
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  // Handle form submission
  const onSubmit = async (data: MedicationFormValues) => {
    try {
      await addPatinetMediationAPI(data, token, id);

      toast.success("Medication added successfully!"); // Show success toast
      fetchPatient(); // Refresh patient data
      form.reset(); // Reset form fields
      onOpenChange(false); // Close the dialog
    } catch (error) {
      console.error("Error adding medication:", error);
      toast.error("Failed to add medication. Please try again."); // Show error toast
    }
  };

  // Custom function to display stacked error messages (similar to original code)
  const stackedShowError = (text: string) => {
    const container = document.getElementById("custom-toast-container");
    if (!container) return;

    const toastElement = document.createElement("div");

    toastElement.innerHTML = `
      <div style="
        background: #fee2e2;
        color: #991b1b;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-size: 14px;
        font-weight: 500;
        min-width: 200px;
        max-width: 300px;
        animation: slideIn 0.3s ease;
      ">
        ❌ ${text}
      </div>
    `;

    container.appendChild(toastElement);

    setTimeout(() => {
      toastElement.remove();
    }, 3000);
  };

  // Error handler for react-hook-form (called if validation fails)
  const onError = (errors: any) => {
    Object.values(errors).forEach((error: any) => {
      if (error?.message) {
        stackedShowError(error.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" /> {/* Medication icon */}
            Add New Medication
          </DialogTitle>
          <DialogDescription>
            Enter medication information to create a new medication record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)} // Handles submission and validation
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Medication Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              {/* Medication Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Amoxicillin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dosage Field */}
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 250mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Frequency Field */}
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Twice daily" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Prescribed By Field */}
              <FormField
                control={form.control}
                name="refills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>refills</FormLabel>
                    <FormControl>
                      <Input placeholder="refills" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date Field */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date Field (Optional) */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      {/* Ensure value is not undefined for uncontrolled warning */}
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Select Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Discontinued">
                          Discontinued
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Medication
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicationsDialog;
