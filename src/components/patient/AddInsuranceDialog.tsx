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
import { ShieldCheck, CalendarDays } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { addPatinetInsuranceAPI } from "@/services/operations/patient";
import { useParams } from "react-router-dom";

// Define a basic type for an insurance entry for better type safety
interface InsuranceEntry {
  type: "primary" | "secondary";
  company: string;
  plan: string;
  policyNumber: string;
  groupNumber?: string | null;
  effectiveDate: string;
  expirationDate?: string | null;
  relationship?: string | null;
  insuredName?: string | null;
  insuredDOB?: string | null;
  insuredGender?: string | null;
  insuredPhone?: string | null;
  insuredAddress?: string | null;
}

// Define a basic type for the patient object
interface Patient {
  insurance?: InsuranceEntry[];
  // Add other patient properties if needed
}

// Define the schema for a single insurance entry using Zod
const insuranceSchema = z
  .object({
    type: z.enum(["primary", "secondary"], {
      errorMap: () => ({ message: "Please select an insurance type." }),
    }),
    company: z.string().min(1, "Company name is required."),
    plan: z.string().min(1, "Plan name is required."),
    policyNumber: z.string().min(1, "Policy number is required."),
    groupNumber: z.string().optional().nullable(),
    effectiveDate: z.string().min(1, "Effective date is required."),
    expirationDate: z.string().optional().nullable(),

    relationship: z.string().optional().nullable(),
    insuredName: z.string().optional().nullable(),
    insuredDOB: z.string().optional().nullable(),
    insuredGender: z.string().optional().nullable(),
    insuredPhone: z.string().optional().nullable(),
    insuredAddress: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Conditional validation for insured information
    if (data.relationship && data.relationship !== "0") {
      // If relationship is not "Self"
      if (!data.insuredName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Insured Name is required when relationship is not 'Self'.",
          path: ["insuredName"],
        });
      }
      if (!data.insuredDOB) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Insured Date of Birth is required when relationship is not 'Self'.",
          path: ["insuredDOB"],
        });
      }
      if (!data.insuredGender) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Insured Gender is required when relationship is not 'Self'.",
          path: ["insuredGender"],
        });
      }
      if (!data.insuredPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Insured Phone is required when relationship is not 'Self'.",
          path: ["insuredPhone"],
        });
      }
      if (!data.insuredAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Insured Address is required when relationship is not 'Self'.",
          path: ["insuredAddress"],
        });
      }
    }
  });

// Infer the TypeScript type from the Zod schema
type InsuranceFormValues = z.infer<typeof insuranceSchema>;

// Define props for the component
interface AddInsuranceDialogProps {
  open: boolean;
  patient: Patient; // Use the defined Patient interface
  onOpenChange: (open: boolean) => void;
  fetchPatient: () => void; // Function to refresh patient data after adding insurance
}

const AddInsuranceDialog: React.FC<AddInsuranceDialogProps> = ({
  open,
  onOpenChange,
  fetchPatient,
  patient,
}) => {
  // Get authentication token from Redux store
  const { token } = useSelector((state: RootState) => state.auth);
  // Get patient ID from URL parameters
  const { id } = useParams();

  // Initialize react-hook-form with Zod resolver for validation
  const form = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      type: "primary",
      company: "",
      plan: "",
      policyNumber: "",
      groupNumber: "",
      effectiveDate: "",
      expirationDate: "",
      relationship: "0", // Default to "Self"
      insuredName: "",
      insuredDOB: "",
      insuredGender: "",
      insuredPhone: "",
      insuredAddress: "",
    },
  });

  // Effect to reset the form when the dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        type: "primary",
        company: "",
        plan: "",
        policyNumber: "",
        groupNumber: "",
        effectiveDate: "",
        expirationDate: "",
        relationship: "0", // Reset to "Self"
        insuredName: "",
        insuredDOB: "",
        insuredGender: "",
        insuredPhone: "",
        insuredAddress: "",
      });
    }
  }, [open, form]);

  // Handle form submission
  const onSubmit = async (data: InsuranceFormValues) => {
    try {
      // Call the API to add insurance for the patient
      await addPatinetInsuranceAPI(data, token, id);

      toast.success("Insurance added successfully!"); // Show success toast
      fetchPatient(); // Refresh patient data
      form.reset(); // Reset form fields
      onOpenChange(false); // Close the dialog
    } catch (error) {
      console.error("Error adding insurance:", error);
      toast.error("Failed to add insurance. Please try again."); // Show error toast
    }
  };

  // Error handler for react-hook-form (called if validation fails)
  const onError = (errors: any) => {
    Object.values(errors).forEach((error: any) => {
      if (error?.message) {
        toast.error(error.message); // Use sonner for all error messages
      }
    });
  };

  const today = new Date();

  // Check if any active primary insurance exists
  const hasActivePrimary = patient.insurance?.some(
    (item) =>
      item.type === "primary" &&
      item.expirationDate && // Ensure expirationDate exists
      new Date(item.expirationDate) > today &&
      !isNaN(new Date(item.expirationDate).getTime()) // Check if it's a valid date
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" /> Add New Insurance
          </DialogTitle>
          <DialogDescription>
            Enter insurance policy details to create a new record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)} // Handles submission and validation
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-blue-600" />{" "}
              <h3 className="text-lg font-medium">Insurance Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              {/* Insurance Type Select Field */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset insured fields if type changes to primary and relationship is "Self"
                          if (value === "primary") {
                            form.setValue("relationship", "0");
                            form.setValue("insuredName", "");
                            form.setValue("insuredDOB", "");
                            form.setValue("insuredGender", "");
                            form.setValue("insuredPhone", "");
                            form.setValue("insuredAddress", "");
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {!hasActivePrimary && (
                            <SelectItem value="primary">Primary</SelectItem>
                          )}
                          <SelectItem value="secondary">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Name Field */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Blue Cross Blue Shield"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plan Name Field */}
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PPO Plus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Policy Number Field */}
              <FormField
                control={form.control}
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ABC123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Group Number Field (Optional) */}
              <FormField
                control={form.control}
                name="groupNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., GRP98765"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Effective Date Field */}
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration Date Field (Optional) */}
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Relationship to Policyholder */}
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Policyholder</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""} // Ensure value is a string
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset insured fields if relationship changes to "Self"
                          if (value === "0") {
                            form.setValue("insuredName", "");
                            form.setValue("insuredDOB", "");
                            form.setValue("insuredGender", "");
                            form.setValue("insuredPhone", "");
                            form.setValue("insuredAddress", "");
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Self</SelectItem>
                          <SelectItem value="1">Spouse</SelectItem>
                          <SelectItem value="2">Child</SelectItem>
                          <SelectItem value="3">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Insured Info Section - conditionally rendered */}
            {form.watch("relationship") !== "0" &&
              form.watch("relationship") !== "" && (
                <div className="space-y-4 pt-6 border-t mt-6">
                  {" "}
                  {/* Added spacing and border-top for separation */}
                  <h2 className="text-lg font-semibold mb-3">
                    Policyholder (Insured) Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Insured Name */}
                    <FormField
                      control={form.control}
                      name="insuredName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insured Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter full name"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Insured DOB */}
                    <FormField
                      control={form.control}
                      name="insuredDOB"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Insured Gender */}
                    <FormField
                      control={form.control}
                      name="insuredGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insured Gender</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Insured Phone */}
                    <FormField
                      control={form.control}
                      name="insuredPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter phone number"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Insured Address */}
                    <FormField
                      control={form.control}
                      name="insuredAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter address"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Insurance
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInsuranceDialog;
