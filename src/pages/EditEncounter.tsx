"use client";
import type React from "react";
import { useEffect, useState, useRef } from "react";
import {
  updateEncounterApi,
  getTemplateApi,
} from "@/services/operations/encounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getAllPatientsAPI } from "@/services/operations/patient";

// Interface for Template data from API
interface Template {
  template_id: number;
  template_name: string;
  encounter_type: string;
  default_reason: string;
  default_notes: string;
  default_diagnosis_codes: string;
  default_procedure_codes: string;
}

// Interface for Patient data from API
interface Patient {
  patientId: string;
  firstname: string;
  middlename?: string;
  lastname: string;
}

// Interface for the Encounter Form data (for editing)
interface EncounterFormData {
  patientId: string;
  templateId: number | null;
  encounterType: string;
  reasonForVisit: string;
  notes: string;
  diagnosisCodes: string;
  procedureCodes: string;
  followUpPlan: string;
  status:
    | "pending"
    | "completed"
    | "cancelled"
    | "Scheduled"
    | "Draft"
    | "In Progress"
    | "Pending Review"
    | "Signed"
    | "Billed"
    | "Rejected"
    | "Locked";
}

// Updated Encounter interface to match the provided API response
interface Encounter {
  _id: string;
  patient_id: any;
  provider_id: string;
  template_id: string;
  encounter_id: any;
  encounter_type: string;
  reason_for_visit: string;
  notes: string;
  procedure_codes: string;
  diagnosis_codes: string;
  follow_up_plan: string;
  status:
    | "pending"
    | "completed"
    | "cancelled"
    | "Scheduled"
    | "Draft"
    | "In Progress"
    | "Pending Review"
    | "Signed"
    | "Billed"
    | "Rejected"
    | "Locked"
    | "";
  created: string;
  updated: string;
}

interface EditEncounterProps {
  encounter: Encounter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditEncounter: React.FC<EditEncounterProps> = ({
  encounter,
  open,
  onOpenChange,
  onSuccess,
}) => {
  console.log(encounter, "encounter");
  const { token } = useSelector((state: RootState) => state.auth);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize form data with proper mapping
  const initializeFormData = (encounterData: Encounter): EncounterFormData => {
    return {
      patientId: encounterData.patient_id.toString(), // Convert to string for form
      templateId: typeof encounterData.template_id === 'string' ? parseInt(encounterData.template_id) : encounterData.template_id || null,
      encounterType: encounterData.encounter_type || "",
      reasonForVisit: encounterData.reason_for_visit || "",
      notes: encounterData.notes || "",
      diagnosisCodes: encounterData.diagnosis_codes || "",
      procedureCodes: encounterData.procedure_codes || "",
      followUpPlan: encounterData.follow_up_plan || "",
      status: (encounterData.status as EncounterFormData["status"]) || "Draft",
    };
  };

  const [formData, setFormData] = useState<EncounterFormData>(
    initializeFormData(encounter)
  );

  // Function to get full patient name
  const getPatientFullName = (patient: Patient) => {
    return `${patient.firstname} ${
      patient.middlename ? patient.middlename + " " : ""
    }${patient.lastname}`;
  };

  // Fetch specific patient by ID (you might need to create this API call)
  const fetchPatientById = async (patientId: string) => {
    try {
      // If you have a specific API to fetch patient by ID, use it here
      // For now, we'll search for the patient in the general search
      const res = await getAllPatientsAPI(1, token, patientId);
      if (res?.data && res.data.length > 0) {
        const patient = res.data.find(
          (p: Patient) => p.patientId === patientId
        );
        if (patient) {
          setCurrentPatient(patient);
          return patient;
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch patient by ID:", error);
      return null;
    }
  };

  // Fetch Patients
  const fetchPatients = async (searchQuery = "") => {
    setIsLoadingData(true);
    try {
      const res = await getAllPatientsAPI(1, token, searchQuery);
      if (res?.data) {
        let fetchedPatients = res.data;

        const currentPatientId = encounter.patient_id.toString();
        const isCurrentPatientInList = fetchedPatients.some(
          (p: Patient) => p.patientId === currentPatientId
        );

        if (
          !isCurrentPatientInList &&
          currentPatientId !== "0" &&
          currentPatientId
        ) {
          // Try to fetch the specific patient
          const specificPatient = await fetchPatientById(currentPatientId);
          if (
            specificPatient &&
            !fetchedPatients.some(
              (p: Patient) => p.patientId === specificPatient.patientId
            )
          ) {
            fetchedPatients = [specificPatient, ...fetchedPatients];
          }
        }

        setPatients(fetchedPatients);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast.error("Failed to fetch patients");
      setPatients([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch Templates
  const fetchTemplates = async () => {
    setIsLoadingData(true);
    try {
      const res = await getTemplateApi(token);
      setTemplates(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to fetch templates");
      setTemplates([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Effect to fetch initial data when dialog opens
  useEffect(() => {
    if (open) {
      // Reset form data when opening
      const newFormData = initializeFormData(encounter);
      setFormData(newFormData);

      // Fetch initial data
      fetchPatients();
      fetchTemplates();

      // If we have a valid patient ID, try to fetch that specific patient
      if (encounter.patient_id && encounter.patient_id !== 0) {
        fetchPatientById(encounter.patient_id.toString());
      }

      setPatientSearchQuery("");
      setDebouncedSearchQuery("");
    }
  }, [token, open, encounter]);

  // Debounce effect for patient search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(patientSearchQuery);
    }, 500);
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [patientSearchQuery]);

  useEffect(() => {
    if (!open) return;
    fetchPatients(debouncedSearchQuery);
  }, [debouncedSearchQuery, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    name: keyof EncounterFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates.find(
      (t) => t.template_id === Number.parseInt(templateId)
    );
    if (selectedTemplate) {
      setFormData((prev) => ({
        ...prev,
        templateId: selectedTemplate.template_id,
        encounterType: selectedTemplate.encounter_type,
        reasonForVisit: selectedTemplate.default_reason,
        notes: selectedTemplate.default_notes,
        diagnosisCodes: selectedTemplate.default_diagnosis_codes,
        procedureCodes: selectedTemplate.default_procedure_codes,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        templateId: null,
        encounterType: "",
        reasonForVisit: "",
        notes: "",
        diagnosisCodes: "",
        procedureCodes: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSend = {
      patientId: Number(formData.patientId),
      templateId: formData.templateId,
      encounterType: formData.encounterType,
      reasonForVisit: formData.reasonForVisit,
      notes: formData.notes,
      diagnosisCodes: formData.diagnosisCodes,
      procedureCodes: formData.procedureCodes,
      followUpPlan: formData.followUpPlan,
      status: formData.status,
    };

    const res = await updateEncounterApi(
      encounter.encounter_id,
      dataToSend,
      token
    );
    onOpenChange(false);
    onSuccess?.();
    setIsSubmitting(false);
  };

  // Find the selected patient to display their full name in the trigger
  const selectedPatient =
    patients.find((p) => p.patientId === formData.patientId) || currentPatient;

  const selectedTemplate = templates.find(
    (t) => t.template_id === formData.templateId
  );

  // Function to get display text for patient dropdown
  const getPatientDisplayText = () => {
    if (selectedPatient) {
      return getPatientFullName(selectedPatient);
    }
    if (formData.patientId === "0") {
      return "No patient assigned";
    }
    return "Select a patient";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Encounter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Patient Dropdown with Search */}
          <div>
            <label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Patient:
            </label>

            <Select
              name="patientId"
              value={formData.patientId?.toString() || ""}
              onValueChange={(value) => handleSelectChange("patientId", value)}
              disabled={isLoadingData || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>

              <SelectContent>
                <Input
                  placeholder="Search patient by first name..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  className="mb-2"
                  disabled={isLoadingData || isSubmitting}
                />

                {isLoadingData &&
                patients.length === 0 &&
                patientSearchQuery.length === 0 ? (
                  <div className="text-center py-2 text-sm text-gray-500">
                    Loading patients...
                  </div>
                ) : patients.length > 0 ? (
                  <SelectGroup>
                    <SelectLabel>Patients</SelectLabel>
                    {patients.map((patient) => (
                      <SelectItem
                        key={patient.patientId.toString()}
                        value={patient.patientId.toString()}
                      >
                        {getPatientFullName(patient)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : (
                  <div className="py-2 px-3 text-sm text-gray-500 text-center">
                    No patients found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Template Dropdown */}
          <div>
            <label
              htmlFor="templateId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Template:
            </label>
            <Select
              name="templateId"
              value={formData.templateId?.toString() || ""}
              onValueChange={handleTemplateSelect}
              disabled={isLoadingData || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template (Optional)">
                  {selectedTemplate?.template_name ||
                    "Select a template (Optional)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {isLoadingData && templates.length === 0 ? (
                  <div className="text-center py-2 text-sm text-gray-500">
                    Loading templates...
                  </div>
                ) : templates.length > 0 ? (
                  templates.map((template) => (
                    <SelectItem
                      key={template.template_id}
                      value={template.template_id.toString()}
                    >
                      {template.template_name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-2 px-3 text-sm text-gray-500 text-center">
                    No templates found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Encounter Type */}
          <div>
            <label
              htmlFor="encounterType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Encounter Type:
            </label>
            <Input
              name="encounterType"
              value={formData.encounterType}
              onChange={handleChange}
              placeholder="Encounter Type"
              disabled={isSubmitting}
            />
          </div>

          {/* Reason For Visit */}
          <div>
            <label
              htmlFor="reasonForVisit"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason For Visit:
            </label>
            <Textarea
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleChange}
              placeholder="Reason For Visit"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes:
            </label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes"
              disabled={isSubmitting}
              rows={5}
            />
          </div>

          {/* Diagnosis Codes */}
          <div>
            <label
              htmlFor="diagnosisCodes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Diagnosis Codes:
            </label>
            <Input
              name="diagnosisCodes"
              value={formData.diagnosisCodes}
              onChange={handleChange}
              placeholder="Diagnosis Codes (comma separated)"
              disabled={isSubmitting}
            />
          </div>

          {/* Procedure Codes */}
          <div>
            <label
              htmlFor="procedureCodes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Procedure Codes:
            </label>
            <Input
              name="procedureCodes"
              value={formData.procedureCodes}
              onChange={handleChange}
              placeholder="Procedure Codes (comma separated)"
              disabled={isSubmitting}
            />
          </div>

          {/* Follow Up Plan */}
          <div>
            <label
              htmlFor="followUpPlan"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Follow Up Plan:
            </label>
            <Textarea
              name="followUpPlan"
              value={formData.followUpPlan}
              onChange={handleChange}
              placeholder="Follow Up Plan"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status:
            </label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) =>
                handleSelectChange(
                  "status",
                  value as EncounterFormData["status"]
                )
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
                <SelectItem value="Signed">Signed</SelectItem>
                <SelectItem value="Billed">Billed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white"
            disabled={isSubmitting || isLoadingData}
          >
            {isSubmitting ? "Updating..." : "Update Encounter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEncounter;