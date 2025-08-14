import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  FileDown,
  User,
  Phone,
  Mail,
  FileText,
  Minus,
  Plus,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getSinglePatientAPI } from "@/services/operations/patient";
import { getPdfAPI } from "@/services/operations/settings";
import PcmHistory from "@/pages/provider/pcm/PcmHistory";
import CcmHistory from "@/pages/provider/pcm/CcmHistory";
import Loader from "../Loader";
import UploadDocumentDialog from "../patient/UploadDocumentDialog";
import DocumentDisplay from "../patient/DocumentDisplay";

// Interface for PDF Header Configuration
interface PdfHeaderConfig {
  logo_enabled: boolean;
  logo_url: string;
  organization_name_enabled: boolean;
  organization_name_value: string;
  phone_enabled: boolean;
  phone_value: string;
  fax_enabled: boolean;
  fax_value: string;
  email_enabled: boolean;
  email_value: string;
  license_number_enabled: boolean;
  license_number_value: string;
  address_enabled: boolean;
  address_value: string;
  website_enabled: boolean;
  website_value: string;
}

const serviceTypeMap: Record<number, string> = {
  1: "RPM",
  2: "CCM",
  3: "PCM",
};
interface Patient {
  patientId?: string;
  firstName?: string;
  middleName?: string;
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
  patientService?: any;
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
  allergies?: Array<{
    allergen: string;
    category: string;
    reaction: string;
    id: number;
  }>;
  insurance?: Array<{
    type: "primary" | "secondary" | "tertiary";
    company: string;
    plan: string;
    policyNumber: string;
    groupNumber: string;
    effectiveDate: string;
    expirationDate: string;
    patient_insurance_id: number;
  }>;
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    startDate: string;
    endDate?: string;
    status: string;
    id: number;
  }>;
  diagnosis?: Array<{
    date: string;
    icd10: string;
    diagnosis: string;
    status: string;
    id: number;
    type: string;
  }>;
  notes?: Array<{
    note: string;
    created?: string;
    created_by?: number;
    note_id?: number;
  }>;
  carePlanTasks?: Array<{
    id: number;
    task_title: string;
    task_description: string;
    status: string;
    priority: string;
    type?: string;
    duration?: number;
    frequency?: string;
    frequency_type?: string;
    due_date?: string;
    created?: string;
  }>;
  createdBy?: number;
}

const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
    const proxyBaseUrl = `${BASE_URL}/proxy-image`;
    const proxiedImageUrl = `${proxyBaseUrl}?url=${encodeURIComponent(
      imageUrl
    )}`;

    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("Could not get 2D context from canvas.");
          }

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        } catch (error) {
          console.error("Canvas conversion failed:", error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error(
          "Image loading failed. Check URL and CORS settings:",
          error
        );
        reject(error);
      };

      const urlWithTimestamp = `${proxiedImageUrl}&t=${Date.now()}`;
      img.src = urlWithTimestamp;
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    throw error;
  }
};

const DocumentGenerator: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loadingPatient, setLoadingPatient] = useState<boolean>(false);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [pdfHeader, setPdfHeader] = useState<PdfHeaderConfig | null>(null);
  const [loadingPdfConfig, setLoadingPdfConfig] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false); // New state for download status
  const [document, setDocument] = useState(false);
  const { toast } = useToast();
  const { id } = useParams();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [expandedTaskIds, setExpandedTaskIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };
  const fetchSinglePatient = async (patientId: string) => {
    setLoadingPatient(true);
    setPatientData(null);

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "User token is missing. Please log in.",
        variant: "destructive",
      });
      setLoadingPatient(false);
      return;
    }

    try {
      const result = await getSinglePatientAPI(patientId, token);
      console.log(result, "patinet");
      setPatientData(result);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoadingPatient(false);
    }
  };

  const fetchPdfHeaderConfig = async () => {
    setLoadingPdfConfig(true);
    if (!token || !user?.id) {
      toast({
        title: "Authentication Error",
        description: "User ID or token is missing for PDF header config.",
        variant: "destructive",
      });
      setLoadingPdfConfig(false);
      return;
    }

    try {
      const response = await getPdfAPI(user.id, token);
      if (response && response.success) {
        setPdfHeader(response.data);
      } else {
        setPdfHeader(null);
        toast({
          title: "PDF Header Config Not Found",
          description: "Could not retrieve custom PDF header settings.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Error fetching PDF header config:", err);
      setPdfHeader(null);
      toast({
        title: "Error Fetching PDF Header",
        description: "Failed to load PDF header configuration.",
        variant: "destructive",
      });
    } finally {
      setLoadingPdfConfig(false);
    }
  };

  useEffect(() => {
    if (id) {
      setSelectedPatientId(id);
      fetchSinglePatient(id);
    }
  }, [id, token]);

  useEffect(() => {
    if (user?.id && token) {
      fetchPdfHeaderConfig();
    }
  }, [user?.id, token]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date/Time";
    }
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const addDynamicHeader = async (
    doc: jsPDF,
    pdfHeader: PdfHeaderConfig | null,
    pageWidth: number,
    margin: number
  ): Promise<number> => {
    const headerHeight = 50;
    const logoHeight = 24;
    const logoWidth = 24;
    const primaryColor = [41, 128, 185];
    const accentColor = [52, 152, 219];
    const textColor = [50, 50, 50];

    if (!pdfHeader) {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 35, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("PATIENT CARE MANAGEMENT", margin, 20);
      doc.setFontSize(12);
      return 50;
    }

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    let currentYLeft = margin;

    if (pdfHeader.logo_url) {
      try {
        const logoBase64 = await getImageAsBase64(pdfHeader.logo_url);
        doc.addImage(
          logoBase64,
          "PNG",
          margin,
          currentYLeft + 2,
          logoWidth,
          logoHeight
        );
        currentYLeft += logoHeight + 5;
      } catch (error) {
        console.error("Logo loading failed:", error);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, currentYLeft, logoWidth, logoHeight, "F");
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(
          "LOGO HERE",
          margin + logoWidth / 2 - doc.getTextWidth("LOGO HERE") / 2,
          currentYLeft + logoHeight / 2 + 2
        );
        currentYLeft += logoHeight + 2;
      }
    }

    if (
      pdfHeader.organization_name_enabled &&
      pdfHeader.organization_name_value
    ) {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(pdfHeader.organization_name_value, margin, currentYLeft);
      currentYLeft += 8;
    }

    const rightColumnX = pageWidth - margin;
    let currentYRight = margin + 5;

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    let phoneFaxText = "";
    if (pdfHeader.phone_enabled && pdfHeader.phone_value) {
      phoneFaxText += `Ph: ${pdfHeader.phone_value}`;
    }
    if (pdfHeader.fax_enabled && pdfHeader.fax_value) {
      phoneFaxText += `${phoneFaxText ? ", " : ""}Fax: ${pdfHeader.fax_value}`;
    }
    if (phoneFaxText) {
      doc.text(phoneFaxText, rightColumnX, currentYRight, { align: "right" });
      currentYRight += 6;
    }

    let emailLicText = "";
    if (pdfHeader.email_enabled && pdfHeader.email_value) {
      emailLicText += pdfHeader.email_value;
    }
    if (pdfHeader.license_number_enabled && pdfHeader.license_number_value) {
      emailLicText += `${emailLicText ? ", " : ""}Lic: ${
        pdfHeader.license_number_value
      }`;
    }
    if (emailLicText) {
      doc.text(emailLicText, rightColumnX, currentYRight, { align: "right" });
      currentYRight += 6;
    }

    if (pdfHeader.address_enabled && pdfHeader.address_value) {
      const addressLines = doc.splitTextToSize(pdfHeader.address_value, 70);
      addressLines.forEach((line: string) => {
        doc.text(line, rightColumnX, currentYRight, { align: "right" });
        currentYRight += 6;
      });
      currentYRight += 2;
    }

    if (pdfHeader.website_enabled && pdfHeader.website_value) {
      doc.text(pdfHeader.website_value, rightColumnX, currentYRight, {
        align: "right",
      });
      currentYRight += 6;
    }

    return headerHeight;
  };

  const handleDownloadPdf = async () => {
    if (!patientData) {
      toast({
        title: "No Patient Data",
        description: "Please load patient data first to generate a PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true); // Set downloading state to true

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 7;
      const maxWidth = pageWidth - 2 * margin;

      const primaryColor = [41, 128, 185];
      const accentColor = [52, 152, 219];
      const textColor = [50, 50, 50];
      const headingColor = [25, 77, 120];

      let yPosition = margin;

      const headerHeight = await addDynamicHeader(
        pdf,
        pdfHeader,
        pageWidth,
        margin
      );

      if (pdfHeader) {
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setLineWidth(1);
        pdf.line(0, headerHeight, pageWidth, headerHeight);
      }

      yPosition = headerHeight + 20;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

      const addSection = async (title: string, contentLines: string[]) => {
        yPosition += 5;

        if (yPosition + lineHeight * 2 + 5 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(headingColor[0], headingColor[1], headingColor[2]);

        pdf.text(title, margin, yPosition);
        yPosition += lineHeight * 1.5;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        for (const line of contentLines) {
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        }
        yPosition += lineHeight;
      };

      // --- Demographics ---
      const demographicsContent = [
        `Full Name: ${patientData.firstName || ""} ${
          patientData.middleName ? patientData.middleName + " " : ""
        }${patientData.lastName || ""}`,
        `Age: ${calculateAge(patientData.birthDate)} years`,
        `Date of Birth: ${formatDate(patientData.birthDate)}`,
        `Gender: ${patientData.gender || "N/A"}`,
        `Status: ${patientData.status || "N/A"}`,
        `Email: ${patientData.email || "N/A"}`,
        `Phone: ${patientData.phone || "N/A"}`,
        `Emergency Contact: ${patientData.emergencyContact || "N/A"}`,
        `Address Line 1: ${patientData.addressLine1 || "N/A"}`,
        ...(patientData.addressLine2
          ? [`Address Line 2: ${patientData.addressLine2}`]
          : []),
        `City: ${patientData.city || "N/A"}`,
        `State: ${patientData.state || "N/A"}`,
        `Country: ${patientData.country || "N/A"}`,
        `Zip Code: ${patientData.zipCode || "N/A"}`,
        `Last Visit: ${formatDate(patientData.lastVisit)}`,
        `Ethnicity: ${patientData.ethnicity || "N/A"}`,
        `Preferred Language: ${patientData.preferredLanguage || "N/A"}`,
      ];
      await addSection("Demographics", demographicsContent);

      // --- Vitals ---
      const vitalsContent = [];
      if (
        patientData.height ||
        patientData.weight ||
        patientData.bmi ||
        patientData.bloodPressure ||
        patientData.heartRate ||
        patientData.temperature
      ) {
        vitalsContent.push(
          `Height: ${patientData.height ? patientData.height + " cm" : "N/A"}`
        );
        vitalsContent.push(
          `Weight: ${patientData.weight ? patientData.weight + " kg" : "N/A"}`
        );
        vitalsContent.push(`BMI: ${patientData.bmi || "N/A"}`);
        vitalsContent.push(
          `Blood Pressure: ${
            patientData.bloodPressure
              ? patientData.bloodPressure + " mmHg"
              : "N/A"
          }`
        );
        vitalsContent.push(
          `Heart Rate: ${
            patientData.heartRate ? patientData.heartRate + " bpm" : "N/A"
          }`
        );
        vitalsContent.push(
          `Temperature: ${
            patientData.temperature ? patientData.temperature + "°F" : "N/A"
          }`
        );
      } else {
        vitalsContent.push("No vital signs data available.");
      }
      await addSection("Vitals", vitalsContent);

      // --- Allergies ---
      const allergiesContent = [];
      if (patientData.allergies && patientData.allergies.length > 0) {
        patientData.allergies.forEach((allergy, index) => {
          let allergyText = `${index + 1}. Allergen: ${
            allergy.allergen || "N/A"
          }`;
          if (allergy.category)
            allergyText += `, Category: ${allergy.category}`;
          allergyText += `, Reaction: ${allergy.reaction || "N/A"}`;
          allergiesContent.push(allergyText);
        });
      } else {
        allergiesContent.push("No allergies on record.");
      }
      await addSection("Allergies", allergiesContent);

      // --- Current Medications ---
      const medicationsContent = [];
      if (
        patientData.currentMedications &&
        patientData.currentMedications.length > 0
      ) {
        patientData.currentMedications.forEach((med, index) => {
          let medText = `${index + 1}. Name: ${med.name || "N/A"}, Dosage: ${
            med.dosage || "N/A"
          }, Frequency: ${med.frequency || "N/A"}`;
          medicationsContent.push(medText);
          let medDetails = `   Prescribed By: ${
            med.prescribedBy || "N/A"
          }, Start Date: ${formatDate(med.startDate)}`;
          if (med.endDate)
            medDetails += `, End Date: ${formatDate(med.endDate)}`;
          medDetails += `, Status: ${med.status || "N/A"}`;
          medicationsContent.push(medDetails);
        });
      } else {
        medicationsContent.push("No current medications on record.");
      }
      await addSection("Current Medications", medicationsContent);

      // --- Diagnosis ---
      const diagnosisContent = [];
      if (patientData.diagnosis && patientData.diagnosis.length > 0) {
        patientData.diagnosis.forEach((diag, index) => {
          let diagText = `${index + 1}. Date: ${formatDate(
            diag.date
          )}, Diagnosis: ${diag.diagnosis || "N/A"} (ICD-10: ${
            diag.icd10 || "N/A"
          })`;
          if (diag.status) diagText += `, Status: ${diag.status}`;
          if (diag.type) diagText += `, Type: ${diag.type}`;
          diagnosisContent.push(diagText);
        });
      } else {
        diagnosisContent.push("No diagnoses on record.");
      }
      await addSection("Diagnosis", diagnosisContent);

      // --- Insurance Information ---
      const insuranceContent = [];
      if (patientData.insurance && patientData.insurance.length > 0) {
        patientData.insurance.forEach((ins, index) => {
          let insText = `${index + 1}. Company: ${
            ins.company || "N/A"
          }, Plan: ${ins.plan || "N/A"}, Type: ${ins.type || "N/A"}`;
          insuranceContent.push(insText);
          let insDetails = `   Policy Number: ${
            ins.policyNumber || "N/A"
          }, Group Number: ${ins.groupNumber || "N/A"}`;
          insuranceContent.push(insDetails);
          insDetails = `   Effective Date: ${formatDate(
            ins.effectiveDate
          )}, Expiration Date: ${formatDate(ins.expirationDate)}`;
          insuranceContent.push(insDetails);
        });
      } else {
        insuranceContent.push("No insurance details on record.");
      }
      await addSection("Insurance Information", insuranceContent);

      // --- Notes ---
      const notesContent = [];
      if (patientData.notes && patientData.notes.length > 0) {
        patientData.notes.forEach((noteItem, index) => {
          let noteText = `${index + 1}. Note: ${noteItem.note || "N/A"}`;
          notesContent.push(noteText);
          if (noteItem.created) {
            let noteMeta = `   Created On: ${formatDateTime(noteItem.created)}`;
            if (noteItem.created_by)
              noteMeta += `, Created By User ID: ${noteItem.created_by}`;
            notesContent.push(noteMeta);
          }
        });
      } else {
        notesContent.push("No notes on record.");
      }
      await addSection("Notes", notesContent);

      const tasksContent = [];

      if (patientData.carePlanTasks && patientData.carePlanTasks.length > 0) {
        patientData.carePlanTasks.forEach((task, index) => {
          tasksContent.push(`${index + 1}. Title: ${task.task_title || "N/A"}`);
          tasksContent.push(
            `   Description: ${task.task_description || "N/A"}`
          );
          tasksContent.push(`   Status: ${task.status || "N/A"}`);
          tasksContent.push(`   Priority: ${task.priority || "N/A"}`);
          tasksContent.push(`   Type: ${task.type?.toUpperCase() || "N/A"}`);
          tasksContent.push(`   Duration: ${task.duration || "N/A"} mins`);
          tasksContent.push(
            `   Frequency: ${task.frequency || "N/A"} ${
              task.frequency_type || ""
            }`
          );
          if (task.due_date) {
            tasksContent.push(`   Due Date: ${formatDateTime(task.due_date)}`);
          }
          if (task.created) {
            tasksContent.push(`   Created On: ${formatDateTime(task.created)}`);
          }
          tasksContent.push(""); // Empty line between tasks
        });
      } else {
        tasksContent.push("No tasks on record.");
      }

      await addSection("Tasks", tasksContent);
      const fileName = `patient-record-${patientData.firstName || "patient"}-${
        patientData.lastName || "data"
      }-${formatDate(new Date().toISOString()).replace(/\s/g, "-")}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF downloaded",
        description: "The patient record has been downloaded as a PDF",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false); // Set downloading state to false after completion or error
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 text-primary mr-2" />
            Patient Data Report
          </CardTitle>
          <CardDescription>
            View and download comprehensive patient data.
          </CardDescription>
        </CardHeader>

        <div className="flex justify-end mr-3">
          <Button className="" onClick={() => setDocument(true)}>
            Add Documents
          </Button>
        </div>
        <br />
        <CardContent className="space-y-6">
          {(loadingPatient || loadingPdfConfig) && (
            <div className="flex items-center justify-center space-x-2 text-lg text-gray-600">
              <span>
                <Loader />
              </span>
            </div>
          )}

          {!loadingPatient && !loadingPdfConfig && patientData && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Name & Email Top Section */}
                <div className="mb-4 space-y-1 text-sm text-gray-800">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {patientData.firstName} {patientData.middleName}{" "}
                    {patientData.lastName}
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{patientData.email}</span>
                  </p>
                </div>

                {/* Three Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Demographics */}
                  <div className="border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
                    <h4 className="text-base font-semibold text-gray-700 border-b pb-1">
                      Demographics
                    </h4>
                    <div className="text-sm space-y-1 text-gray-800">
                      <p>
                        <span className="font-medium">Age:</span>{" "}
                        {calculateAge(patientData.birthDate)} years
                      </p>
                      <p>
                        <span className="font-medium">Gender:</span>{" "}
                        {patientData.gender}
                      </p>
                      <p>
                        <span className="font-medium">Ethnicity:</span>{" "}
                        {patientData.ethnicity || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
                    <h4 className="text-base font-semibold text-gray-700 border-b pb-1">
                      Contact
                    </h4>
                    <div className="text-sm space-y-1 text-gray-800">
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {patientData.phone}
                      </p>
                      <p>
                        <span className="font-medium">Emergency:</span>{" "}
                        {patientData.emergencyContact || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
                    <h4 className="text-base font-semibold text-gray-700 border-b pb-1">
                      Vitals
                    </h4>
                    <div className="text-sm space-y-1 text-gray-800">
                      <p>
                        <span className="font-medium">BP:</span>{" "}
                        {patientData.bloodPressure || "N/A"} mmHg
                      </p>
                      <p>
                        <span className="font-medium">HR:</span>{" "}
                        {patientData.heartRate || "N/A"} bpm
                      </p>
                      <p>
                        <span className="font-medium">Temp:</span>{" "}
                        {patientData.temperature || "N/A"}°F
                      </p>
                      <p>
                        <span className="font-medium">BMI:</span>{" "}
                        {patientData.bmi || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Current Diagnoses</h4>
                    <div className="space-y-1">
                      {patientData.diagnosis &&
                      patientData.diagnosis.length > 0 ? (
                        patientData.diagnosis.map((diag) => (
                          <Badge
                            key={diag.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {diag.diagnosis} ({diag.icd10})
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No diagnoses on record.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">
                      Current Medications
                    </h4>
                    <div className="space-y-1">
                      {patientData.currentMedications &&
                      patientData.currentMedications.length > 0 ? (
                        patientData.currentMedications.map((med, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {med.name} {med.dosage}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No current medications on record.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Allergies</h4>
                  <div className="flex flex-wrap gap-1">
                    {patientData.allergies &&
                    patientData.allergies.length > 0 ? (
                      patientData.allergies.map((allergy) => (
                        <Badge
                          key={allergy.id}
                          variant="destructive"
                          className="text-xs"
                        >
                          {allergy.allergen} - {allergy.reaction}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No allergies on record.
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Insurance</h4>
                  <div className="flex flex-wrap gap-1">
                    {patientData.insurance &&
                    patientData.insurance.length > 0 ? (
                      patientData.insurance.map((ins, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {ins.company} - {ins.plan} ({ins.type})
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No insurance details on record.
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Notes</h4>
                  <div className="space-y-1">
                    {patientData.notes && patientData.notes.length > 0 ? (
                      patientData.notes.map((noteItem, index) => (
                        <p key={index} className="text-sm">
                          <strong>Note {index + 1}:</strong> {noteItem.note}
                          {noteItem.created &&
                            ` (Created on: ${formatDateTime(noteItem.created)}${
                              noteItem.created_by
                                ? `, by User ID: ${noteItem.created_by}`
                                : ""
                            })`}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No notes on record.
                      </p>
                    )}
                  </div>
                </div>
                <br />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Tasks</h4>
                  <div className="space-y-3">
                    {patientData?.carePlanTasks && patientData?.carePlanTasks.length > 0 ? (
                      patientData?.carePlanTasks.map((task) => {
                        const isExpanded = expandedTaskIds.includes(task.id);
                        return (
                          <div
                            key={task.id}
                            className="border border-gray-300 rounded-md p-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm">
                                {task.task_title}
                              </p>
                              <button onClick={() => toggleExpand(task.id)}>
                                {isExpanded ? (
                                  <Minus className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="mt-2 text-sm space-y-1">
                                <p>
                                  <span className="font-medium">
                                    Description:
                                  </span>{" "}
                                  {task.task_description}
                                </p>
                                <p>
                                  <span className="font-medium">Status:</span>{" "}
                                  {task.status}
                                </p>
                                <p>
                                  <span className="font-medium">Priority:</span>{" "}
                                  {task.priority}
                                </p>
                                <p>
                                  <span className="font-medium">Type:</span>{" "}
                                  {task.type?.toUpperCase()}
                                </p>
                                <p>
                                  <span className="font-medium">Duration:</span>{" "}
                                  {task.duration} mins
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Frequency:
                                  </span>{" "}
                                  {task.frequency} {task.frequency_type}
                                </p>
                                {task.due_date && (
                                  <p>
                                    <span className="font-medium">
                                      Due Date:
                                    </span>{" "}
                                    {formatDateTime(task.due_date)}
                                  </p>
                                )}
                                {task.created && (
                                  <p>
                                    <span className="font-medium">
                                      Created:
                                    </span>{" "}
                                    {formatDateTime(task.created)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">
                        No tasks on record.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <br />
              <br />

              {/* Show components conditionally based on service type */}
              {patientData?.patientService?.includes(3) && (
                <PcmHistory id={id} />
              )}
              {patientData?.patientService?.includes(2) && (
                <CcmHistory id={id} />
              )}

              <br />
              <br />
              <DocumentDisplay refreshTrigger={true} />
              <CardFooter className="flex justify-end">
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" /> Download PDF
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {!loadingPatient && !loadingPdfConfig && !patientData && (
            <div className="text-center text-gray-500 py-8">
              <p>No patient data found or selected.</p>
              <p>Please ensure a valid patient ID is loaded.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <UploadDocumentDialog open={document} onOpenChange={setDocument} />
    </div>
  );
};

export default DocumentGenerator;
