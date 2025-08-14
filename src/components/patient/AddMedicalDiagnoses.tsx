import type React from "react";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import { Plus, X, Calendar, UserPlus } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { addPatinetDiagnosis } from "@/services/operations/patient";
import { useParams } from "react-router-dom";
// Define the schema for a single diagnosis entry
const diagnosisSchema = z.object({
  icd10: z.string().min(1, "ICD-10 code is required."),
  diagnosis: z.string().min(1, "Diagnosis description is required."),
  status: z.enum(["Active", "Resolved", "Chronic", "Inactive"], {
    errorMap: () => ({ message: "Please select a valid status." }),
  }),
  type: z.enum(["primary", "secondary"], {
    errorMap: () => ({ message: "Please select a valid type." }),
  }),
});

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

interface AddDiagnosisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchPatient: () => void;
}

const AddMedicalDiagnoses: React.FC<AddDiagnosisDialogProps> = ({
  open,
  onOpenChange,
  fetchPatient,
}) => {
  const { token } = useSelector((state: RootState) => state.auth); // Assuming token is available here
  const { id } = useParams();
  // Use react-hook-form for the single diagnosis form
  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      icd10: "",
      diagnosis: "",
      status: "Chronic", // Default to Chronic or another suitable default
      type: "primary", // Default to primary or another suitable default
    },
  });

  const [icdOptions, setIcdOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [icdOpen, setIcdOpen] = useState(false);
  const [description, setDescription] = useState(""); // State for ICD-10 description

  // Debounced ICD-10 code fetching
  useEffect(() => {
    const fetchICDCodes = async () => {
      if (!searchTerm) {
        setIcdOptions([]);
        return;
      }

      try {
        const response = await fetch(
          `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code&terms=${searchTerm}`
        );
        const data = await response.json();

        if (Array.isArray(data[3])) {
          const options = data[3].map(([code, desc]: [string, string]) => ({
            value: code,
            label: `${code} - ${desc}`,
          }));
          setIcdOptions(options);
        }
      } catch (err) {
        console.error("Failed to fetch ICD codes:", err);
      }
    };

    const timeout = setTimeout(fetchICDCodes, 300); // debounce
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch ICD-10 description based on selected ICD-10 code
  useEffect(() => {
    const fetchICD10Description = async () => {
      const currentIcd10 = form.watch("icd10"); // Watch the icd10 field from the form
      if (!currentIcd10) {
        setDescription("");
        return;
      }

      try {
        const response = await fetch(
          `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code&terms=${currentIcd10}`
        );
        const data = await response.json();

        if (
          Array.isArray(data[3]) &&
          data[3].length > 0 &&
          Array.isArray(data[3][0])
        ) {
          const desc = data[3][0][1] || "";
          setDescription(desc);
          form.setValue("diagnosis", desc); // Set the diagnosis field in the form
        } else {
          setDescription("");
        }
      } catch (err) {
        console.error("ICD fetch error:", err);
        setDescription("");
      }
    };

    const timeout = setTimeout(fetchICD10Description, 300); // debounce
    return () => clearTimeout(timeout);
  }, [form.watch("icd10")]); // Re-run when icd10 changes in the form

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset();
      setDescription(""); // Clear description on reset
      setSearchTerm(""); // Clear search term on reset
      setIcdOptions([]); // Clear ICD options on reset
    }
  }, [open, form]);

  const onSubmit = async (data: DiagnosisFormValues) => {
    try {
      await addPatinetDiagnosis(data, token, id);

      fetchPatient();
      form.reset();
      setDescription("");
      setSearchTerm("");
      setIcdOptions([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding diagnosis:", error);
      toast.error("Failed to add diagnosis. Please try again.");
    }
  };

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
            <UserPlus className="h-5 w-5 text-blue-600" />
            Add New Diagnosis
          </DialogTitle>
          <DialogDescription>
            Enter diagnosis information to create a new diagnosis record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Diagnosis Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name="icd10"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ICD-10 Code</FormLabel>
                    <Popover open={icdOpen} onOpenChange={setIcdOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Input
                            {...field}
                            onClick={() => setIcdOpen(true)}
                            readOnly
                            placeholder="Select ICD-10 Code"
                          />
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        side="bottom"
                        align="start"
                        className="w-[300px] p-0 max-h-[300px] overflow-y-auto z-50"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search ICD-10 code..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                          />
                          <CommandList>
                            {icdOptions.map((option) => (
                              <CommandItem
                                key={option.value}
                                onSelect={() => {
                                  form.setValue("icd10", option.value);
                                  form.setValue(
                                    "diagnosis",
                                    option.label.split(" - ")[1] || ""
                                  );
                                  setDescription(
                                    option.label.split(" - ")[1] || ""
                                  );
                                  setIcdOpen(false);
                                  setSearchTerm(""); // Clear search term after selection
                                }}
                              >
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Diagnosis" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Chronic">Chronic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
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
                Add Diagnosis
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicalDiagnoses;
