// utils/generatePatientPdf.js
import jsPDF from 'jspdf';
import moment from 'moment';

const getImageAsBase64 = async (imageUrl) => {
  try {
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
    const proxyBaseUrl = `${BASE_URL}/proxy-image`;
    const proxiedImageUrl = `${proxyBaseUrl}?url=${encodeURIComponent(imageUrl)}`;
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
        console.error("Image loading failed. Check URL and CORS settings:", error);
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

const addDynamicHeader = async (
  doc,
  pdfHeader,
  pageWidth,
  margin
) => {
  const headerHeight = 50;
  const logoHeight = 24;
  const logoWidth = 24;

  if (!pdfHeader) {
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT CARE MANAGEMENT", margin, 20);
    doc.setFontSize(12);
    doc.text("Clinical Assessment Report", margin, 28);
    return 50;
  }

  // ✅ Header background and border
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, headerHeight, "F");
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(1);
  doc.line(0, headerHeight, pageWidth, headerHeight);

  // --- LEFT SIDE: Logo and Organization Name ---
  // Y-axis के लिए fixed value (5) का उपयोग किया गया है
  let currentYLeft = 5; 
  if (pdfHeader.logo_url) {
    try {
      const logoBase64 = await getImageAsBase64(pdfHeader.logo_url);
      doc.addImage(logoBase64, "PNG", margin, currentYLeft, logoWidth, logoHeight);
      currentYLeft += logoHeight + 5;
    } catch (error) {
      console.error("Logo loading failed:", error);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, currentYLeft, logoWidth, logoHeight, "F");
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text("LOGO HERE", margin + logoWidth / 2 - doc.getTextWidth("LOGO HERE") / 2, currentYLeft + logoHeight / 2 + 2);
      currentYLeft += logoHeight + 2;
    }
  }

  if (pdfHeader.organization_name_enabled && pdfHeader.organization_name_value) {
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(pdfHeader.organization_name_value, margin, currentYLeft);
    currentYLeft += 8;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Clinical Assessment Report", margin, currentYLeft);

  // --- RIGHT SIDE: Contact Details ---
  const rightColumnX = pageWidth - margin;
  // Y-axis के लिए fixed value (5) का उपयोग किया गया है
  let currentYRight = 10;

  doc.setTextColor(60, 60, 60);
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
    emailLicText += `${emailLicText ? ", " : ""}Lic: ${pdfHeader.license_number_value}`;
  }
  if (emailLicText) {
    doc.text(emailLicText, rightColumnX, currentYRight, { align: "right" });
    currentYRight += 6;
  }

  if (pdfHeader.address_enabled && pdfHeader.address_value) {
    const addressLines = doc.splitTextToSize(pdfHeader.address_value, 70);
    addressLines.forEach((line) => {
      doc.text(line, rightColumnX, currentYRight, { align: "right" });
      currentYRight += 6;
    });
    currentYRight += 2;
  }

  if (pdfHeader.website_enabled && pdfHeader.website_value) {
    doc.text(pdfHeader.website_value, rightColumnX, currentYRight, { align: "right" });
    currentYRight += 6;
  }

  return headerHeight;
};

const generatePatientPdf = async (patientData, pdfHeader) => {
  const doc = new jsPDF();
  const margin = 15;
  const lineHeight = 7;
  const sectionSpacing = 10;
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- FIXED TOP: "Generated" Date ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${moment().format('MMMM Do, YYYY')}`, pageWidth - margin, 10, { align: 'right' });
  
  // --- DYNAMIC HEADER ---
  let yPosition = await addDynamicHeader(doc, pdfHeader, pageWidth, margin);
  yPosition += 8;

  // --- Patient Data Report Heading (अब यह dynamic header के नीचे है) ---
  const reportTitle = 'Patient Data Report';
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const textWidth = doc.getTextWidth(reportTitle);
  const xCenter = (pageWidth - textWidth) / 2;
  doc.text(reportTitle, xCenter, yPosition);
  
  yPosition += 8;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += sectionSpacing;

  // Function to add a section title with an underline
  const addSectionTitle = (title) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPosition);
    yPosition += 2;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
  };

  // Function to add a key-value pair, with optional X-offset for columns
  const addKeyValuePair = (key, value, xOffset = 0) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${key}:`, margin + xOffset, yPosition);
    doc.setFont('helvetica', 'normal');
    const keyWidth = doc.getTextWidth(`${key}:`);
    doc.text(value || 'N/A', margin + xOffset + keyWidth + 2, yPosition);
    yPosition += lineHeight;
  };

  const checkPageBreak = () => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // --- Patient Summary (Two-Column Layout) ---
  addSectionTitle('Patient Summary');
  const leftColX = 0;
  const rightColX = pageWidth / 2;

  addKeyValuePair('Patient ID', patientData.patientId, leftColX);
  addKeyValuePair('Name', `${patientData.firstName || ''} ${patientData.middleName || ''} ${patientData.lastName || ''}`, leftColX);
  addKeyValuePair('Gender', patientData.gender, leftColX);
  addKeyValuePair('Date of Birth', patientData.birthDate ? moment(patientData.birthDate).format('MMMM Do, YYYY') : 'N/A', leftColX);
  
  const tempY = yPosition;
  yPosition -= lineHeight * 4;
  addKeyValuePair('Status', patientData.status, rightColX);
  addKeyValuePair('Ethnicity', patientData.ethnicity, rightColX);
  addKeyValuePair('Last Visit', patientData.lastVisit ? moment(patientData.lastVisit).format('MMMM Do, YYYY') : 'N/A', rightColX);
  yPosition = tempY;
  yPosition += sectionSpacing;

  // --- Vitals ---
  checkPageBreak();
  addSectionTitle('Vitals');
  addKeyValuePair('Height', patientData.height ? `${patientData.height} inches` : 'N/A', leftColX);
  yPosition -= lineHeight;
  addKeyValuePair('Weight', patientData.weight ? `${patientData.weight} lbs` : 'N/A', rightColX);
  yPosition += lineHeight;

  addKeyValuePair('BMI', patientData.bmi, leftColX);
  yPosition -= lineHeight;
  addKeyValuePair('Blood Pressure', patientData.bloodPressure, rightColX);
  yPosition += lineHeight;
  
  addKeyValuePair('Heart Rate', patientData.heartRate ? `${patientData.heartRate} bpm` : 'N/A', leftColX);
  yPosition -= lineHeight;
  addKeyValuePair('Temperature', patientData.temperature ? `${patientData.temperature} °F` : 'N/A', rightColX);
  yPosition += lineHeight;
  yPosition += sectionSpacing;

  // --- Contact Information ---
  checkPageBreak();
  addSectionTitle('Contact Information');
  addKeyValuePair('Email', patientData.email, leftColX);
  yPosition -= lineHeight;
  addKeyValuePair('Phone', patientData.phone, rightColX);
  yPosition += lineHeight;
  addKeyValuePair('Emergency Contact', patientData.emergencyContact, leftColX);
  yPosition -= lineHeight;
  addKeyValuePair('Address', `${patientData.addressLine1 || ''}, ${patientData.addressLine2 || ''}`, rightColX);
  yPosition += lineHeight;
  addKeyValuePair('City', `${patientData.city}, ${patientData.state}, ${patientData.zipCode}, ${patientData.country}`, leftColX);
  yPosition += sectionSpacing;

  // --- Allergies ---
  checkPageBreak();
  addSectionTitle('Allergies');
  if (patientData.allergies && patientData.allergies.length > 0) {
    patientData.allergies.forEach((allergy) => {
      checkPageBreak();
      doc.setFontSize(10);
      doc.text(`• ${allergy.allergen}: ${allergy.reaction}`, margin + 5, yPosition);
      yPosition += lineHeight;
    });
  } else {
    doc.setFontSize(10);
    doc.text('No known allergies.', margin + 5, yPosition);
    yPosition += lineHeight;
  }
  yPosition += sectionSpacing;

  // --- Medications ---
  checkPageBreak();
  addSectionTitle('Current Medications');
  if (patientData.currentMedications && patientData.currentMedications.length > 0) {
    patientData.currentMedications.forEach((med) => {
      checkPageBreak();
      doc.setFontSize(10);
      doc.text(`• ${med.name}: ${med.dosage}, ${med.frequency} (Status: ${med.status})`, margin + 5, yPosition);
      yPosition += lineHeight;
    });
  } else {
    doc.setFontSize(10);
    doc.text('No current medications.', margin + 5, yPosition);
    yPosition += lineHeight;
  }
  yPosition += sectionSpacing;

  // --- Diagnosis ---
  checkPageBreak();
  addSectionTitle('Diagnosis');
  if (patientData.diagnosis && patientData.diagnosis.length > 0) {
    patientData.diagnosis.forEach((diag) => {
      checkPageBreak();
      doc.setFontSize(10);
      doc.text(`• ${diag.diagnosis} (${diag.icd10}) - Type: ${diag.type}`, margin + 5, yPosition);
      yPosition += lineHeight;
    });
  } else {
    doc.setFontSize(10);
    doc.text('No diagnoses on record.', margin + 5, yPosition);
    yPosition += lineHeight;
  }
  yPosition += sectionSpacing;

  // --- Insurance ---
  checkPageBreak();
  addSectionTitle('Insurance');
  if (patientData.insurance && patientData.insurance.length > 0) {
    patientData.insurance.forEach((policy, index) => {
      checkPageBreak();
      doc.setFontSize(12);
      doc.text(`Policy ${index + 1} (${policy.type})`, margin + 5, yPosition);
      yPosition += lineHeight;
      doc.setFontSize(10);
      doc.text(`Company: ${policy.company}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Plan: ${policy.plan}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Policy No: ${policy.policyNumber}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Effective: ${policy.effectiveDate ? moment(policy.effectiveDate).format('MM/DD/YYYY') : 'N/A'}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Expires: ${policy.expirationDate ? moment(policy.expirationDate).format('MM/DD/YYYY') : 'N/A'}`, margin + 10, yPosition);
      yPosition += sectionSpacing;
    });
  } else {
    doc.setFontSize(10);
    doc.text('No insurance information available.', margin + 5, yPosition);
    yPosition += lineHeight;
  }
  yPosition += sectionSpacing;

  // --- Notes ---
  checkPageBreak();
  addSectionTitle('Notes');
  if (patientData.notes && patientData.notes.length > 0) {
    patientData.notes.forEach((note) => {
      checkPageBreak();
      doc.setFontSize(10);
      doc.text(`• Note (Type: ${note.type}): "${note.note}"`, margin + 5, yPosition);
      yPosition += lineHeight;
      doc.text(`  Created: ${moment(note.created).format('MM/DD/YYYY')}, Duration: ${note.duration} mins`, margin + 5, yPosition);
      yPosition += lineHeight + 3;
    });
  } else {
    doc.setFontSize(10);
    doc.text('No notes on record.', margin + 5, yPosition);
    yPosition += lineHeight + sectionSpacing;
  }
  yPosition += sectionSpacing;

  // --- Tasks ---
  checkPageBreak();
  addSectionTitle('Tasks');
  if (patientData.tasks && patientData.tasks.length > 0) {
    patientData.tasks.forEach((task) => {
      checkPageBreak();
      doc.setFontSize(10);
      doc.text(`• Task: "${task.task_title}" (Priority: ${task.priority})`, margin + 5, yPosition);
      yPosition += lineHeight;
      doc.text(`  Due: ${moment(task.due_date).format('MMMM Do, YYYY')}, Status: ${task.status}`, margin + 5, yPosition);
      yPosition += lineHeight + 3;
    });
  } else {
    doc.setFontSize(10);
    doc.text('No pending tasks.', margin + 5, yPosition);
    yPosition += lineHeight;
  }
  yPosition += sectionSpacing;
  
  const fileName = `${patientData.firstName}_${patientData.lastName}_report.pdf`;
  doc.save(fileName);
};

export default generatePatientPdf;