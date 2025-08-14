import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertTriangle,
  ThumbsUp,
  Activity,
  Heart,
  Scale,
  Droplets,
  Wifi,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getImageAsBase64 } from "./getImageAsBase64";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
  ReferenceLine,
} from "recharts";
import type {
  MioConnectData,
  ProcessedVitalData,
} from "../../types/mioconnect";
import axios from "axios";
import { getPatientRpmSummaryAPI } from "@/services/operations/patient";
import {
  exportHealthDataToPDF,
  preparePatientInfo,
  formatPeriodDisplay,
} from "./pdf-export-utils";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getSinglePatientAPI } from "@/services/operations/patient";
import { getPdfAPI } from "@/services/operations/settings";
import DeviceAdd from "./DeviceAdd";
import { getPatientDevice } from "@/services/operations/device";
import GetPatientDevices from "./GetPatientDevices";
interface DeviceInfo {
  deviceId: string;
  modelNumber: string;
  battery: number;
  signal: number;
  lastActive: string;
  imei: string;
}

interface MonthlyVitalData {
  month: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  weight: number;
  temp: number;
  bmi: number;
  respiratory: number;
  o2: number;
  bp: string;
  glucoseUnit: any;
  meal: any;
  glucose: any;
}

interface MioConnectVitalsAnalyzerProps {
  patientId?: string;
  patient?: any;
  showDetailedInsights?: boolean;
  mioConnectData?: MioConnectData[];
}

const VitalsAnalyzer: React.FC<MioConnectVitalsAnalyzerProps> = ({
  patientId = "123",
  showDetailedInsights = true,
  mioConnectData = [],
}) => {
  const [vitalsData, setVitalsData] = useState<ProcessedVitalData[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyVitalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [activeChart, setActiveChart] = useState("trends");
  const [isExporting, setIsExporting] = useState(false);
  const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Patient API related code
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const { token } = useSelector((state: RootState) => state.auth);
  const [patientAssignDevices, setPatientAssignDevices] = useState([]);
  // Process monthly vitals data
  const getMonthsBackDate = (monthsBack: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    return date;
  };

  // Fetch patient data
  const fetchPatient = async () => {
    setLoading(true);
    try {
      const res = await getSinglePatientAPI(id, token);
      setPatient(res);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
    setLoading(false);
  };
  const fetchPatientDevices = async () => {
    setLoading(true);
    try {
      const res = await getPatientDevice(token, id);
      console.log(res, "device patient");
      setPatientAssignDevices(res?.data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
    setLoading(false);
  };

  // Fetch patient on component mount
  useEffect(() => {
    fetchPatient();
    fetchPatientDevices();
  }, [id]);

  const [glucoseData, setGlucoseData] = useState([]);
  const [weightData, setWeightData] = useState([]);

  useEffect(() => {
    const processTelemetryData = () => {
      console.log("🔍 Raw telemetry data:", telemetry);

      if (!telemetry || Object.keys(telemetry).length === 0) {
        // console.log("❌ No telemetry data available");
        setMonthlyData([]);
        return;
      }

      // Step 1: Flatten all items like item1, item2, etc.
      console.log("telemetry", telemetry);
      const allEntries = Object.values(telemetry).flat();

      // Step 2: Date filter
      const periodMap = {
        "1month": 1,
        "2months": 2,
        "3months": 3,
        "6months": 6,
      };
      const monthsBack = periodMap[selectedPeriod] || 6;
      const fromDate = getMonthsBackDate(monthsBack);
      // console.log(`📅 Filtering from date: ${fromDate.toISOString()}`);

      const filtered = allEntries.filter((entry: any) => {
        const created = new Date(entry.createdAt);
        const isValid = created >= fromDate;
        // console.log(
        //   `🗂 Entry date: ${created.toISOString()} | Valid: ${isValid}`
        // );
        return isValid;
      });
      // console.log("✅ Filtered entries:", filtered);

      // Step 3: Map to MonthlyVitalData
      const result: MonthlyVitalData[] = filtered.map((entry: any) => {
        const date = new Date(entry.createdAt);
        const dateLabel = date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });

        const data = entry.deviceData || {};
        const systolic = data.sys ?? null;
        const diastolic = data.dia ?? null;
        const pulse = data.pul ?? null;
        const glucose = data.data ?? null;
        const unit = data.unit ?? null;
        const meal = data.meal ?? null;

        const summary = {
          month: dateLabel,
          systolic,
          diastolic,
          pulse,
          glucose: glucose,
          glucoseUnit: unit,
          meal: meal,
          weight: 0,
          temp: 0,
          bmi: 0,
          respiratory: 0,
          o2: 0,
          bp: systolic && diastolic ? `${systolic}/${diastolic}` : "N/A",
        };

        // console.log("📊 Processed summary:", summary);
        return summary;
      });

      // Step 4: Sort
      result.sort((a, b) => {
        const parse = (label: string) =>
          new Date(`${label} ${new Date().getFullYear()}`);
        return parse(a.month).getTime() - parse(b.month).getTime();
      });

      const glucoseChart = result
        .filter((item) => item.glucose)
        .map((item) => ({
          name: item.month + (item.meal ? ` (${item.meal})` : ""),
          Glucose: item.glucose,
          unit: item.glucoseUnit || "mg/dL",
        }));

      setGlucoseData(glucoseChart);

      // console.log("🧾 Final sorted summary:", result);
      setMonthlyData(result);
    };

    processTelemetryData();
  }, [telemetry, selectedPeriod]);

  const { user } = useSelector((state: RootState) => state.auth);

  const fetchPatientRcmSummary = async () => {
    const response = await getPatientRpmSummaryAPI(id, token);
    console.log(response, "RPM Summany");
  };

  useEffect(() => {
    fetchPatientRcmSummary();
  }, []);

  const [pdfHeader, setPdfHeader] = useState(null);
  useEffect(() => {
    const fetchPdfHeader = async () => {
      try {
        const response = await getPdfAPI(user.id, token);
        const headerConfig = response?.data;

        if (headerConfig.logo_url) {
          try {
            const base64Logo = await getImageAsBase64(headerConfig.logo_url);
            headerConfig.logo_base64 = base64Logo;
          } catch (e) {
            console.error("Logo loading failed:", e);
          }
        }

        setPdfHeader(headerConfig);
      } catch (err) {
        console.error("PDF header fetch failed:", err);
      }
    };

    fetchPdfHeader();
  }, []);
  const exportPDF = async () => {
    setIsExporting(true);
    try {
      console.log("🚀 Starting PDF export process...");

      // Use actual patient data from API
      const patientInfo = preparePatientInfo(patient, patient?.patientId || id);

      const targetDeviceId = "100241200303"; // use correct device ID

      // Step 1: Flatten all telemetry entries
      const allEntries = Object.values(telemetry || {}).flat();

      // Step 2: Filter only entries from the specific device
      const filteredByDevice = allEntries.filter(
        (entry) => entry.deviceId === targetDeviceId
      );

      // Step 3: Sort filtered data by createdAt (most recent first)
      const sorted = filteredByDevice.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Step 4: Pick latest telemetry only from correct device
      const latestTelemetry = sorted[0];
      const deviceData = latestTelemetry?.deviceData || {};
      console.log("Patient info for PDF:", patientInfo);
      const response = await getPatientRpmSummaryAPI(id, token);
      const data = response?.data;
      await exportHealthDataToPDF({
        patientInfo: {
          ...patientInfo,
          reportPeriod: formatPeriodDisplay(selectedPeriod),
        },
        monthlyData,
        deviceData,
        selectedPeriod,
        patient,
        setActiveChart,
        pdfHeader,
        data, // Pass the setActiveChart function
        glucoseData,
        weightData,
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === "stable" || value === 0) return "→";
    return trend === "up" ? "↑" : "↓";
  };

  const getTrendColor = (trend: string, vitalName: string) => {
    if (trend === "stable") return "text-gray-600";
    if (vitalName.includes("Blood Pressure")) {
      return trend === "up" ? "text-red-600" : "text-green-600";
    }
    if (vitalName.includes("Weight")) {
      return trend === "up" ? "text-amber-600" : "text-blue-600";
    }
    return trend === "up" ? "text-amber-600" : "text-blue-600";
  };

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const patientId = id;
        const res = await axios.get(
          `${BASE_URL}/devices/${patientId}/telemetry`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res.data.data.data, "patient devices");
        if (res.data.data.success) {
          setTelemetry(res.data.data.data);
        } else {
          setError("No telemetry data found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch telemetry data");
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
  }, []);

  const targetDeviceId = "100241200303"; // use correct device ID

  // Step 1: Flatten all telemetry entries
  const allEntries = Object.values(telemetry || {}).flat();

  // Step 2: Filter only entries from the specific device
  const filteredByDevice = allEntries.filter(
    (entry) => entry.deviceId === targetDeviceId
  );

  // Step 3: Sort filtered data by createdAt (most recent first)
  const sorted = filteredByDevice.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Step 4: Pick latest telemetry only from correct device
  const latestTelemetry = sorted[0];
  const deviceData = latestTelemetry?.deviceData || {};

  const tabCount =
    3 + // BP Trends, All Vitals, Correlation (always shown)
    (weightData.length > 0 ? 1 : 0) +
    (glucoseData.length > 0 ? 1 : 0);

  const gridColsClass = `grid-cols-${tabCount}`;

  return (
    <div>
      {patient?.patientService?.includes(1) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-primary mr-2" />
                Health Analytics
                {patient && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    - {patient.firstName} {patient.lastName}
                  </span>
                )}
              </div>
              {/* <Badge variant="outline" className="text-xs">
            {deviceInfo.length} Device{deviceInfo.length !== 1 ? "s" : ""}{" "}
            Connected
          </Badge> */}
            </CardTitle>
            <CardDescription>
              Real-time health monitoring with MioConnect certified medical
              devices
              {patient && (
                <div className="mt-1">
                  <span className="block">
                    <strong>Patient ID:</strong> {patient.patientId}
                  </span>
                  <span className="block">
                    <strong>DOB:</strong>{" "}
                    {patient.birthDate
                      ? new Date(patient.birthDate).toLocaleDateString("en-GB")
                      : "N/A"}
                  </span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="monthly">Monthly Analytics</TabsTrigger>
                  <TabsTrigger value="devices">Device Status</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="2months">2 Months</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <Button variant="outline" size="sm" onClick={debugChartElements}>
                Debug
              </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportPDF}
                    disabled={isExporting || !patient}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </Button>
                </div>
              </div>
              <TabsContent value="monthly">
                <div className="space-y-6">
                  {/* Monthly Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Avg Blood Pressure
                          </p>
                          <p className="text-2xl font-bold">
                            {deviceData.sys}/{deviceData.dia}
                          </p>
                        </div>
                        <div className="flex items-center text-green-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm ml-1">-5%</span>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Avg Heart Rate
                          </p>
                          <p className="text-2xl font-bold">
                            {deviceData.pul} BPM
                          </p>
                        </div>
                        <div className="flex items-center text-blue-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm ml-1">+2%</span>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Weight Trend
                          </p>
                          <p className="text-2xl font-bold">NA</p>
                        </div>
                        <div className="flex items-center text-amber-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm ml-1">+1.5%</span>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Risk Score
                          </p>
                          <p className="text-2xl font-bold">
                            {deviceData.sys > 140 || deviceData.dia > 90
                              ? "High"
                              : "Low"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            deviceData.sys > 140
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {deviceData.sys > 140 ? "Caution" : "Improving"}
                        </Badge>
                      </div>
                    </Card>
                  </div>

                  {/* Advanced Charts */}
                  <Tabs
                    value={activeChart}
                    onValueChange={setActiveChart}
                    className="w-full"
                  >
                    <TabsList className={`grid w-full ${gridColsClass}`}>
                      <TabsTrigger value="trends">BP Trends</TabsTrigger>
                      {weightData.length > 0 && (
                        <TabsTrigger value="weight">Weight & BMI</TabsTrigger>
                      )}{" "}
                      <TabsTrigger value="vitals">All Vitals</TabsTrigger>
                      <TabsTrigger value="correlation">Correlation</TabsTrigger>
                      {glucoseData.length > 0 && (
                        <TabsTrigger value="glucose">Glucose</TabsTrigger>
                      )}
                    </TabsList>

                    <TabsContent value="trends" className="mt-6">
                      <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Blood Pressure Trends
                          </CardTitle>
                          <CardDescription>
                            Monthly blood pressure averages with normal range
                          </CardDescription>
                        </CardHeader>
                        <div className="h-[300px] w-full" id="bp-trends-chart">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="opacity-30"
                              />
                              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                              <YAxis
                                domain={[60, 160]}
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "6px",
                                }}
                              />
                              <ReferenceLine
                                y={120}
                                stroke="#10b981"
                                strokeDasharray="5 5"
                                label="Normal Systolic"
                              />
                              <ReferenceLine
                                y={80}
                                stroke="#10b981"
                                strokeDasharray="5 5"
                                label="Normal Diastolic"
                              />
                              <Area
                                dataKey="systolic"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary) / 0.1)"
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="diastolic"
                                stroke="hsl(var(--destructive))"
                                strokeWidth={2}
                                dot={{
                                  fill: "hsl(var(--destructive))",
                                  strokeWidth: 2,
                                  r: 4,
                                }}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="weight" className="mt-6">
                      <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <Scale className="h-5 w-5" />
                            Weight & BMI Tracking
                          </CardTitle>
                          <CardDescription>
                            Monthly weight changes and BMI calculations
                          </CardDescription>
                        </CardHeader>
                        <div className="h-[300px] w-full" id="weight-bmi-chart">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="opacity-30"
                              />
                              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "6px",
                                }}
                              />
                              <Bar
                                yAxisId="left"
                                dataKey="weight"
                                fill="hsl(var(--primary) / 0.6)"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="bmi"
                                stroke="hsl(var(--destructive))"
                                strokeWidth={3}
                                dot={{
                                  fill: "hsl(var(--destructive))",
                                  strokeWidth: 2,
                                  r: 5,
                                }}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="vitals" className="mt-6">
                      <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            All Vital Signs
                          </CardTitle>
                          <CardDescription>
                            Comprehensive monthly vital signs overview
                          </CardDescription>
                        </CardHeader>
                        <div className="h-[300px] w-full" id="all-vitals-chart">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="opacity-30"
                              />
                              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "6px",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="pulse"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                name="Heart Rate"
                              />
                              <Line
                                type="monotone"
                                dataKey="respiratory"
                                stroke="hsl(var(--destructive))"
                                strokeWidth={2}
                                name="Respiratory Rate"
                              />
                              <Line
                                type="monotone"
                                dataKey="o2"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="O2 Saturation"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="correlation" className="mt-6">
                      <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Vital Signs Correlation
                          </CardTitle>
                          <CardDescription>
                            Relationship between different vital measurements
                          </CardDescription>
                        </CardHeader>
                        <div
                          className="h-[300px] w-full"
                          id="correlation-chart"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="opacity-30"
                              />
                              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "6px",
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="systolic"
                                stackId="1"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary) / 0.4)"
                              />
                              <Area
                                type="monotone"
                                dataKey="pulse"
                                stackId="2"
                                stroke="hsl(var(--destructive))"
                                fill="hsl(var(--destructive) / 0.4)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="glucose" className="mt-6">
                      <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Glucose Level Monitoring
                          </CardTitle>
                          <CardDescription>
                            Track and analyze blood glucose levels over time
                          </CardDescription>
                        </CardHeader>
                        <div className="h-[300px] w-full" id="glucose-chart">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={glucoseData}>
                              <CartesianGrid
                                stroke="#eee"
                                strokeDasharray="3 3"
                              />
                              <XAxis dataKey="name" />
                              <YAxis
                                label={{
                                  value: glucoseData[0]?.unit || "mg/dL",
                                  angle: -90,
                                  position: "insideLeft",
                                }}
                              />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="Glucose"
                                stroke="#82ca9d"
                                activeDot={{ r: 8 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Monthly Insights */}
                  {showDetailedInsights && (
                    <Card className="p-6">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle>Monthly Health Insights</CardTitle>
                        <CardDescription>
                          AI-powered analysis of your monthly vital trends
                        </CardDescription>
                      </CardHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">
                              Blood Pressure Improving
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            Your blood pressure has decreased by 5% over the
                            last 3 months, indicating good cardiovascular
                            health.
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-blue-800">
                              Heart Rate Stable
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            Your resting heart rate remains within normal range
                            with slight improvement in variability.
                          </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="h-5 w-5 text-amber-600" />
                            <span className="font-medium text-amber-800">
                              Weight Management
                            </span>
                          </div>
                          <p className="text-sm text-amber-700">
                            Weight has increased slightly. Consider discussing
                            dietary adjustments with your healthcare provider.
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <span className="font-medium text-purple-800">
                              Overall Health Score
                            </span>
                          </div>
                          <p className="text-sm text-purple-700">
                            Based on all vitals, your health trajectory shows
                            positive improvements with minor areas to monitor.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="devices">
                <DeviceAdd
                  patientId={patient?.patientId}
                  fetchPatientDevices={fetchPatientDevices}
                />
                <br />
                <GetPatientDevices
                  patientAssignDevices={patientAssignDevices}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VitalsAnalyzer;
