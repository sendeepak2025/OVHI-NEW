import { jsPDF } from "jspdf";
import { Activity, Brain, Heart, Stethoscope } from "lucide-react";

// PDF Header Configuration Type
interface PdfHeaderConfig {
  id: number;
  providerId: number;
  logo_enabled: number;
  logo_url: string;
  organization_name_enabled: number;
  organization_name_value: string;
  address_enabled: number;
  address_value: string;
  email_enabled: number;
  email_value: string;
  phone_enabled: number;
  phone_value: string;
  website_enabled: number;
  website_value: string;
  fax_enabled: number;
  fax_value: string;
  license_number_enabled: number;
  license_number_value: string;
}

// ✅ Improved image loading with CORS support and explicit mimeType
const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    // console.log("Loading image from:", imageUrl);
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

    const proxyBaseUrl = `${BASE_URL}/proxy-image`;
    const proxiedImageUrl = `${proxyBaseUrl}?url=${encodeURIComponent(
      imageUrl
    )}`;

    // Create a new image element for better CORS handling
    const img = new Image();
    img.crossOrigin = "anonymous"; // Essential for CORS requests when talking to your proxy

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
          // Determine image type dynamically or use a common one like 'image/png'
          const dataURL = canvas.toDataURL("image/png"); // Using PNG for better quality/transparency
          // console.log("Image converted successfully to base64.");
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

      // Add timestamp to avoid cache issues, crucial for development/testing
      // Now loading from the proxied URL
      const urlWithTimestamp = `${proxiedImageUrl}&t=${Date.now()}`; // Add timestamp to proxy URL
      img.src = urlWithTimestamp;
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    throw error;
  }
};

// ✅ Completely rewritten header function with proper layout as requested
const addDynamicHeader = async (
  doc: jsPDF,
  pdfHeader: PdfHeaderConfig | null,
  pageWidth: number,
  margin: number
): Promise<number> => {
  // Define the total height of the header section
  const headerHeight = 50;
  const logoHeight = 24;
  const logoWidth = 24;

  if (!pdfHeader) {
    // Fallback to original header if no config is provided
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT CARE MANAGEMENT", margin, 20);
    doc.setFontSize(12);
    doc.text("Clinical Assessment Report", margin, 28);
    return 50; // Return the Y position after the fallback header
  }

  // ✅ Header background and border
  doc.setFillColor(255, 255, 255); // White background for the header area
  doc.rect(0, 0, pageWidth, headerHeight, "F");
  doc.setDrawColor(41, 128, 185); // Blue border color
  doc.setLineWidth(1);
  doc.line(0, headerHeight, pageWidth, headerHeight); // Bottom border line

  // --- LEFT SIDE: Logo and Organization Name ---
  let currentYLeft = margin; // Starting Y position for the left column

  // Logo
  if (pdfHeader.logo_url) {
    try {
      const logoBase64 = await getImageAsBase64(pdfHeader.logo_url);
      doc.addImage(
        logoBase64,
        "PNG",
        margin,
        currentYLeft,
        logoWidth,
        logoHeight
      );
      currentYLeft += logoHeight + 5; // Move Y position down after logo
    } catch (error) {
      console.error("Logo loading failed:", error);
      // Fallback: Add placeholder text instead of logo
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

  // Organization Name (below logo)
  if (
    pdfHeader.organization_name_enabled &&
    pdfHeader.organization_name_value
  ) {
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(pdfHeader.organization_name_value, margin, currentYLeft);
    currentYLeft += 8; // Adjust Y after organization name
  }

  // "Clinical Assessment Report" - moved to be below the organization name
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Clinical Assessment Report", margin, currentYLeft);

  // --- RIGHT SIDE: Contact Details ---
  const rightColumnX = pageWidth - margin; // Right align text
  let currentYRight = margin + 5; // Starting Y position for the right column

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Phone and Fax (combined)
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

  // Email and License (combined)
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

  // Address
  if (pdfHeader.address_enabled && pdfHeader.address_value) {
    const addressLines = doc.splitTextToSize(pdfHeader.address_value, 70); // Max width for address
    addressLines.forEach((line: string) => {
      doc.text(line, rightColumnX, currentYRight, { align: "right" });
      currentYRight += 6; // Reduced line height for address lines
    });
    currentYRight += 2; // Small extra space after address
  }

  // Website URL
  if (pdfHeader.website_enabled && pdfHeader.website_value) {
    doc.text(pdfHeader.website_value, rightColumnX, currentYRight, {
      align: "right",
    });
    currentYRight += 6;
  }

  return headerHeight; // Return the new Y position after the header section
};

const assessmentQuestions = [
  {
    category: "Symptom Assessment",
    icon: Stethoscope,
    color: "bg-blue-50 border-blue-200",
    questions: [
      "Rate your overall energy level (1-10, where 1=extremely low, 10=excellent)",
      "Any new or worsening symptoms in the past week?",
      "Current pain level assessment (0-10, where 0=no pain, 10=severe pain)",
      "Sleep quality evaluation (hours per night and quality)",
      "Any episodes of dizziness, shortness of breath, or chest discomfort?",
    ],
  },
  {
    category: "Vital Signs & Physical Health",
    icon: Heart,
    color: "bg-red-50 border-red-200",
    questions: [
      "Recent blood pressure readings (if available)",
      "Weight changes in the past month (gained/lost/stable)",
      "Heart rate irregularities or palpitations",
      "Any swelling in legs, ankles, or feet?",
      "Recent lab results or glucose readings (if applicable)",
    ],
  },
  {
    category: "Medication & Treatment Adherence",
    icon: Activity,
    color: "bg-green-50 border-green-200",
    questions: [
      "Missed medication doses in the past week (how many?)",
      "Any side effects from current medications?",
      "Medication timing compliance (taking at prescribed times)",
      "Pharmacy refill status and medication availability",
      "Any changes to medication regimen by other providers?",
    ],
  },
  {
    category: "Lifestyle & Psychosocial Factors",
    icon: Brain,
    color: "bg-purple-50 border-purple-200",
    questions: [
      "Exercise activity level (frequency and type)",
      "Dietary compliance and eating patterns",
      "Stress level evaluation (1-10 scale)",
      "Social support adequacy and family involvement",
      "Any financial barriers to care or medications?",
    ],
  },
];
// ✅ Updated main PDF generation function
export const generateProfessionalPDF = async (
  aiResponse: any,
  patient: any,
  assessmentData: Record<string, string>,
  totalTime: string,
  pdfHeader: PdfHeaderConfig | null,
  pdftype: string
): Promise<{ blob: Blob; fileName: string }> => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const maxWidth = pageWidth - 2 * margin;

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 25;
      return true;
    }
    return false;
  };

  // ✅ Add dynamic header
  // console.log("Adding header with config:", pdfHeader);
  let yPosition = await addDynamicHeader(doc, pdfHeader, pageWidth, margin);

  // ✅ Risk level badge (better positioned)

  // doc.setFillColor(r, g, b)
  // doc.roundedRect(pageWidth - 80, yPosition - 5, 60, 15, 3, 3, "F") // Adjust Y position relative to header
  // doc.setTextColor(255, 255, 255)
  // doc.setFontSize(10)
  // doc.setFont("helvetica", "bold")
  // doc.text(`RISK: ${aiResponse.riskLevel}`, pageWidth - 75, yPosition + 5)

  yPosition += 10;

  // ✅ Patient Information Section (with better spacing)
  doc.setFillColor(248, 249, 250);
  doc.rect(margin, yPosition, maxWidth, 50, "F");
  doc.setDrawColor(220, 220, 220);
  doc.rect(margin, yPosition, maxWidth, 50);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT INFORMATION", margin + 5, yPosition + 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // ✅ Better patient info layout
  const patientInfo = [
    { label: "Name", value: patient.firstName || "Not provided" },
    { label: "Condition", value: patient.condition || "Not specified" },
    { label: "Assessment Date", value: new Date().toLocaleDateString() },
    { label: "Risk Score", value: `${aiResponse.riskScore || 0}/100` },
    { label: "Total Time", value: totalTime },
    { label: "Risk", value: aiResponse.riskLevel },
  ];

  // Define risk colors outside the loop to avoid re-creation
  const riskColors: { [key: string]: [number, number, number] } = {
    LOW: [46, 204, 113], // Green
    MODERATE: [241, 196, 15], // Yellow/Orange
    HIGH: [230, 126, 34], // Orange
    CRITICAL: [231, 76, 60], // Red
  };
  const [r, g, b] = riskColors[aiResponse.riskLevel] || [100, 100, 100];

  patientInfo.forEach((info, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const xPos = margin + 10 + col * (maxWidth / 2);
    const yPos = yPosition + 25 + row * 10;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60); // Set default color for labels
    doc.text(`${info.label}:`, xPos, yPos);

    doc.setFont("helvetica", "normal");

    // Apply color specifically to the "Risk" value
    if (info.label === "Risk") {
      const riskLevel = info.value.toUpperCase(); // Ensure case-insensitivity
      const color = riskColors[riskLevel];
      if (color) {
        doc.setTextColor(color[0], color[1], color[2]);
      } else {
        doc.setTextColor(60, 60, 60); // Default color if risk level not found
      }
    } else {
      doc.setTextColor(60, 60, 60); // Set default color for other values
    }

    doc.text(info.value, xPos + 40, yPos);

    // Reset color after drawing the value, important for subsequent text
    doc.setTextColor(60, 60, 60);
  });
  yPosition += 60;

  // Rest of the PDF content remains the same...
  // Clinical Summary
  checkNewPage(40);
  doc.setFillColor(52, 152, 219);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CLINICAL SUMMARY", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(
    aiResponse.clinicalSummary,
    maxWidth - 10
  );
  doc.text(summaryLines, margin + 5, yPosition);
  yPosition += summaryLines.length * 5 + 15;

  // Risk Assessment Section
  checkNewPage(50);
  doc.setFillColor(r, g, b);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RISK ASSESSMENT", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Risk factors
  if (aiResponse.riskFactors && aiResponse.riskFactors.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Identified Risk Factors:", margin + 5, yPosition);
    yPosition += 8;
    doc.setFont("helvetica", "normal");
    aiResponse.riskFactors.forEach((factor: string) => {
      doc.text(`• ${factor}`, margin + 10, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  const riskLines = doc.splitTextToSize(
    aiResponse.riskAssessment,
    maxWidth - 10
  );
  doc.text(riskLines, margin + 5, yPosition);
  yPosition += riskLines.length * 5 + 15;

  // Care Recommendations
  checkNewPage(50);
  doc.setFillColor(46, 204, 113);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CARE RECOMMENDATIONS", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const careLines = doc.splitTextToSize(
    aiResponse.careRecommendations,
    maxWidth - 10
  );
  doc.text(careLines, margin + 5, yPosition);
  yPosition += careLines.length * 5 + 15;

  // Immediate Actions
  checkNewPage(40);
  doc.setFillColor(155, 89, 182);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("IMMEDIATE ACTIONS", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const actionLines = doc.splitTextToSize(
    aiResponse.immediateActions,
    maxWidth - 10
  );
  doc.text(actionLines, margin + 5, yPosition);
  yPosition += actionLines.length * 5 + 15;

  // Follow-up Plan
  checkNewPage(40);
  doc.setFillColor(243, 156, 18);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("FOLLOW-UP PLAN", margin + 5, yPosition + 6);

  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const followUpLines = doc.splitTextToSize(
    aiResponse.followUpPlan,
    maxWidth - 10
  );
  doc.text(followUpLines, margin + 5, yPosition);
  yPosition += followUpLines.length * 5 + 15;

  // Urgent Concerns (if any)
  if (
    aiResponse.urgentConcerns &&
    !aiResponse.urgentConcerns.includes("No immediate urgent concerns")
  ) {
    checkNewPage(40);
    doc.setFillColor(231, 76, 60);
    doc.rect(margin, yPosition, maxWidth, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("URGENT CONCERNS", margin + 5, yPosition + 6);

    yPosition += 15;
    doc.setTextColor(231, 76, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const urgentLines = doc.splitTextToSize(
      aiResponse.urgentConcerns,
      maxWidth - 10
    );
    doc.text(urgentLines, margin + 5, yPosition);
    yPosition += urgentLines.length * 5 + 15;
  }

  // Assessment Data Appendix
  doc.addPage();
  yPosition = 25;

  doc.setFillColor(52, 73, 94);
  doc.rect(margin, yPosition, maxWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ASSESSMENT DATA SUMMARY", margin + 5, yPosition + 6);

  yPosition += 20;

  assessmentQuestions?.forEach((category, categoryIndex) => {
    checkNewPage(60);
    doc.setFillColor(236, 240, 241);
    doc.rect(margin, yPosition, maxWidth, 6, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(category.category, margin + 5, yPosition + 4);
    yPosition += 12;

    category.questions.forEach((question, questionIndex) => {
      const response =
        assessmentData[`${categoryIndex}-${questionIndex}`] || "Not provided";
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 73, 94);
      const questionLines = doc.splitTextToSize(
        `Q: ${question}`,
        maxWidth - 10
      );
      doc.text(questionLines, margin + 5, yPosition);
      yPosition += questionLines.length * 4 + 2;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const responseLines = doc.splitTextToSize(
        `A: ${response}`,
        maxWidth - 10
      );
      doc.text(responseLines, margin + 5, yPosition);
      yPosition += responseLines.length * 4 + 8;

      checkNewPage(30);
    });

    yPosition += 5;
  });

  // ✅ Footer with better organization info
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer background
    doc.setFillColor(248, 249, 250);
    doc.rect(0, pageHeight - 25, pageWidth, 25, "F");
    doc.setDrawColor(220, 220, 220);
    doc.line(0, pageHeight - 25, pageWidth, pageHeight - 25);

    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    doc.setFont("helvetica", "normal");

    // Left side - Generation info
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      margin,
      pageHeight - 15
    );

    // Center - Organization name
    if (
      pdfHeader?.organization_name_enabled &&
      pdfHeader?.organization_name_value
    ) {
      const orgText = pdfHeader.organization_name_value;
      const textWidth = doc.getTextWidth(orgText);
      doc.text(orgText, (pageWidth - textWidth) / 2, pageHeight - 15);
    }

    // Right side - Page number
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 15);

    doc.text(
      "This assessment supplements professional medical care - Not a substitute for clinical judgment",
      margin,
      pageHeight - 8
    );
  }

  // Generate blob and filename
  const fileName = `${patient.firstName}_${pdftype}_Assessment_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  const pdfBlob = doc.output("blob");

  return { blob: pdfBlob, fileName };
};
