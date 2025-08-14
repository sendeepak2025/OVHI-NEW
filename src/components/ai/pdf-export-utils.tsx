import { pdf } from "@react-pdf/renderer";
import html2canvas from "html2canvas";
import HealthReportPDF from "./health-report-pdf";
import { useEffect, useState } from "react";
import { getPdfAPI } from "@/services/operations/settings";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface ExportDataParams {
  patientInfo: {
    name: string;
    id: string;
    dateOfBirth: string;
    reportDate: string;
    reportPeriod: string;
  };
  monthlyData: any[];
  deviceData: any;
  selectedPeriod: string;
  patient?: any;
  setActiveChart: (chart: string) => void; // Add this to control chart switching

  pdfHeader: any;
  glucoseData: any;
  weightData: any;
  data: any;
}

// Function to wait for a specific time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to capture chart as image with better error handling
export const captureChartAsImage = async (
  elementId: string,
  chartName: string
): Promise<string> => {
  try {
    console.log(`🔍 Capturing ${chartName} with ID: ${elementId}`);

    // Wait for chart to be fully rendered
    await wait(2000);

    let element = document.getElementById(elementId);

    if (!element) {
      console.log(
        `❌ Element with id ${elementId} not found, trying alternatives...`
      );

      // Try to find any visible recharts element
      const rechartElements = document.querySelectorAll(".recharts-wrapper");
      console.log(`Found ${rechartElements.length} recharts elements`);

      for (let i = 0; i < rechartElements.length; i++) {
        const chart = rechartElements[i] as HTMLElement;
        const rect = chart.getBoundingClientRect();
        const style = window.getComputedStyle(chart);

        if (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        ) {
          element = chart;
          console.log(`✅ Found visible recharts element for ${chartName}`);
          break;
        }
      }
    }

    if (!element) {
      console.warn(`❌ No visible chart found for ${chartName}`);
      return "";
    }

    // Check element dimensions
    const rect = element.getBoundingClientRect();
    console.log(`📊 ${chartName} dimensions: ${rect.width}x${rect.height}`);

    if (rect.width === 0 || rect.height === 0) {
      console.warn(`⚠️ ${chartName} has zero dimensions`);
      return "";
    }

    // Scroll into view
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    await wait(1000);

    // Capture the chart
    console.log(`📸 Capturing ${chartName}...`);

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    const imageData = canvas.toDataURL("image/png", 0.9);

    if (imageData && imageData.length > 5000) {
      // Increased minimum size
      console.log(
        `✅ Successfully captured ${chartName} (${Math.round(
          imageData.length / 1024
        )}KB)`
      );
      return imageData;
    } else {
      console.warn(`⚠️ Captured image for ${chartName} seems too small`);
      return "";
    }
  } catch (error) {
    console.error(`❌ Error capturing ${chartName}:`, error);
    return "";
  }
};

// Function to capture all charts by programmatically switching tabs
export const captureAllCharts = async (
  setActiveChart: (chart: string) => void,
  glucoseData: any,
  weightData: any
): Promise<{
  bpTrends?: string;
  weightBMI?: string;
  allVitals?: string;
  correlation?: string;
  glucose?: string;
}> => {
  console.log("🎯 Starting programmatic chart capture...");

  const chartImages: any = {};

  const chartConfigs = [
    {
      tabValue: "trends",
      chartId: "bp-trends-chart",
      resultKey: "bpTrends",
      name: "BP Trends",
    },

    {
      tabValue: "vitals",
      chartId: "all-vitals-chart",
      resultKey: "allVitals",
      name: "All Vitals",
    },
    {
      tabValue: "correlation",
      chartId: "correlation-chart",
      resultKey: "correlation",
      name: "Correlation",
    },
    ...(glucoseData.length > 0
      ? [
          {
            tabValue: "glucose",
            chartId: "glucose-chart",
            resultKey: "glucose",
            name: "Glucose",
          },
        ]
      : []),

    ...(weightData.length > 0
      ? [
          {
            tabValue: "weight",
            chartId: "weight-bmi-chart",
            resultKey: "weightBMI",
            name: "Weight & BMI",
          },
        ]
      : []),
  ];

  for (const config of chartConfigs) {
    try {
      console.log(`\n📊 === Processing ${config.name} ===`);

      // Programmatically switch to the tab
      console.log(`🔄 Switching to ${config.tabValue} tab...`);
      setActiveChart(config.tabValue);

      // Wait for tab to switch and chart to render
      await wait(3000);

      // Verify the tab is active by checking if the chart container exists and is visible
      const chartElement = document.getElementById(config.chartId);
      if (chartElement) {
        const rect = chartElement.getBoundingClientRect();
        console.log(
          `✅ Chart ${config.name} is visible: ${rect.width}x${rect.height}`
        );
      } else {
        console.log(
          `⚠️ Chart ${config.name} container not found, trying generic capture`
        );
      }

      // Capture the chart
      const imageData = await captureChartAsImage(config.chartId, config.name);

      if (imageData) {
        chartImages[config.resultKey] = imageData;
        console.log(`✅ Successfully captured ${config.name}`);
      } else {
        console.warn(`⚠️ Failed to capture ${config.name}`);
      }

      // Small delay between captures
      await wait(1000);
    } catch (error) {
      console.error(`❌ Failed to capture ${config.name}:`, error);
    }
  }

  console.log("\n📋 Final Chart Capture Summary:");
  Object.keys(chartImages).forEach((key) => {
    console.log(`✅ ${key}: ${Math.round(chartImages[key].length / 1024)}KB`);
  });

  console.log(
    `🎉 Successfully captured ${Object.keys(chartImages).length}/4 charts`
  );
  return chartImages;
};

// Main export function
export const exportHealthDataToPDF = async ({
  patientInfo,
  monthlyData,
  deviceData,
  selectedPeriod,
  patient,
  setActiveChart,
  pdfHeader,
  data,
  glucoseData,
  weightData,
}: ExportDataParams) => {
  let loadingToast: HTMLElement | null = null;

  try {
    // Show loading state
    loadingToast = document.createElement("div");
    loadingToast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Preparing charts for export...</span>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
    loadingToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      z-index: 9999;
      font-family: system-ui;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-width: 350px;
    `;
    document.body.appendChild(loadingToast);

    // Update loading message
    loadingToast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Capturing charts (switching tabs automatically)...</span>
      </div>
    `;

    // Capture charts using programmatic tab switching
    const chartImages = await captureAllCharts(
      setActiveChart,
      glucoseData,
      weightData
    );

    // Update loading message
    loadingToast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Generating PDF report...</span>
      </div>
    `;

    // Prepare insights data
    const insights = [
      {
        title: "Blood Pressure Improving",
        description:
          "Your blood pressure has decreased by 5% over the last 3 months, indicating good cardiovascular health.",
        type: "positive" as const,
      },
      {
        title: "Heart Rate Stable",
        description:
          "Your resting heart rate remains within normal range with slight improvement in variability.",
        type: "positive" as const,
      },
      {
        title: "Weight Management",
        description:
          "Weight has increased slightly. Consider discussing dietary adjustments with your healthcare provider.",
        type: "warning" as const,
      },
      {
        title: "Overall Health Score",
        description:
          "Based on all vitals, your health trajectory shows positive improvements with minor areas to monitor.",
        type: "neutral" as const,
      },
    ];

    // Prepare device info
    // const deviceInfo = [
    //   {
    //     deviceId: "100241200303",
    //     modelNumber: "TMB-2092",
    //     battery: 85,
    //     signal: 18,
    //     lastActive: new Date().toLocaleDateString(),
    //     imei: "100241200303",
    //   },
    // ];

    console.log("📄 Creating PDF document...");
    console.log("Chart images available:", Object.keys(chartImages));

    // Create PDF document
    const pdfDoc = (
      <HealthReportPDF
        patientInfo={{
          ...patientInfo,
          reportPeriod: selectedPeriod,
          reportDate: new Date().toISOString(),
        }}
        monthlyData={monthlyData}
        deviceData={deviceData}
        chartImages={chartImages}
        insights={insights}
        pdfHeader={pdfHeader}
        data={data}
        glucoseData={glucoseData}
        weightData={weightData}
      />
    );

    // Generate PDF blob
    const pdfBlob = await pdf(pdfDoc).toBlob();

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;

    // Create a safe filename
    const safeName = patientInfo.name.replace(/[^a-zA-Z0-9]/g, "-");
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `health-report-${safeName}-${selectedPeriod}-${dateStr}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Remove loading toast
    if (loadingToast && document.body.contains(loadingToast)) {
      document.body.removeChild(loadingToast);
    }

    // Show success message
    const successToast = document.createElement("div");
    successToast.textContent = `PDF exported successfully! (${
      Object.keys(chartImages).length
    }/4 charts included)`;
    successToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      z-index: 9999;
      font-family: system-ui;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-width: 350px;
    `;
    document.body.appendChild(successToast);

    setTimeout(() => {
      if (document.body.contains(successToast)) {
        document.body.removeChild(successToast);
      }
    }, 5000);
  } catch (error) {
    console.error("❌ Error generating PDF:", error);

    // Remove loading toast if it exists
    if (loadingToast && document.body.contains(loadingToast)) {
      document.body.removeChild(loadingToast);
    }

    // Show error message
    const errorToast = document.createElement("div");
    errorToast.textContent = "Failed to generate PDF report. Please try again.";
    errorToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      z-index: 9999;
      font-family: system-ui;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    document.body.appendChild(errorToast);

    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast);
      }
    }, 4000);
  }
};

// Utility functions
export const formatPeriodDisplay = (period: string): string => {
  const periodMap: { [key: string]: string } = {
    "1month": "Last 1 Month",
    "2months": "Last 2 Months",
    "3months": "Last 3 Months",
    "6months": "Last 6 Months",
  };
  return periodMap[period] || period;
};

export const preparePatientInfo = (patient: any, patientId: string) => {
  return {
    name:
      patient?.firstName && patient?.lastName
        ? `${patient.firstName} ${patient.lastName}`
        : patient?.name || `Patient ${patientId}`,
    id: patientId,
    dateOfBirth: patient?.birthDate || patient?.dateOfBirth || "N/A",
    reportDate: new Date().toISOString(),
    reportPeriod: "",
  };
};
