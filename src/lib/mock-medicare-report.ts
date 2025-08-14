import { RootState } from "@/redux/store";
import jsPDF from "jspdf";
import { useSelector } from "react-redux";

export interface NoteEntry {
  note: string;
  created: string;
  duration: string;
}

export interface PatientData {
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  patientId: string;
  providerId: string;
  reportType: any;
  providerName: string | null;
  timings: {
    total: number;
  };
  notes: NoteEntry[][];
  providerCountry: any;
  providerState: any;
  providerCity: any;
}

const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    console.log("Loading image from:", imageUrl);
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
  pdfHeader: any,
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

export const generateMockMedicareReport = async (
  data: PatientData,
  pdfHeader
  // service
): Promise<{ blob: Blob; fileName: string }> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  let yPosition = await addDynamicHeader(doc, pdfHeader, pageWidth, margin);
  let currentY = 30; // Starting Y position for content
  currentY += 39;
  const marginX = 20; // Left and right mar gin
  const lineHeight = 8; // Standard line height
  const sectionSpacing = 15; // Space before a new section heading

  // --- Helper variables for consistent spacing ---

  const fullName =
    `${data.firstName} ${data.middleName} ${data.lastName}`.trim();
  const reportMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const dob = new Date(data.birthDate).toLocaleDateString();
  const totalTime = data?.timings?.total;
  const complianceStatus = totalTime >= 20;

  // --- Header ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 80, 120); // A professional blue
  doc.text("MEDICARE CCM COMPLIANCE REPORT", pageWidth / 2, currentY, {
    align: "center",
  });
  currentY += 15;
  doc.setDrawColor(180, 180, 180); // Light grey line
  doc.line(marginX, currentY, pageWidth - marginX, currentY); // Horizontal line
  currentY += 10;

  // --- Report Metadata ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90); // Slightly lighter text for metadata
  doc.text(
    `Report Generated: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    marginX,
    currentY
  );
  currentY += lineHeight;
  doc.text(`Reporting Period: ${reportMonth}`, marginX, currentY);
  currentY += lineHeight;
  doc.text(`Provider ID: ${data.providerId}`, marginX, currentY);
  if (data.providerName) {
    currentY += lineHeight;
    doc.text(`Provider Name: ${data.providerName}`, marginX, currentY);
  }
  currentY += sectionSpacing * 1.2; // More space before next major section

  // --- Patient Information ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text("PATIENT INFORMATION", marginX, currentY);
  doc.line(marginX, currentY + 3, marginX + 70, currentY + 3); // Underline heading
  currentY += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Patient Name: ${fullName}`, marginX, currentY);
  currentY += lineHeight;
  doc.text(`Patient ID: ${data.patientId}`, marginX, currentY);
  currentY += lineHeight;
  doc.text(`Date of Birth: ${dob}`, marginX, currentY);
  currentY += sectionSpacing;

  // --- Provider Information ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text("PROVIDER INFORMATION", marginX, currentY);
  doc.line(marginX, currentY + 3, marginX + 70, currentY + 3); // Underline heading
  currentY += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Provider Name: ${data?.providerName}`, marginX, currentY);
  currentY += lineHeight;
  doc.text(`Provider ID: ${data?.providerId}`, marginX, currentY);
  currentY += lineHeight;
  doc.text(`City: ${data?.providerCity}`, marginX, currentY);
  currentY += lineHeight;
  doc.text(`State: ${data?.providerState}`, marginX, currentY);
  currentY += lineHeight;
  doc.text(`Country: ${data?.providerCountry}`, marginX, currentY);
  currentY += sectionSpacing;

  // --- Compliance Status ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("COMPLIANCE STATUS", marginX, currentY);
  doc.line(marginX, currentY + 3, marginX + 80, currentY + 3); // Underline heading
  currentY += 10;

  const statusText = complianceStatus ? "COMPLIANT" : "NON-COMPLIANT";
  const statusColor: [number, number, number] = complianceStatus
    ? [34, 139, 34] // Forest Green
    : [220, 20, 60]; // Crimson Red
  doc
    .setTextColor(...statusColor)
    .setFontSize(14)
    .setFont("helvetica", "bold");
  doc.text(`Status: ${statusText}`, marginX, currentY);
  currentY += lineHeight * 1.5;

  doc.setTextColor(0, 0, 0).setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Total Monthly Time: ${totalTime} minutes`, marginX, currentY);
  currentY += lineHeight;
  doc.text(`Minimum Required: 20 minutes`, marginX, currentY);
  currentY += lineHeight;
  doc.text(
    `CPT Code: ${
      complianceStatus
        ? "99490 (Chronic Care Management Services)"
        : "Not Applicable"
    }`,
    marginX,
    currentY
  );
  currentY += sectionSpacing;

  // --- Documented Care Activities ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("DOCUMENTED CARE ACTIVITIES", marginX, currentY);
  doc.line(marginX, currentY + 3, marginX + 110, currentY + 3); // Underline heading
  currentY += 12;

  // Table Headers
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50); // Slightly darker for table headers
  const col1X = marginX;
  const col2X = marginX + 40;
  const col3X = marginX + 80;
  doc.text("Date", col1X, currentY);
  doc.text("Duration", col2X, currentY);
  doc.text("Description", col3X, currentY);
  currentY += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(col1X, currentY, pageWidth - marginX, currentY); // Line below table headers
  currentY += 5;

  // Table Content
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0); // Reset to black

  const activities = data.notes.flat(); // Flatten the notes array for easier iteration

  if (activities.length === 0) {
    doc.text(
      "No care activities documented for this period.",
      marginX,
      currentY
    );
    currentY += lineHeight;
  } else {
    activities.forEach((entry) => {
      const date = new Date(entry.created).toLocaleDateString();
      const durationMin = `${Math.round(parseFloat(entry.duration))} min`;
      const descriptionLines = doc.splitTextToSize(
        entry.note,
        pageWidth - col3X - marginX
      );

      // Check if content fits on current page
      if (currentY + descriptionLines.length * lineHeight > pageHeight - 40) {
        doc.addPage();
        currentY = 30; // Reset Y for new page
        // Redraw table headers on new page
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text("Date", col1X, currentY);
        doc.text("Duration", col2X, currentY);
        doc.text("Description", col3X, currentY);
        currentY += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(col1X, currentY, pageWidth - marginX, currentY);
        currentY += 5;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
      }

      doc.text(date, col1X, currentY);
      doc.text(durationMin, col2X, currentY);
      doc.text(descriptionLines, col3X, currentY);
      currentY +=
        Math.max(lineHeight, descriptionLines.length * lineHeight) + 2; // Add a little extra space between entries
    });
  }
  currentY += sectionSpacing;

  // --- Quality Measures ---
  if (currentY > pageHeight - 80) {
    // Check if enough space for this section
    doc.addPage();
    currentY = 30;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("QUALITY MEASURES", marginX, currentY);
  doc.line(marginX, currentY + 3, marginX + 70, currentY + 3); // Underline heading
  currentY += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60); // Slightly grey for bullet points
  doc.text(
    "• Comprehensive care plan documented and updated",
    marginX + 5,
    currentY
  );
  currentY += lineHeight;
  doc.text(
    "• Patient medication reconciliation completed",
    marginX + 5,
    currentY
  );
  currentY += lineHeight;
  doc.text("• Care coordination activities documented", marginX + 5, currentY);
  currentY += lineHeight;
  doc.text(
    "• Remote monitoring data reviewed and analyzed",
    marginX + 5,
    currentY
  );
  currentY += sectionSpacing;

  // --- Billing Information ---
  if (currentY > pageHeight - 80) {
    // Check if enough space for this section
    doc.addPage();
    currentY = 30;
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text("BILLING INFORMATION", marginX, currentY);
  doc.line(marginX, currentY + 3, marginX + 80, currentY + 3); // Underline heading
  currentY += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  if (complianceStatus) {
    doc.text("Billable Service: Yes", marginX, currentY);
    currentY += lineHeight;
    doc.text(
      "CPT Code: 99490 - Chronic Care Management Services",
      marginX,
      currentY
    );
    currentY += lineHeight;
    doc.text("Units: 1", marginX, currentY);
    currentY += lineHeight;
    doc.text(
      "Reimbursement Rate: $42.60 (Approx. 2025 Rate)",
      marginX,
      currentY
    );
  } else {
    doc.text(
      "Billable Service: No - Minimum time requirement not met for CPT 99490.",
      marginX,
      currentY
    );
    doc.text(
      "Consider additional care coordination activities to meet requirements.",
      marginX,
      currentY + lineHeight
    );
  }

  // --- Footer ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120); // Lighter grey for footer text
  const footerY1 = pageHeight - 20;
  const footerY2 = pageHeight - 10;

  doc.text(
    "This report is generated for CCM billing compliance documentation purposes only.",
    pageWidth / 2,
    footerY1,
    { align: "center" }
  );
  doc.text(
    "Report contains HIPAA-protected health information. Handle according to privacy policies.",
    pageWidth / 2,
    footerY2,
    { align: "center" }
  );

  const pdfBlob = doc.output("blob");
  const fileName = `${data?.reportType}_Report_${fullName.replace(
    /\s+/g,
    "_"
  )}_${new Date().getFullYear()}_${new Date().getMonth() + 1}.pdf`;

  return { blob: pdfBlob, fileName };
};
