import type React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },

  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
  },
  section: {
    marginBottom: 20, // General section margin
  },
  // We'll apply this specific style to the "DOCUMENTED CARE ACTIVITIES" section
  // to control its bottom margin more precisely or prevent forced page breaks
  careActivitiesSection: {
    // You might want a smaller margin for this section if it's the last one on a page,
    // or if you want it to appear immediately after the previous content.
    marginBottom: 10, // A reduced margin, or even 0 if you want no space after it.
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    width: "23%",
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
  },
  statLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statTrend: {
    fontSize: 8,
    color: "#059669",
    marginTop: 2,
  },
  chartContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  chartImage: {
    width: "100%",
    height: 180,
    objectFit: "contain",
  },
  chartPlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  dataTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#e5e7eb",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: "#374151",
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  insightCard: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f0f9ff",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#bae6fd",
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 5,
  },
  insightText: {
    fontSize: 10,
    color: "#0c4a6e",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  deviceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 3,
  },
  deviceText: {
    fontSize: 9,
    color: "#374151",
  },
});

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
interface HealthReportPDFProps {
  patientInfo: {
    name: string;
    id: string;
    dateOfBirth: string;
    reportDate: string;
    reportPeriod: string;
  };
  monthlyData: any[];
  deviceData: any;
  chartImages: {
    bpTrends?: string;
    weightBMI?: string;
    allVitals?: string;
    correlation?: string;
  };
  insights: Array<{
    title: string;
    description: string;
    type: "positive" | "neutral" | "warning";
  }>;
  // deviceInfo: any[];
  pdfHeader: PdfHeaderConfig | null;
  data: any | null;
  weightData: any | null;
  glucoseData: any | null;
}

const HealthReportPDF: React.FC<HealthReportPDFProps> = ({
  patientInfo,
  monthlyData,
  deviceData,
  chartImages,
  insights,
  // deviceInfo,
  pdfHeader,
  data,
  glucoseData,
  weightData,
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAverage = (data: any[], field: string) => {
    const validData = data.filter((item) => item[field] && !isNaN(item[field]));
    if (validData.length === 0) return "N/A";
    const sum = validData.reduce((acc, item) => acc + item[field], 0);
    return (sum / validData.length).toFixed(1);
  };

  // Chart component with fallback
  const ChartSection = ({
    title,
    imageKey,
    description,
  }: {
    title: string;
    imageKey: string;
    description?: string;
  }) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      {description && (
        <Text style={[styles.placeholderText, { marginBottom: 8 }]}>
          {description}
        </Text>
      )}
      {chartImages[imageKey] ? (
        <Image
          style={styles.chartImage}
          src={chartImages[imageKey] || "/placeholder.svg"}
        />
      ) : (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Chart not available</Text>
        </View>
      )}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* <Text style={styles.title}>Health Analytics Report</Text> */}
          <PdfHeader pdfHeader={pdfHeader} patientInfo={patientInfo} />

          <Text style={styles.subtitle}>
            Patient: {patientInfo.name} | ID: {patientInfo.id}
          </Text>
          <Text style={styles.subtitle}>
            Report Period: {patientInfo.reportPeriod} | Generated:{" "}
            {formatDate(patientInfo.reportDate)}
          </Text>
        </View>

        {/* Monthly Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Statistics Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Avg Blood Pressure</Text>
              <Text style={styles.statValue}>
                {deviceData.sys}/{deviceData.dia}
              </Text>
              <Text style={styles.statTrend}>↓ -5%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Avg Heart Rate</Text>
              <Text style={styles.statValue}>{deviceData.pul} BPM</Text>
              <Text style={styles.statTrend}>↑ +2%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Weight Trend</Text>
              <Text style={styles.statValue}>N/A</Text>
              <Text style={styles.statTrend}>↑ +1.5%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Risk Score</Text>
              <Text style={styles.statValue}>
                {deviceData.sys > 140 || deviceData.dia > 90 ? "High" : "Low"}
              </Text>
              <Text
                style={[
                  styles.statTrend,
                  {
                    color: deviceData.sys > 140 ? "#dc2626" : "#059669",
                  },
                ]}
              >
                {deviceData.sys > 140 ? "Caution" : "Improving"}
              </Text>
            </View>
          </View>
        </View>

        {/* Data Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Monthly Data</Text>
          <View style={styles.dataTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Date</Text>
              <Text style={styles.tableCellHeader}>Systolic</Text>
              <Text style={styles.tableCellHeader}>Diastolic</Text>
              <Text style={styles.tableCellHeader}>Pulse</Text>
              <Text style={styles.tableCellHeader}>BP Reading</Text>
            </View>
            {monthlyData.slice(0, 8).map((data, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{data.month}</Text>
                <Text style={styles.tableCell}>{data.systolic || "N/A"}</Text>
                <Text style={styles.tableCell}>{data.diastolic || "N/A"}</Text>
                <Text style={styles.tableCell}>{data.pulse || "N/A"}</Text>
                <Text style={styles.tableCell}>{data.bp || "N/A"}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* Second Page - All Charts and Documented Care Activities */}
      {/* We are consolidating content here. */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Charts & Visualizations</Text>
          <Text style={styles.subtitle}>
            Comprehensive health data visualization
          </Text>
        </View>

        {/* All 4 Charts */}
        <ChartSection
          title="Blood Pressure Trends"
          imageKey="bpTrends"
          description="Monthly blood pressure averages with normal range indicators"
        />

        {weightData?.length > 0 && (
          <ChartSection
            title="Weight & BMI Tracking"
            imageKey="weightBMI"
            description="Monthly weight changes and BMI calculations"
          />
        )}

        <ChartSection
          title="All Vital Signs"
          imageKey="allVitals"
          description="Comprehensive monthly vital signs overview"
        />

        <ChartSection
          title="Vital Signs Correlation"
          imageKey="correlation"
          description="Relationship between different vital measurements"
        />

        {glucoseData?.length > 0 && (
          <ChartSection
            title="Glucose Level Monitoring"
            imageKey="glucose"
            description="Track and analyze blood glucose levels over time"
          />
        )}

        {/* Chart Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chart Summary</Text>
          <View style={styles.dataTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Charts Included:</Text>
              <Text style={styles.tableCell}>
                {Object.keys(chartImages).length}/4
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>BP Trends Chart:</Text>
              <Text style={styles.tableCell}>
                {chartImages.bpTrends ? "✓ Included" : "✗ Not Available"}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Weight & BMI Chart:</Text>
              <Text style={styles.tableCell}>
                {chartImages.weightBMI ? "✓ Included" : "✗ Not Available"}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>All Vitals Chart:</Text>
              <Text style={styles.tableCell}>
                {chartImages.allVitals ? "✓ Included" : "✗ Not Available"}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Correlation Chart:</Text>
              <Text style={styles.tableCell}>
                {chartImages.correlation ? "✓ Included" : "✗ Not Available"}
              </Text>
            </View>
          </View>
        </View>

        {/* --- Documented Care Activities --- */}
        {/*
          Here's the crucial change:
          By default, 'styles.section' has 'marginBottom: 20'.
          If this section is positioned at the very end of the page (after charts and summary),
          that 'marginBottom' can cause it to "not fit" and push to the next page.

          We'll remove or reduce the marginBottom for this specific section
          to allow it to try and fit on the current page.
        */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DOCUMENTED CARE ACTIVITIES</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Date</Text>
            <Text style={styles.tableCellHeader}>Duration</Text>
            <Text style={styles.tableCellHeader}>Description</Text>
          </View>

          {/* Table Content */}
          {data && data.notes && data.notes.flat().length === 0 ? (
            <View
              style={[
                styles.tableRow,
                { borderBottomWidth: 0, paddingBottom: 0 },
              ]}
            >
              <Text style={styles.tableCell}>
                No care activities documented for this period.
              </Text>
            </View>
          ) : (
            data &&
            data.notes &&
            data.notes.flat().map((note, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {new Date(note.created).toLocaleDateString()}
                </Text>
                <Text style={styles.tableCell}>
                  {Math.round(parseFloat(note.duration))} min
                </Text>
                <Text style={styles.tableCell}>{note.note}</Text>
              </View>
            ))
          )}
        </View>

        {/* Third Page - Insights & Device Info (formerly Fourth Page) */}
        <View style={styles.header}>
          <Text style={styles.title}>Health Insights & Device Status</Text>
        </View>

        {/* Health Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Health Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightText}>{insight.description}</Text>
            </View>
          ))}
        </View>

        {/* Device Information */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Devices</Text>
          {deviceInfo.map((device, index) => (
            <View key={index} style={styles.deviceInfo}>
              <View>
                <Text style={styles.deviceText}>
                  Model: {device.modelNumber}
                </Text>
                <Text style={styles.deviceText}>
                  Device ID: {device.deviceId}
                </Text>
              </View>
              <View>
                <Text style={styles.deviceText}>
                  Battery: {device.battery}%
                </Text>
                <Text style={styles.deviceText}>Signal: {device.signal}</Text>
              </View>
            </View>
          ))}
        </View> */}

        {/* Summary Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Summary</Text>
          <View style={styles.dataTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Average Systolic BP:</Text>
              <Text style={styles.tableCell}>
                {calculateAverage(monthlyData, "systolic")} mmHg
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Average Diastolic BP:</Text>
              <Text style={styles.tableCell}>
                {calculateAverage(monthlyData, "diastolic")} mmHg
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Average Heart Rate:</Text>
              <Text style={styles.tableCell}>
                {calculateAverage(monthlyData, "pulse")} BPM
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Total Readings:</Text>
              <Text style={styles.tableCell}>{monthlyData.length}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Report Period:</Text>
              <Text style={styles.tableCell}>{patientInfo.reportPeriod}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This report was generated automatically from MioConnect certified
          medical devices. For medical advice, please consult with your
          healthcare provider.
        </Text>
      </Page>
    </Document>
  );
};

export default HealthReportPDF;
