"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Target, Plus, X, Send } from "lucide-react";
import { createCarePlanApi } from "@/services/operations/careplan";
import jsPDF from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface CareGoal {
  id: string;
  goal: string;
  target: string;
  timeframe: string;
  priority: "high" | "medium" | "low";
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Diagnosis {
  id: number;
  date: string;
  icd10: string;
  diagnosis: string;
  status: string;
  type: string;
}

interface CarePlanData {
  // Patient Information
  patientName: string;
  patientId: string;
  dateOfBirth: string;
  primaryCondition: string;
  riskLevel: "high" | "medium" | "low";
  // Assessment Data
  currentSymptoms: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    weight: string;
    temperature: string;
  };
  // Care Goals
  careGoals: CareGoal[];
  // Medications
  medications: Medication[];
  // Diagnosis
  diagnosis: Diagnosis[];
  // Care Plan Details
  treatmentPlan: string;
  followUpInstructions: string;
  emergencyContacts: string;
  nextAppointment: string;
  // Provider Information
  providerName: string;
  providerTitle: string;
  facilityName: string;
  contactNumber: string;
}

interface CarePlanFormProps {
  patient?: any;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (data: CarePlanData) => void;
}

export default function CarePlanForm({
  patient,
  isOpen = true,
  onClose,
  onSave,
}: CarePlanFormProps = {}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("patient-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useSelector((state: RootState) => state.auth);

  const [carePlanData, setCarePlanData] = useState<CarePlanData>({
    patientName: "",
    patientId: "",
    dateOfBirth: "",
    primaryCondition: "",
    riskLevel: "medium",
    currentSymptoms: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      weight: "",
      temperature: "",
    },
    careGoals: [],
    medications: [],
    diagnosis: [],
    treatmentPlan: "",
    followUpInstructions: "",
    emergencyContacts: "",
    nextAppointment: "",
    providerName: "",
    providerTitle: "",
    facilityName: "",
    contactNumber: "",
  });

  // Initialize form data when patient data is available
  useEffect(() => {
    if (patient) {
      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        } catch (error) {
          console.error("Error formatting date:", error);
          return "";
        }
      };

      const mapRiskLevel = (status: string): "high" | "medium" | "low" => {
        if (!status) return "medium";
        switch (status.toLowerCase()) {
          case "critical":
            return "high";
          case "abnormal":
            return "medium";
          case "normal":
            return "low";
          default:
            return "medium";
        }
      };

      setCarePlanData({
        patientName: `${patient.firstName || ""} ${patient.middleName || ""} ${
          patient.lastName || ""
        }`.trim(),
        patientId: patient.patientId || patient.id || "",
        dateOfBirth: formatDate(patient.birthDate),
        primaryCondition:
          patient.diagnosis?.[0]?.diagnosis || patient.condition || "",
        riskLevel: mapRiskLevel(patient.status),
        currentSymptoms: patient.currentSymptoms || "",
        vitalSigns: {
          bloodPressure: patient.bloodPressure?.toString() || "",
          heartRate: patient.heartRate?.toString() || "",
          weight: patient.weight?.toString() || "",
          temperature: patient.temperature?.toString() || "",
        },
        careGoals: [],
        medications:
          patient.currentMedications?.map((med: any, index: number) => ({
            id: (index + 1).toString(),
            name: med.name || med.medication || "",
            dosage: med.dosage || "",
            frequency: med.frequency || "",
            startDate: med.startDate
              ? new Date(med.startDate).toISOString().split("T")[0]
              : "",
            endDate: med.endDate
              ? new Date(med.endDate).toISOString().split("T")[0]
              : "",
            status: med.status || "Active",
          })) || [],
        diagnosis: patient.diagnosis || [],
        treatmentPlan: patient.treatmentPlan || "",
        followUpInstructions: patient.followUpInstructions || "",
        emergencyContacts: patient.emergencyContact || "",
        nextAppointment: patient.nextAppointment || "",
        providerName: patient.providerName || "",
        providerTitle: patient.providerTitle || "",
        facilityName: patient.facilityName || "Healthcare Facility",
        contactNumber: patient.phone || "",
      });
    }
  }, [patient]);

  const addCareGoal = () => {
    const newGoal: CareGoal = {
      id: Date.now().toString(),
      goal: "",
      target: "",
      timeframe: "",
      priority: "medium",
    };
    setCarePlanData((prev) => ({
      ...prev,
      careGoals: [...prev.careGoals, newGoal],
    }));
  };

  const updateCareGoal = (id: string, field: keyof CareGoal, value: string) => {
    setCarePlanData((prev) => ({
      ...prev,
      careGoals: prev.careGoals.map((goal) =>
        goal.id === id ? { ...goal, [field]: value } : goal
      ),
    }));
  };

  const removeCareGoal = (id: string) => {
    setCarePlanData((prev) => ({
      ...prev,
      careGoals: prev.careGoals.filter((goal) => goal.id !== id),
    }));
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: "",
      dosage: "",
      frequency: "",
      startDate: "",
      endDate: "",
      status: "Active",
    };
    setCarePlanData((prev) => ({
      ...prev,
      medications: [...prev.medications, newMedication],
    }));
  };

  const updateMedication = (
    id: string,
    field: keyof Medication,
    value: string
  ) => {
    setCarePlanData((prev) => ({
      ...prev,
      medications: prev.medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      ),
    }));
  };

  const removeMedication = (id: string) => {
    setCarePlanData((prev) => ({
      ...prev,
      medications: prev.medications.filter((med) => med.id !== id),
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("COMPREHENSIVE CARE PLAN REPORT", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      carePlanData.facilityName || "Healthcare Facility",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 5;
    doc.text(
      `Contact: ${carePlanData.contactNumber}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 15;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Patient Information Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", margin, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${carePlanData.patientName}`, margin, yPosition);
    doc.text(`Patient ID: ${carePlanData.patientId}`, pageWidth / 2, yPosition);
    yPosition += 7;
    doc.text(`Date of Birth: ${carePlanData.dateOfBirth}`, margin, yPosition);
    doc.text(
      `Risk Level: ${carePlanData.riskLevel.toUpperCase()}`,
      pageWidth / 2,
      yPosition
    );
    yPosition += 7;
    doc.text(`Email: ${patient?.email || "N/A"}`, margin, yPosition);
    doc.text(`Phone: ${patient?.phone || "N/A"}`, pageWidth / 2, yPosition);
    yPosition += 7;
    doc.text(`Gender: ${patient?.gender || "N/A"}`, margin, yPosition);
    doc.text(
      `Height: ${patient?.height ? patient.height + " inches" : "N/A"}`,
      pageWidth / 2,
      yPosition
    );
    yPosition += 7;
    doc.text(`Weight: ${carePlanData.vitalSigns.weight}`, margin, yPosition);
    doc.text(`BMI: ${patient?.bmi || "N/A"}`, pageWidth / 2, yPosition);
    yPosition += 7;
    if (patient?.addressLine1) {
      doc.text(
        `Address: ${patient.addressLine1} ${patient.addressLine2 || ""}`,
        margin,
        yPosition
      );
      yPosition += 7;
      doc.text(
        `City: ${patient.city}, ${patient.state}, ${patient.country} ${patient.zipCode}`,
        margin,
        yPosition
      );
      yPosition += 7;
    }
    doc.text(
      `Last Visit: ${
        patient?.lastVisit
          ? new Date(patient.lastVisit).toLocaleDateString()
          : "N/A"
      }`,
      margin,
      yPosition
    );
    doc.text(
      `Emergency Contact: ${carePlanData.emergencyContacts}`,
      pageWidth / 2,
      yPosition
    );
    yPosition += 15;

    // Diagnosis Section
    if (carePlanData.diagnosis.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DIAGNOSIS", margin, yPosition);
      yPosition += 10;
      carePlanData.diagnosis.forEach((diag, index) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${diag.diagnosis}`, margin, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`   ICD-10: ${diag.icd10}`, margin, yPosition);
        doc.text(`   Status: ${diag.status}`, pageWidth / 2, yPosition);
        yPosition += 5;
        doc.text(`   Type: ${diag.type}`, margin, yPosition);
        if (diag.date) {
          doc.text(
            `   Date: ${new Date(diag.date).toLocaleDateString()}`,
            pageWidth / 2,
            yPosition
          );
        }
        yPosition += 10;
      });
    }

    // Vital Signs Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("VITAL SIGNS", margin, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Blood Pressure: ${carePlanData.vitalSigns.bloodPressure}`,
      margin,
      yPosition
    );
    doc.text(
      `Heart Rate: ${carePlanData.vitalSigns.heartRate}`,
      pageWidth / 2,
      yPosition
    );
    yPosition += 7;
    doc.text(`Weight: ${carePlanData.vitalSigns.weight}`, margin, yPosition);
    doc.text(
      `Temperature: ${carePlanData.vitalSigns.temperature}`,
      pageWidth / 2,
      yPosition
    );
    yPosition += 15;

    // Current Medications Section
    if (carePlanData.medications.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CURRENT MEDICATIONS", margin, yPosition);
      yPosition += 10;
      carePlanData.medications.forEach((med, index) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${med.name}`, margin, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`   Dosage: ${med.dosage}`, margin, yPosition);
        doc.text(`   Frequency: ${med.frequency}`, pageWidth / 2, yPosition);
        yPosition += 5;
        doc.text(`   Status: ${med.status}`, margin, yPosition);
        yPosition += 5;
        doc.text(
          `   Start Date: ${
            med.startDate ? new Date(med.startDate).toLocaleDateString() : "N/A"
          }`,
          margin,
          yPosition
        );
        doc.text(
          `   End Date: ${
            med.endDate ? new Date(med.endDate).toLocaleDateString() : "N/A"
          }`,
          pageWidth / 2,
          yPosition
        );
        yPosition += 10;
      });
    }

    // Care Goals Section
    if (carePlanData.careGoals.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CARE GOALS", margin, yPosition);
      yPosition += 10;
      carePlanData.careGoals.forEach((goal, index) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${goal.goal}`, margin, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`   Target: ${goal.target}`, margin, yPosition);
        yPosition += 5;
        doc.text(`   Timeframe: ${goal.timeframe}`, margin, yPosition);
        doc.text(
          `   Priority: ${goal.priority.toUpperCase()}`,
          pageWidth / 2,
          yPosition
        );
        yPosition += 10;
      });
    }

    // Treatment Plan Section
    if (
      carePlanData.treatmentPlan ||
      carePlanData.followUpInstructions ||
      carePlanData.nextAppointment
    ) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TREATMENT PLAN", margin, yPosition);
      yPosition += 10;

      if (carePlanData.treatmentPlan) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("• Treatment Plan:", margin, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        const treatmentLines = doc.splitTextToSize(
          carePlanData.treatmentPlan,
          pageWidth - 2 * margin
        );
        doc.text(treatmentLines, margin + 5, yPosition);
        yPosition += treatmentLines.length * 5 + 5;
      }

      if (carePlanData.followUpInstructions) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("• Follow-up Instructions:", margin, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        const followUpLines = doc.splitTextToSize(
          carePlanData.followUpInstructions,
          pageWidth - 2 * margin
        );
        doc.text(followUpLines, margin + 5, yPosition);
        yPosition += followUpLines.length * 5 + 5;
      }

      if (carePlanData.nextAppointment) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("• Next Appointment:", margin, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.text(
          new Date(carePlanData.nextAppointment).toLocaleString(),
          margin + 5,
          yPosition
        );
        yPosition += 10;
      }
    }

    // Tasks Section (if available)
    if (patient?.tasks && patient.tasks.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ASSIGNED TASKS", margin, yPosition);
      yPosition += 10;
      patient.tasks.forEach((task: any, index: number) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${task.task_title}`, margin, yPosition);
        yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`   Description: ${task.task_description}`, margin, yPosition);
        yPosition += 5;
        doc.text(`   Priority: ${task.priority}`, margin, yPosition);
        doc.text(`   Status: ${task.status}`, pageWidth / 2, yPosition);
        yPosition += 5;
        doc.text(
          `   Due Date: ${
            task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A"
          }`,
          margin,
          yPosition
        );
        yPosition += 10;
      });
    }

    // Footer
    yPosition += 10;
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      margin,
      yPosition
    );
    yPosition += 5;
    doc.text(
      `Report prepared by: ${carePlanData.facilityName}`,
      margin,
      yPosition
    );

    // Save the PDF
    doc.save(
      `comprehensive-care-plan-${carePlanData.patientName.replace(
        /\s+/g,
        "-"
      )}-${new Date().toISOString().split("T")[0]}.pdf`
    );

    toast({
      title: "Comprehensive PDF Generated Successfully",
      description:
        "Complete care plan report with all patient details has been downloaded.",
    });
  };

  const submitCarePlan = async () => {
    if (!carePlanData.patientName || !carePlanData.patientId) {
      toast({
        title: "Missing Information",
        description: "Please fill in patient name and patient ID.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for backend submission
      const submissionData = {
        patientInfo: {
          patientId: carePlanData.patientId,
          patientName: carePlanData.patientName,
          email: patient?.email,
          phone: patient?.phone,
          gender: patient?.gender,
          height: patient?.height,
          weight: patient?.weight,
          bmi: patient?.bmi,
          address: {
            line1: patient?.addressLine1,
            line2: patient?.addressLine2,
            city: patient?.city,
            state: patient?.state,
            country: patient?.country,
            zipCode: patient?.zipCode,
          },
          lastVisit: patient?.lastVisit,
          emergencyContact: patient?.emergencyContact,
        },
        diagnosis: carePlanData.diagnosis,
        medications: carePlanData.medications,
        careGoals: carePlanData.careGoals,
        vitalSigns: carePlanData.vitalSigns,
        treatmentPlan: carePlanData.treatmentPlan,
        followUpInstructions: carePlanData.followUpInstructions,
        nextAppointment: carePlanData.nextAppointment,
        emergencyContacts: carePlanData.emergencyContacts,
        riskLevel: carePlanData.riskLevel,
      };

      console.log(submissionData);
      await createCarePlanApi(submissionData, token);
      onSave(carePlanData);

      // Simulate API call - replace with your actual backend endpoint
      // const response = await fetch("/api/care-plans", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(submissionData),
      // });

      // if (response.ok) {
      //   toast({
      //     title: "Care Plan Submitted Successfully",
      //     description: "The care plan has been saved to the system.",
      //   });

      //   if (onSave) {
      //     onSave(carePlanData);
      //   }
      // } else {
      //   throw new Error("Failed to submit care plan");
      // }
    } catch (error) {
      console.error("Error submitting care plan:", error);
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting the care plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {patient ? "Update Care Plan" : "Create Care Plan"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Care Plan Management System
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create comprehensive care plans and generate detailed PDF
                reports
              </p>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="patient-info">Patient Info</TabsTrigger>
                  <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                  <TabsTrigger value="assessment">Vital Signs</TabsTrigger>
                  <TabsTrigger value="care-goals">Care Goals</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="patient-info" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name *</Label>
                      <Input
                        id="patientName"
                        value={carePlanData.patientName}
                        onChange={(e) =>
                          setCarePlanData((prev) => ({
                            ...prev,
                            patientName: e.target.value,
                          }))
                        }
                        placeholder="Enter patient full name"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Patient ID *</Label>
                      <Input
                        id="patientId"
                        value={carePlanData.patientId}
                        onChange={(e) =>
                          setCarePlanData((prev) => ({
                            ...prev,
                            patientId: e.target.value,
                          }))
                        }
                        placeholder="Enter patient ID"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={carePlanData.dateOfBirth}
                        onChange={(e) =>
                          setCarePlanData((prev) => ({
                            ...prev,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="riskLevel">Risk Level</Label>
                      <Select
                        value={carePlanData.riskLevel}
                        onValueChange={(value: "high" | "medium" | "low") =>
                          setCarePlanData((prev) => ({
                            ...prev,
                            riskLevel: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="low">Low Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold">
                      Additional Patient Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={patient?.email || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={patient?.phone || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Input value={patient?.gender || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <Input
                          value={
                            patient?.height ? `${patient.height} inches` : ""
                          }
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>BMI</Label>
                        <Input value={patient?.bmi || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Visit</Label>
                        <Input
                          value={
                            patient?.lastVisit
                              ? new Date(patient.lastVisit).toLocaleDateString()
                              : ""
                          }
                          disabled
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={`${patient?.addressLine1 || ""} ${
                            patient?.addressLine2 || ""
                          }`}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City, State, Country</Label>
                        <Input
                          value={`${patient?.city || ""}, ${
                            patient?.state || ""
                          }, ${patient?.country || ""} ${
                            patient?.zipCode || ""
                          }`}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="diagnosis" className="space-y-4">
                  <h3 className="text-lg font-semibold">Patient Diagnosis</h3>
                  <div className="space-y-4">
                    {carePlanData.diagnosis.map((diag, index) => (
                      <Card key={diag.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Diagnosis</Label>
                            <Input value={diag.diagnosis} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>ICD-10 Code</Label>
                            <Input value={diag.icd10} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Badge
                              variant={
                                diag.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {diag.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Badge variant="outline">{diag.type}</Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {carePlanData.diagnosis.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground">
                        No diagnosis information available.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="assessment" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Vital Signs</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bloodPressure">Blood Pressure</Label>
                        <Input
                          id="bloodPressure"
                          value={carePlanData.vitalSigns.bloodPressure}
                          onChange={(e) =>
                            setCarePlanData((prev) => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                bloodPressure: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g., 120/80 mmHg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heartRate">Heart Rate</Label>
                        <Input
                          id="heartRate"
                          value={carePlanData.vitalSigns.heartRate}
                          onChange={(e) =>
                            setCarePlanData((prev) => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                heartRate: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g., 72 bpm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          value={carePlanData.vitalSigns.weight}
                          onChange={(e) =>
                            setCarePlanData((prev) => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                weight: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g., 70 kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature</Label>
                        <Input
                          id="temperature"
                          value={carePlanData.vitalSigns.temperature}
                          onChange={(e) =>
                            setCarePlanData((prev) => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                temperature: e.target.value,
                              },
                            }))
                          }
                          placeholder="e.g., 98.6°F"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="care-goals" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Care Goals
                    </h3>
                    <Button onClick={addCareGoal} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {carePlanData.careGoals.map((goal) => (
                      <Card key={goal.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant={getPriorityColor(goal.priority)}>
                            {goal.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCareGoal(goal.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label>Care Goal</Label>
                            <Input
                              value={goal.goal}
                              onChange={(e) =>
                                updateCareGoal(goal.id, "goal", e.target.value)
                              }
                              placeholder="Enter care goal"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Target/Outcome</Label>
                            <Input
                              value={goal.target}
                              onChange={(e) =>
                                updateCareGoal(
                                  goal.id,
                                  "target",
                                  e.target.value
                                )
                              }
                              placeholder="Enter target outcome"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Timeframe</Label>
                            <Input
                              value={goal.timeframe}
                              onChange={(e) =>
                                updateCareGoal(
                                  goal.id,
                                  "timeframe",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 2 weeks, 1 month"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Priority Level</Label>
                            <Select
                              value={goal.priority}
                              onValueChange={(
                                value: "high" | "medium" | "low"
                              ) => updateCareGoal(goal.id, "priority", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">
                                  Low Priority
                                </SelectItem>
                                <SelectItem value="medium">
                                  Medium Priority
                                </SelectItem>
                                <SelectItem value="high">
                                  High Priority
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {carePlanData.careGoals.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground">
                        No care goals added yet. Click "Add Goal" to create your
                        first care goal.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="medications" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Medications</h3>
                    {/* <Button onClick={addMedication} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button> */}
                  </div>
                  <div className="space-y-4">
                    {carePlanData.medications.map((medication) => (
                      <Card key={medication.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">Medication Details</h4>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedication(medication.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button> */}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Medication Name</Label>
                            <Input
                              value={medication.name}
                              onChange={(e) =>
                                updateMedication(
                                  medication.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="Enter medication name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) =>
                                updateMedication(
                                  medication.id,
                                  "dosage",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 10mg, 500mg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input
                              value={medication.frequency}
                              onChange={(e) =>
                                updateMedication(
                                  medication.id,
                                  "frequency",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Twice daily, Once daily"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={medication.status}
                              onValueChange={(value) =>
                                updateMedication(medication.id, "status", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">
                                  Inactive
                                </SelectItem>
                                <SelectItem value="Discontinued">
                                  Discontinued
                                </SelectItem>
                                <SelectItem value="On Hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={medication.startDate}
                              onChange={(e) =>
                                updateMedication(
                                  medication.id,
                                  "startDate",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={medication.endDate}
                              onChange={(e) =>
                                updateMedication(
                                  medication.id,
                                  "endDate",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                    {carePlanData.medications.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground">
                        No medications added yet. Click "Add Medication" to add
                        medications to the care plan.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="treatment" className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Treatment Plan & Follow-up
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                      <Textarea
                        id="treatmentPlan"
                        value={carePlanData.treatmentPlan}
                        onChange={(e) =>
                          setCarePlanData((prev) => ({
                            ...prev,
                            treatmentPlan: e.target.value,
                          }))
                        }
                        placeholder="Describe the comprehensive treatment plan, interventions, and care strategies"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="followUpInstructions">
                        Follow-up Instructions
                      </Label>
                      <Textarea
                        id="followUpInstructions"
                        value={carePlanData.followUpInstructions}
                        onChange={(e) =>
                          setCarePlanData((prev) => ({
                            ...prev,
                            followUpInstructions: e.target.value,
                          }))
                        }
                        placeholder="Provide detailed follow-up instructions for the patient"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nextAppointment">
                          Next Appointment
                        </Label>
                        <Input
                          id="nextAppointment"
                          type="datetime-local"
                          value={carePlanData.nextAppointment}
                          onChange={(e) =>
                            setCarePlanData((prev) => ({
                              ...prev,
                              nextAppointment: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContacts">
                          Emergency Contacts
                        </Label>
                        <Input
                          id="emergencyContacts"
                          value={carePlanData.emergencyContacts}
                          onChange={(e) =>
                            setCarePlanData((prev) => ({
                              ...prev,
                              emergencyContacts: e.target.value,
                            }))
                          }
                          placeholder="Emergency contact information"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskColor(carePlanData.riskLevel)}>
                      {carePlanData.riskLevel.toUpperCase()} RISK
                    </Badge>
                    {carePlanData.patientName && (
                      <span className="text-sm text-muted-foreground">
                        Patient: {carePlanData.patientName}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={generatePDF}
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={submitCarePlan}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Submitting..." : "Submit Care Plan"}
                    </Button>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
