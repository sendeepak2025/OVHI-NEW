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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Plus,
  X,
  Calendar,
  FileText,
  Shield,
  Pill,
  UserPlus,
} from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { createPatientAPI } from "../../services/operations/patient";
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
import { showError } from "../ui/customAlert";
import Swal from "sweetalert2";
import { Label } from "../ui/label";

// --- START: MODIFIED CODE ---

// Define the mapping for service types
const serviceTypeMap = {
  RPM: 1,
  CCM: 2,
  PCM: 3,
};

// Reverse map for display if needed, though not strictly used in this fix
const serviceTypeReverseMap = {
  1: "RPM",
  2: "CCM",
  3: "PCM",
};

const patientSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  middleName: z.string().optional(),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  gender: z.string().min(1, { message: "Please select a gender" }),
  status: z.string().min(1, { message: "Please select a status" }),

  // MODIFICATION 1: Update Zod schema to expect numbers (1, 2, 3)
  patientService: z
    .array(z.number()) // Accept any number
    .min(1, { message: "Please select at least one service." })
    .refine(
      (services) => {
        // Not allowed: PCM (3) and CCM (2) selected together
        if (
          services.includes(serviceTypeMap.PCM) &&
          services.includes(serviceTypeMap.CCM)
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Selecting PCM and CCM together is not allowed.",
      }
    ),
  addressLine1: z
    .string()
    .min(5, { message: "Address line 1 must be at least 5 characters" }),
  addressLine2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  zipCode: z
    .string()
    .regex(/^\d{5}$/, { message: "Zip Code must be 5 digits" }),
  birthDate: z.string().min(1, { message: "Birth date is required" }),
  lastVisit: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z
    .string()
    .min(10, { message: "Emergency contact phone is required" }),
  maritalStatus: z.string().optional(),
  preferredLanguage: z.string().optional(),
  ethnicity: z.string().optional(),
  height: z.any().optional(),
  weight: z.any().optional(),
  bmi: z.any().optional(),
  allergies: z.string().optional(),
  bloodPressure: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .refine(
      (val) => !val || /^\d{2,3}\/\d{2,3}$/.test(val),
      "Invalid blood pressure format (e.g., 120/80)"
    )
    .optional(),

  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  insurance: z
    .array(
      z.object({
        type: z.enum(["primary", "secondary"]),
        company: z.string(),
        plan: z.string(),
        policyNumber: z.string(),
        groupNumber: z.string(),
        effectiveDate: z.string(),
        expirationDate: z.string(),
        relationship: z.string(),
        insuredName: z.string(),
        insuredDOB: z.string(),
        insuredGender: z.string(),
        insuredPhone: z.string(),
        insuredAddress: z.string(),
      })
    )
    .optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPatient?: (patient: any) => void;
}

const AddPatientDialog: React.FC<AddPatientDialogProps> = ({
  open,
  onOpenChange,
  onAddPatient,
}) => {
  const [allergyList, setAllergyList] = useState<
    Array<{ allergen: string; category: any; reaction: string }>
  >([]);
  const [newAllergy, setNewAllergy] = useState<{
    allergen: string;
    category: any;
    reaction: string;
  }>({
    allergen: "",
    category: "",
    reaction: "",
  });

  const { user } = useSelector((state: RootState) => state.auth);

  // Insurance state
  const [insuranceList, setInsuranceList] = useState<
    Array<{
      type: "primary" | "secondary";
      company: string;
      plan: string;
      policyNumber: string;
      groupNumber: string;
      effectiveDate: string;
      expirationDate: string;
      relationship: string;
      insuredName: string;
      insuredDOB: string;
      insuredGender: string;
      insuredPhone: string;
      insuredAddress: string;
    }>
  >([]);
  const [newInsurance, setNewInsurance] = useState({
    type: "primary" as "primary" | "secondary",
    company: "",
    plan: "",
    policyNumber: "",
    groupNumber: "",
    effectiveDate: "",
    expirationDate: "",
    relationship: "",
    insuredName: "",
    insuredDOB: "",
    insuredGender: "",
    insuredPhone: "",
    insuredAddress: "",
  });

  // Medications state
  const [medicationsList, setMedicationsList] = useState<
    Array<{
      name: string;
      dosage: string;
      frequency: string;
      refills: string;
      startDate: string;
      endDate?: string;
      status: string;
    }>
  >([]);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    refills: "",
    startDate: "",
    endDate: "",
    status: "Active",
  });

  // Diagnosis state
  const [diagnosisList, setDiagnosisList] = useState<
    Array<{
      date: string;
      icd10: string;
      diagnosis: string;
      status: string;
      type: string;
    }>
  >([]);
  const [newDiagnosis, setNewDiagnosis] = useState({
    date: "",
    icd10: "",
    diagnosis: "",
    status: "",
    type: "",
  });

  // Notes state
  const [notesList, setNotesList] = useState<
    Array<{
      note: string;
      type: string;
      duration: string;
    }>
  >([]);

  const [newNote, setNewNote] = useState({
    note: "",
    type: "",
    duration: "",
  });

  const [icdOptions, setIcdOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [icdOpen, setIcdOpen] = useState(false);
  const { token } = useSelector((state: RootState) => state.auth);

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
          const options = data[3].map(([code, desc]) => ({
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

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      status: "",
      // Changed default value to an empty array for multiple selections
      patientService: [], // This will now hold numbers
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "USA",
      zipCode: "",
      birthDate: "",
      lastVisit: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      maritalStatus: "",
      preferredLanguage: "English",
      ethnicity: "",
      height: "",
      weight: "",
      bmi: "",
      allergies: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      insurance: [],
    },
  });

  // Calculate BMI when height or weight changes
  const calculateBMI = (heightCm: number, weightLbs: number) => {
    if (heightCm > 0 && weightLbs > 0) {
      const heightInches = heightCm / 2.54;
      const bmi = (weightLbs / (heightInches * heightInches)) * 703;
      return Math.round(bmi * 10) / 10;
    }
    return 0;
  };

  // Watch height and weight for BMI calculation
  const heightValue = form.watch("height");
  const weightValue = form.watch("weight");
  useEffect(() => {
    if (heightValue && weightValue) {
      const calculatedBMI = calculateBMI(heightValue, weightValue);
      form.setValue("bmi", calculatedBMI);
    }
  }, [heightValue, weightValue, form]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset();
      setAllergyList([]);
      setInsuranceList([]);
      setMedicationsList([]);
      setDiagnosisList([]);
      setNotesList([]);
    }
  }, [open, form]);

  const categrois = [
    { key: 1, value: "food" },
    { key: 2, value: "medication" },
    { key: 3, value: "envoirment" },
    { key: 4, value: "biological" },
  ];

  const onSubmit = async (data: PatientFormValues) => {
    try {
      const serviceMap: Record<string, number> = {
        RPM: 1,
        CCM: 2,
        PCM: 3,
      };

      const patientServiceMappedToBackend = data.patientService.map(
        (service) => serviceMap[service] ?? service // fallback if not matched
      );

      const patientData = {
        ...data,
        providerId: user.id,
        name: `${data.firstName} ${
          data.middleName ? data.middleName + " " : ""
        }${data.lastName}`,
        address: `${data.addressLine1}${
          data.addressLine2 ? ", " + data.addressLine2 : ""
        }, ${data.city}, ${data.state}, ${data.country} ${data.zipCode}`,
        emergencyContact: ` ${data.emergencyContactPhone}`,
        insurance: insuranceList,
        currentMedications: medicationsList,
        allergies: allergyList,
        diagnosis: diagnosisList,
        notes: notesList,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patientService: patientServiceMappedToBackend,
      };

      const response = await createPatientAPI(patientData, token);

      console.log(response);
      if (response) {
        if (onAddPatient) {
          onAddPatient(patientData);
        }

        toast.success("Patient added successfully!");
        form.reset();
        setInsuranceList([]);
        setMedicationsList([]);
        setAllergyList([]);
        setDiagnosisList([]);
        setNotesList([]);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error("Failed to add patient. Please try again.");
    }
  };

  const addAllergy = () => {
    if (newAllergy.allergen && newAllergy.category && newAllergy.reaction) {
      setAllergyList([...allergyList, newAllergy]);
      setNewAllergy({ allergen: "", category: "", reaction: "" });
    }
  };

  const removeAllergy = (index: number) => {
    setAllergyList(allergyList.filter((_, i) => i !== index));
  };

  const addInsurance = () => {
    if (
      newInsurance.company &&
      newInsurance.plan &&
      newInsurance.policyNumber
    ) {
      setInsuranceList([...insuranceList, newInsurance]);
      setNewInsurance({
        type: "primary",
        company: "",
        plan: "",
        policyNumber: "",
        groupNumber: "",
        effectiveDate: "",
        expirationDate: "",
        relationship: "",
        insuredName: "",
        insuredDOB: "",
        insuredGender: "",
        insuredPhone: "",
        insuredAddress: "",
      });
    }
  };

  const removeInsurance = (index: number) => {
    setInsuranceList(insuranceList.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      setMedicationsList([...medicationsList, newMedication]);
      setNewMedication({
        name: "",
        dosage: "",
        frequency: "",
        refills: "",
        startDate: "",
        endDate: "",
        status: "Active",
      });
    }
  };

  const removeMedication = (index: number) => {
    setMedicationsList(medicationsList.filter((_, i) => i !== index));
  };

  const addDiagnosis = () => {
    if (
      newDiagnosis.date &&
      newDiagnosis.icd10 &&
      newDiagnosis.diagnosis &&
      newDiagnosis.status &&
      newDiagnosis.type
    ) {
      setDiagnosisList([...diagnosisList, newDiagnosis]);
      setNewDiagnosis({
        date: "",
        icd10: "",
        diagnosis: "",
        status: "",
        type: "",
      });
    }
  };

  const removeDiagnosis = (index: number) => {
    setDiagnosisList(diagnosisList.filter((_, i) => i !== index));
  };

  const addNote = () => {
    if (!newNote.note || !newNote.type || !newNote.duration) return;

    const normalizedNote = {
      ...newNote,
      type: newNote.type.toLowerCase(),
    };

    setNotesList([...notesList, normalizedNote]);

    setNewNote({
      note: "",
      type: "",
      duration: "",
    });
  };

  const removeNote = (index: number) => {
    setNotesList(notesList.filter((_, i) => i !== index));
  };

  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchICD10Description = async () => {
      if (!newDiagnosis.icd10) {
        setDescription("");
        return;
      }

      try {
        const response = await fetch(
          `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code&terms=${newDiagnosis.icd10}`
        );
        const data = await response.json();

        // data[3] contains: [ [code, description], ... ]
        if (
          Array.isArray(data[3]) &&
          data[3].length > 0 &&
          Array.isArray(data[3][0])
        ) {
          const desc = data[3][0][1] || "";
          setDescription(desc);
          setNewDiagnosis((prev) => ({
            ...prev,
            diagnosis: desc,
          }));
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
  }, [newDiagnosis.icd10]);

  const stackedShowError = (text: string) => {
    const container = document.getElementById("custom-toast-container");
    if (!container) return;

    const toast = document.createElement("div");

    toast.innerHTML = `
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

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const onError = (errors: any) => {
    Object.values(errors).forEach((error: any) => {
      if (error?.message) {
        stackedShowError(error.message);
      }
    });
  };

  // MODIFICATION 2: Update handleServiceChange to work with numbers
  const handleServiceChange = (
    selectedValue: 1 | 2 | 3, // Use the exact type
    currentServices: (1 | 2 | 3)[]
  ) => {
    const newServices = currentServices.includes(selectedValue)
      ? currentServices.filter((service) => service !== selectedValue)
      : [...currentServices, selectedValue];

    form.setValue("patientService", newServices, { shouldValidate: true });
  };

  const today = new Date();

  // Get active insurance types
  const activeTypes = new Set(
    insuranceList
      .filter((ins) => new Date(ins.expirationDate) > today)
      .map((ins) => ins.type)
  );

  const isDuplicateInsurance = activeTypes.has(newInsurance.type);

  // --- END: MODIFIED CODE ---

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Add New Patient
          </DialogTitle>
          <DialogDescription>
            Enter patient information to create a new patient record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-6"
          >
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter middle name (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter email address"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
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
                        <FormLabel>Patient Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Critical</SelectItem>
                            <SelectItem value="2">Abnormal</SelectItem>
                            <SelectItem value="3">Normal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* --- START: MODIFIED patientService FIELD --- */}
                  <FormField
                    control={form.control}
                    name="patientService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type *</FormLabel>
                        <Popover open={icdOpen} onOpenChange={setIcdOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={icdOpen}
                                className="w-full justify-between"
                              >
                                {field.value && field.value.length > 0
                                  ? field.value
                                      .map(
                                        (val) =>
                                          serviceTypeReverseMap[
                                            val as keyof typeof serviceTypeReverseMap
                                          ]
                                      ) // Display the names
                                      .join(", ")
                                  : "Select Enrolled For"}
                                <Calendar className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search services..." />
                              <CommandList>
                                <CommandItem
                                  onSelect={() => {
                                    handleServiceChange(
                                      1,
                                      field.value as (1 | 2 | 3)[]
                                    );
                                  }}
                                  className="cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(
                                      field.value as (1 | 2 | 3)[]
                                    ).includes(1)}
                                    readOnly
                                    className="mr-2"
                                  />
                                  RPM
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => {
                                    handleServiceChange(
                                      3,
                                      field.value as (1 | 2 | 3)[]
                                    );
                                  }}
                                  className="cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(
                                      field.value as (1 | 2 | 3)[]
                                    ).includes(3)}
                                    readOnly
                                    className="mr-2"
                                  />
                                  PCM
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => {
                                    handleServiceChange(
                                      2,
                                      field.value as (1 | 2 | 3)[]
                                    );
                                  }}
                                  className="cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(
                                      field.value as (1 | 2 | 3)[]
                                    ).includes(2)}
                                    readOnly
                                    className="mr-2"
                                  />
                                  CCM
                                </CommandItem>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* --- END: MODIFIED patientService FIELD --- */}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1 *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter street address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Apartment, suite, etc. (optional)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Zip Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 987-6543" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lastVisit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Visit</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                {/* Allergies Section */}
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Allergies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Allergen (e.g., Penicillin)"
                    value={newAllergy.allergen}
                    onChange={(e) =>
                      setNewAllergy({ ...newAllergy, allergen: e.target.value })
                    }
                  />
                  <Select
                    onValueChange={(value) =>
                      setNewAllergy({ ...newAllergy, category: value })
                    }
                    value={newAllergy.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categrois.map((category) => (
                        <SelectItem key={category.key} value={category.value}>
                          {category.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Reaction (e.g., Rash, Anaphylaxis)"
                    value={newAllergy.reaction}
                    onChange={(e) =>
                      setNewAllergy({ ...newAllergy, reaction: e.target.value })
                    }
                  />
                </div>
                <Button type="button" onClick={addAllergy}>
                  <Plus className="mr-2 h-4 w-4" /> Add Allergy
                </Button>
                <div className="space-y-2">
                  {allergyList.map((allergy, index) => (
                    <Badge
                      key={index}
                      className="bg-gray-200 text-gray-800 flex items-center justify-between p-2 pr-1"
                    >
                      <span>
                        {allergy.allergen} ({allergy.category}):{" "}
                        {allergy.reaction}
                      </span>
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeAllergy(index)}
                      />
                    </Badge>
                  ))}
                </div>

                {/* Additional Medical Fields */}
              </TabsContent>

              <TabsContent value="insurance" className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Insurance Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Insurance Type
                    </label>
                    <Select
                      onValueChange={(value: "primary" | "secondary") =>
                        setNewInsurance({ ...newInsurance, type: value })
                      }
                      value={newInsurance.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Company
                    </label>
                    <Input
                      placeholder="Company"
                      value={newInsurance.company}
                      onChange={(e) =>
                        setNewInsurance({
                          ...newInsurance,
                          company: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Plan
                    </label>
                    <Input
                      placeholder="Plan"
                      value={newInsurance.plan}
                      onChange={(e) =>
                        setNewInsurance({
                          ...newInsurance,
                          plan: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Policy Number
                    </label>
                    <Input
                      placeholder="Policy Number"
                      value={newInsurance.policyNumber}
                      onChange={(e) =>
                        setNewInsurance({
                          ...newInsurance,
                          policyNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Group Number
                    </label>
                    <Input
                      placeholder="Group Number"
                      value={newInsurance.groupNumber}
                      onChange={(e) =>
                        setNewInsurance({
                          ...newInsurance,
                          groupNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={newInsurance.effectiveDate}
                      onChange={(e) =>
                        setNewInsurance({
                          ...newInsurance,
                          effectiveDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Expiration Date
                    </label>
                    <Input
                      type="date"
                      value={newInsurance.expirationDate}
                      onChange={(e) =>
                        setNewInsurance({
                          ...newInsurance,
                          expirationDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Relationship to Policyholder
                    </label>
                    <Select
                      onValueChange={(value) =>
                        setNewInsurance({
                          ...newInsurance,
                          relationship: value,
                        })
                      }
                      value={newInsurance.relationship}
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
                  </div>
                  {/* Insured Info Section */}
                  {/* Insured Info Section */}
                  <hr />
                  <hr />
                  {newInsurance.relationship != "0" &&
                    newInsurance.relationship != "" && (
                      <>
                        <h2 className="text-lg font-semibold mb-3">
                          Policyholder (Insured) Information
                        </h2>
                        <br />

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Insured Name
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter Your fullname"
                            value={newInsurance.insuredName}
                            onChange={(e) =>
                              setNewInsurance({
                                ...newInsurance,
                                insuredName: e.target.value,
                              })
                            }
                            className="w-full border px-3 py-2 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Date of Birth
                          </label>
                          <Input
                            type="date"
                            value={newInsurance.insuredDOB}
                            onChange={(e) =>
                              setNewInsurance({
                                ...newInsurance,
                                insuredDOB: e.target.value,
                              })
                            }
                            className="w-full border px-3 py-2 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Insured Gender
                          </label>
                          <Select
                            value={newInsurance.insuredGender}
                            onValueChange={(value) =>
                              setNewInsurance({
                                ...newInsurance,
                                insuredGender: value,
                              })
                            }
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
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Phone
                          </label>
                          <Input
                            type="tel"
                            placeholder="Enter your phone number"
                            value={newInsurance.insuredPhone}
                            onChange={(e) =>
                              setNewInsurance({
                                ...newInsurance,
                                insuredPhone: e.target.value,
                              })
                            }
                            className="w-full border px-3 py-2 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Address
                          </label>
                          <Input
                            placeholder="Enter your address"
                            type="text"
                            value={newInsurance.insuredAddress}
                            onChange={(e) =>
                              setNewInsurance({
                                ...newInsurance,
                                insuredAddress: e.target.value,
                              })
                            }
                            className="w-full border px-3 py-2 rounded"
                          />
                        </div>
                      </>
                    )}
                </div>

                <Button
                  type="button"
                  onClick={addInsurance}
                  disabled={isDuplicateInsurance}
                  className={
                    isDuplicateInsurance ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Insurance
                </Button>

                <div className="space-y-2">
                  {insuranceList.map((insurance, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-100 text-blue-800 flex items-center justify-between p-2 pr-1"
                    >
                      <span>
                        {insurance.type.charAt(0).toUpperCase() +
                          insurance.type.slice(1)}{" "}
                        - {insurance.company} ({insurance.plan}) -{" "}
                        {insurance.policyNumber}
                      </span>
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeInsurance(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="medications" className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Current Medications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Medication Name
                    </label>
                    <Input
                      placeholder="Medication Name"
                      value={newMedication.name}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Dosage
                    </label>
                    <Input
                      placeholder="Dosage (e.g., 10mg)"
                      value={newMedication.dosage}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          dosage: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Frequency
                    </label>
                    <Input
                      placeholder="Frequency (e.g., Once daily)"
                      value={newMedication.frequency}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          frequency: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Refills
                    </label>
                    <Input
                      placeholder="refills"
                      value={newMedication.refills}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          refills: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={newMedication.startDate}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date (optional)
                    </label>
                    <Input
                      type="date"
                      value={newMedication.endDate}
                      onChange={(e) =>
                        setNewMedication({
                          ...newMedication,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <Select
                      onValueChange={(value) =>
                        setNewMedication({ ...newMedication, status: value })
                      }
                      value={newMedication.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Discontinued">
                          Discontinued
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="button" onClick={addMedication}>
                  <Plus className="mr-2 h-4 w-4" /> Add Medication
                </Button>

                <div className="space-y-2">
                  {medicationsList.map((med, index) => (
                    <Badge
                      key={index}
                      className="bg-purple-100 text-purple-800 flex items-center justify-between p-2 pr-1"
                    >
                      <span>
                        {med.name} - {med.dosage} ({med.frequency}) -{" "}
                        {med.status}
                      </span>
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeMedication(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="diagnosis" className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Diagnoses
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={newDiagnosis.date}
                      onChange={(e) =>
                        setNewDiagnosis({
                          ...newDiagnosis,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ICD-10 Code
                    </label>
                    <Popover open={icdOpen} onOpenChange={setIcdOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={icdOpen}
                          className="w-full justify-between"
                        >
                          {newDiagnosis.icd10
                            ? `${newDiagnosis.icd10} - ${description}`
                            : "Select ICD-10 Code..."}
                          <Calendar className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search ICD-10 codes..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                          />
                          <CommandList>
                            {icdOptions.length > 0 ? (
                              icdOptions.map((option: any) => (
                                <CommandItem
                                  key={option.value}
                                  onSelect={() => {
                                    setNewDiagnosis((prev) => ({
                                      ...prev,
                                      icd10: option.value,
                                      diagnosis: option.label,
                                    }));
                                    setIcdOpen(false);
                                    setSearchTerm("");
                                  }}
                                  className="cursor-pointer"
                                >
                                  {option.label}
                                </CommandItem>
                              ))
                            ) : (
                              <CommandItem disabled>
                                No results found.
                              </CommandItem>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Diagnosis Description
                    </label>
                    <Input
                      placeholder="Diagnosis Description"
                      value={newDiagnosis.diagnosis}
                      onChange={(e) =>
                        setNewDiagnosis({
                          ...newDiagnosis,
                          diagnosis: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <Select
                      onValueChange={(value) =>
                        setNewDiagnosis({ ...newDiagnosis, status: value })
                      }
                      value={newDiagnosis.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Chronic">Chronic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Type
                    </label>
                    <Select
                      onValueChange={(value) =>
                        setNewDiagnosis({ ...newDiagnosis, type: value })
                      }
                      value={newDiagnosis.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Primary">Primary</SelectItem>
                        <SelectItem value="Secondary">Secondary</SelectItem>
                        <SelectItem value="Co-morbidity">
                          Co-morbidity
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="button" onClick={addDiagnosis}>
                  <Plus className="mr-2 h-4 w-4" /> Add Diagnosis
                </Button>

                <div className="space-y-2">
                  {diagnosisList.map((diag, index) => (
                    <Badge
                      key={index}
                      className="bg-green-100 text-green-800 flex items-center justify-between p-2 pr-1"
                    >
                      <span>
                        {diag.date}: {diag.icd10} - {diag.diagnosis} (
                        {diag.status}, {diag.type})
                      </span>
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeDiagnosis(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="vitals" className="space-y-4">
                <h3 className="text-lg font-medium">Vital Signs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (In cms)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 68"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (In lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 150"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bmi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BMI</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Calculated BMI"
                            {...field}
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bloodPressure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Pressure</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 120/80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="heartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heart Rate (bpm)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 72" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°F)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 98.6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="notes" className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Patient Notes
                </h3>

                <div className="space-y-2">
                  {/* Note Textarea */}
                  <Textarea
                    placeholder="Add a new note here..."
                    value={newNote.note}
                    onChange={(e) =>
                      setNewNote({ ...newNote, note: e.target.value })
                    }
                  />

                  {/* Service Type Dropdown */}
                  <Select
                    value={newNote.type}
                    onValueChange={(value) =>
                      setNewNote({ ...newNote, type: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(form.watch("patientService") || []).map((type) => (
                        <SelectItem
                          key={type}
                          value={serviceTypeReverseMap[type]}
                        >
                          {serviceTypeReverseMap[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Duration Field */}
                  <div>
                    <Label htmlFor="duration">Duration (in minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newNote.duration}
                      onChange={(e) =>
                        setNewNote({ ...newNote, duration: e.target.value })
                      }
                      placeholder="e.g. 15"
                    />
                  </div>

                  {/* Add Note Button */}
                  <Button type="button" onClick={addNote}>
                    <Plus className="mr-2 h-4 w-4" /> Add Note
                  </Button>
                </div>

                {/* Render Notes */}
                <div className="space-y-2">
                  {notesList.map((noteItem, index) => (
                    <Badge
                      key={index}
                      className="bg-yellow-100 text-yellow-800 flex items-center justify-between p-2 pr-1"
                    >
                      <div>
                        <span className="font-semibold mr-2">
                          [{noteItem.type}]
                        </span>
                        <span>{noteItem.note}</span>
                        {noteItem.duration && (
                          <span className="ml-2 text-xs text-gray-600">
                            ({noteItem.duration} min)
                          </span>
                        )}
                      </div>
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeNote(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="submit">Add Patient</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;
