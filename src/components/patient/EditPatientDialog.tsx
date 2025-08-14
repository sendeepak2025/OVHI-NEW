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
import { Plus, X, Calendar, FileText, Shield, Pill, Edit } from "lucide-react";
import {
  getSinglePatientAPI,
  editPatientAPI,
} from "../../services/operations/patient";
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
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Label } from "../ui/label";

const serviceTypeMap = {
  RPM: 1,
  CCM: 2,
  PCM: 3,
};

// Reverse map for display
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
  patientService: z
    .array(z.number()) // Accept any number
    .min(1, { message: "Please select at least one service." })
    .refine(
      (services) => {
        const hasRPM = services.includes(serviceTypeMap.RPM);
        const hasCCM = services.includes(serviceTypeMap.CCM);
        const hasPCM = services.includes(serviceTypeMap.PCM);

        // Not allowed: CCM (2) AND PCM (3) together (regardless of RPM)
        if (hasCCM && hasPCM) {
          return false; // Invalid combination
        }

        return true; // All other combinations are valid
      },
      {
        message:
          "Patients cannot be enrolled in both CCM and PCM services simultaneously.",
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
  emergencyContactPhone: z
    .string()
    .min(10, { message: "Emergency contact phone is required" }),
  preferredLanguage: z.string().optional(),
  ethnicity: z.string().optional(),
  height: z.any().optional(),
  weight: z.any().optional(),
  bmi: z.any().optional(),
  allergies: z.string().optional(),
  bloodPressure: z.any().optional(),

  heartRate: z.any().optional(),
  temperature: z.any().optional(),
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
      })
    )
    .optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface Patient {
  patientId?: string;
  firstName?: string;
  middleName?: string;
  patientService: any;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  status?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  birthDate?: string;
  lastVisit?: string;
  emergencyContact?: string;
  preferredLanguage?: string;
  ethnicity?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  allergies?: Array<{ allergen: string; category: string; reaction: string }>;
  insurance?: Array<{
    type: "primary" | "secondary";
    company: string;
    plan: string;
    policyNumber: string;
    groupNumber: string;
    effectiveDate: string;
    expirationDate: string;
  }>;
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    refills: string;
    startDate: string;
    endDate?: string;
    status: string;
  }>;
  diagnosis?: Array<{
    date: string;
    icd10: string;
    diagnosis: string;
    status: string;
    type: string;
  }>;
  notes?:
    | Array<{
        note: string;
        type?: string;
        note_id?: string;
        duration?: string;
        created?: string;
      }>
    | string;
}

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient2: Patient | null;
  onPatientUpdated?: (patient: any) => void;
  onEditPatient?: (patient: any) => void;
  fetchPatient?: () => void;
}

const EditPatientDialog: React.FC<EditPatientDialogProps> = ({
  open,
  onOpenChange,
  patient2,
  onPatientUpdated,
  onEditPatient,
  fetchPatient,
}) => {
  const [allergyList, setAllergyList] = useState<
    Array<{ allergen: string; category: string; reaction: string }>
  >([]);
  const [newAllergy, setNewAllergy] = useState({
    allergen: "",
    category: "",
    reaction: "",
  });
  const [patient, setPatient] = useState<Partial<Patient>>({});
  const { token } = useSelector((state: RootState) => state.auth);

  // Mock function to simulate API call
  const fetchSinglePatient = async () => {
    if (!patient2?.patientId) return;
    const response = await getSinglePatientAPI(patient2?.patientId, token);
    setPatient(response);
  };

  useEffect(() => {
    fetchSinglePatient();
  }, [patient2, patient2?.patientId]);

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
      note_id: string | null;
      type: string;
      duration: string;
    }>
  >([]);

  const [newNote, setNewNote] = useState({
    note: "",
    type: "",
    note_id: null,
    duration: "",
  });

  const [icdOptions, setIcdOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [icdOpen, setIcdOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

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
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      birthDate: "",
      lastVisit: "",
      emergencyContactPhone: "",
      preferredLanguage: "English",
      ethnicity: "",
      height: 0,
      patientService: [], // Fixed: Changed from "1" to empty array
      weight: 0,
      bmi: 0,
      allergies: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      insurance: [],
    },
  });

  // Function to handle service selection changes
  const handleServiceChange = (
    serviceId: number,
    currentServices: (1 | 2 | 3)[]
  ) => {
    const newServices = currentServices.includes(serviceId as 1 | 2 | 3)
      ? currentServices.filter((id) => id !== serviceId)
      : [...currentServices, serviceId as 1 | 2 | 3];

    form.setValue("patientService", newServices, { shouldValidate: true }); // Validate on change
  };

  // Function to convert patient service data to array format
  const convertPatientServiceToArray = (patientService: any): (1 | 2 | 3)[] => {
    if (Array.isArray(patientService)) {
      // If it's already an array of numbers, return as is
      if (patientService.every((item) => typeof item === "number")) {
        return patientService as (1 | 2 | 3)[];
      }
      // If it's an array of strings, convert to numbers
      return patientService
        .map((service) => {
          if (typeof service === "string") {
            return serviceTypeMap[service as keyof typeof serviceTypeMap] || 1;
          }
          return service;
        })
        .filter(Boolean);
    }

    if (typeof patientService === "string") {
      // Single service as string
      const serviceId =
        serviceTypeMap[patientService as keyof typeof serviceTypeMap];
      return serviceId ? [serviceId as 1 | 2 | 3] : [];
    }

    if (typeof patientService === "number") {
      // Single service as number
      return [patientService as 1 | 2 | 3];
    }

    return [];
  };

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

  const onSubmit = async (data: PatientFormValues) => {
    try {
      const patientData = {
        ...data,
        patientId: patient2?.patientId,
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
        updatedAt: new Date().toISOString(),
      };

      const response = await editPatientAPI(patientData, token);
      // Call the appropriate callback
      if (onEditPatient) {
        onEditPatient(response);
      }
      if (onPatientUpdated) {
        onPatientUpdated(response);
      }

      // Reset form and close dialog
      fetchPatient();
      form.reset();
      setInsuranceList([]);
      setMedicationsList([]);
      setAllergyList([]);
      setDiagnosisList([]);
      setNotesList([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Failed to update patient. Please try again.");
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
    }
  };

  const statusMapping = {
    Critical: "1",
    Abnormal: "2",
    Normal: "3",
  };

  useEffect(() => {
    if (patient) {
      // Set form fields
      form.reset({
        firstName: patient?.firstName || "",
        middleName: patient?.middleName || "",
        lastName: patient?.lastName || "",
        email: patient.email || "",
        phone: patient.phone || "",
        gender: patient.gender || "",
        patientService: convertPatientServiceToArray(patient.patientService), // Fixed: Convert to proper array format
        status: statusMapping[patient.status] || "",
        addressLine1: patient.addressLine1 || "",
        addressLine2: patient.addressLine2 || "",
        city: patient.city || "New York",
        state: patient.state || "NY",
        country: patient.country || "USA",
        zipCode: patient.zipCode || "",
        birthDate: patient.birthDate?.split("T")[0] || "",
        lastVisit: patient.lastVisit?.split("T")[0] || "",
        emergencyContactPhone:
          patient.emergencyContact?.split("-").pop()?.trim() || "",
        preferredLanguage: patient.preferredLanguage || "English",
        ethnicity: patient.ethnicity || "",
        height: patient.height || 0,
        weight: patient.weight || 0,
        bmi: patient.bmi || 0,
        allergies: "",
        bloodPressure: patient?.bloodPressure || "",
        heartRate: patient?.heartRate || "",
        temperature: patient?.temperature || "",
      });

      // Set array-based states
      setAllergyList(patient.allergies || []);
      setInsuranceList(patient.insurance || []);
      setMedicationsList(patient.currentMedications || []);
      setDiagnosisList(patient.diagnosis || []);
      if (patient.notes) {
        if (Array.isArray(patient.notes)) {
          const cleanedNotes = patient.notes.map((n) => ({
            note: n.note || "",
            type: n.type || "",
            duration: n.duration || "",
            note_id: n.note_id || "",
          }));
          setNotesList(cleanedNotes);
        } else if (typeof patient.notes === "string") {
          setNotesList([
            { note: patient.notes, type: "", duration: "", note_id: null },
          ]);
        } else {
          setNotesList([]);
        }
      } else {
        setNotesList([]);
      }
    }
  }, [patient, form]);

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
      note_id: null,
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
    const timeout = setTimeout(fetchICD10Description, 300);
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

  const today = new Date();

  // Get active (non-expired) insurance types
  const activeTypes = new Set(
    insuranceList
      .filter((ins) => new Date(ins.expirationDate) > today)
      .map((ins) => ins.type)
  );

  // Check if selected type is already active (to disable Add button)
  const isDuplicateInsurance = activeTypes.has(newInsurance.type);

  const insouranceCount = (patient?.insurance?.length || 0) > 2;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Edit Patient
          </DialogTitle>
          <DialogDescription>Update patient information.</DialogDescription>
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
                  <FormField
                    control={form.control}
                    name="patientService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type *</FormLabel>
                        <Popover
                          open={serviceOpen}
                          onOpenChange={setServiceOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={serviceOpen}
                                className="w-full justify-between bg-transparent"
                              >
                                {field.value && field.value.length > 0
                                  ? field.value
                                      .map(
                                        (val) =>
                                          serviceTypeReverseMap[
                                            val as keyof typeof serviceTypeReverseMap
                                          ]
                                      )
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
                              placeholder="Enter apartment, suite, etc. (optional)"
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
                          <FormLabel>Country *</FormLabel>
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
                            <Input placeholder="Enter zip code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Other Information</h3>
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
                    <FormField
                      control={form.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ethnicity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ethnicity</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ethnicity" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                <h3 className="text-lg font-medium">Allergies</h3>
                <div className="flex items-end gap-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                    <Input
                      placeholder="Allergen (e.g., Penicillin)"
                      value={newAllergy.allergen}
                      onChange={(e) =>
                        setNewAllergy({
                          ...newAllergy,
                          allergen: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Category (e.g., Drug)"
                      value={newAllergy.category}
                      onChange={(e) =>
                        setNewAllergy({
                          ...newAllergy,
                          category: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Reaction (e.g., Rash)"
                      value={newAllergy.reaction}
                      onChange={(e) =>
                        setNewAllergy({
                          ...newAllergy,
                          reaction: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button type="button" onClick={addAllergy}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {allergyList.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex justify-between items-center pr-1"
                    >
                      {allergy.allergen} ({allergy.category}):{" "}
                      {allergy.reaction}
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeAllergy(index)}
                      />
                    </Badge>
                  ))}
                  {allergyList.length === 0 && (
                    <p className="text-sm text-gray-500">No allergies added.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="insurance" className="space-y-4">
                <h3 className="text-lg font-medium">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={newInsurance.type}
                      onValueChange={(value: "primary" | "secondary") =>
                        setNewInsurance({ ...newInsurance, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FormLabel>Company</FormLabel>
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
                    <FormLabel>Plan</FormLabel>
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
                    <FormLabel>Policy Number</FormLabel>
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
                    <FormLabel>Group Number</FormLabel>
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
                    <FormLabel>Start Date</FormLabel>
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
                    <FormLabel>Expiration Date</FormLabel>
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

                <Button
                  type="button"
                  onClick={addInsurance}
                  disabled={isDuplicateInsurance || insouranceCount}
                  className={`mt-2 ${
                    isDuplicateInsurance ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Insurance
                </Button>

                <div className="space-y-2 mt-4">
                  {insuranceList.map((insurance, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex flex-wrap justify-between items-center pr-1"
                    >
                      <span className="font-semibold capitalize">
                        {insurance.type}:
                      </span>{" "}
                      {insurance.company} - {insurance.plan} (Policy:{" "}
                      {insurance.policyNumber})
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeInsurance(index)}
                      />
                    </Badge>
                  ))}
                  {insuranceList.length === 0 && (
                    <p className="text-sm text-gray-500">No insurance added.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="medications" className="space-y-4">
                <h3 className="text-lg font-medium">Current Medications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FormLabel>Medication Name</FormLabel>
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
                    <FormLabel>Dosage</FormLabel>
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
                    <FormLabel>Frequency</FormLabel>
                    <Input
                      placeholder="Frequency (e.g., Daily)"
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
                    <FormLabel>Start Date</FormLabel>
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
                    <FormLabel>End Date (Optional)</FormLabel>
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={newMedication.status}
                      onValueChange={(value) =>
                        setNewMedication({ ...newMedication, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
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

                <Button type="button" onClick={addMedication} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" /> Add Medication
                </Button>

                <div className="space-y-2 mt-4">
                  {medicationsList.map((med, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex flex-wrap justify-between items-center pr-1"
                    >
                      <span className="font-semibold">{med.name}:</span>{" "}
                      {med.dosage}, {med.frequency} (refills: {med.refills})
                      (Status: {med.status})
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeMedication(index)}
                      />
                    </Badge>
                  ))}
                  {medicationsList.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No medications added.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="diagnosis" className="space-y-4">
                <h3 className="text-lg font-medium">Diagnosis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Diagnosis Date</FormLabel>
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
                  <div className="relative">
                    <FormLabel>ICD-10 Code</FormLabel>
                    <Popover open={icdOpen} onOpenChange={setIcdOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={icdOpen}
                          className="w-full justify-between"
                        >
                          {newDiagnosis.icd10 || "Select ICD-10 Code"}
                          <FileText className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                  value={option.value}
                                  onSelect={() => {
                                    setNewDiagnosis((prev) => ({
                                      ...prev,
                                      icd10: option.value,
                                    }));
                                    setIcdOpen(false);
                                    setSearchTerm(option.value); // Keep the selected value in search box
                                  }}
                                >
                                  {option.label}
                                </CommandItem>
                              ))
                            ) : (
                              <CommandItem>No results found.</CommandItem>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="md:col-span-2">
                    <FormLabel>Diagnosis Description</FormLabel>
                    <Textarea
                      placeholder="Diagnosis description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setNewDiagnosis((prev) => ({
                          ...prev,
                          diagnosis: e.target.value,
                        }));
                      }}
                      rows={3}
                    />
                  </div>
                  <div>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={newDiagnosis.status}
                      onValueChange={(value) =>
                        setNewDiagnosis({ ...newDiagnosis, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Chronic">Chronic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={newDiagnosis.type}
                      onValueChange={(value) =>
                        setNewDiagnosis({ ...newDiagnosis, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Primary">Primary</SelectItem>
                        <SelectItem value="Secondary">Secondary</SelectItem>
                        <SelectItem value="Complication">
                          Complication
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="button" onClick={addDiagnosis} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" /> Add Diagnosis
                </Button>
                <div className="space-y-2 mt-4">
                  {diagnosisList.map((diag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex flex-wrap justify-between items-center pr-1"
                    >
                      <span className="font-semibold">{diag.date}:</span>{" "}
                      {diag.icd10} - {diag.diagnosis} (Status: {diag.status},{" "}
                      {diag.type})
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => removeDiagnosis(index)}
                      />
                    </Badge>
                  ))}
                  {diagnosisList.length === 0 && (
                    <p className="text-sm text-gray-500">No diagnosis added.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="vitals" className="space-y-4">
                <h3 className="text-lg font-medium">Vital Signs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodPressure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Pressure (mmHg)</FormLabel>
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
                              field.onChange(parseFloat(e.target.value))
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
                              field.onChange(parseFloat(e.target.value))
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
                            readOnly
                            {...field}
                          />
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
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientDialog;
