import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parse } from "date-fns";

import {
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { getAllPatientsAPI } from "@/services/operations/patient";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Link } from "react-router-dom";
import Loader from "@/components/Loader";

// Types based on your API response
interface Patient {
  patientId: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  birthDate: string;
  email: string;
  phone: string;
  gender: string;
  ethnicity: string;
  lastVisit: string;
  emergencyContact: string;
  height: number;
  weight: number;
  bmi: number;
  bloodPressure: number;
  heartRate: number;
  temperature: number;
  status: "Critical" | "Abnormal" | "Normal";
  address: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Patient[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type PatientCategory = "all" | "critical" | "abnormal" | "normal";

// Sample data based on your provided JSON
const sampleData: ApiResponse = {
  success: true,
  message: "Patients fetched successfully",
  data: [
    {
      patientId: 1,
      firstname: "Vikash",
      middlename: "Maheshwari",
      lastname: "Maheshwari",
      birthDate: "1973-04-20T18:30:00.000Z",
      email: "rishimaheshwari0@gmail.com",
      phone: "5126689794",
      gender: "Male",
      ethnicity: "Caucasian",
      lastVisit: "2025-06-15T18:30:00.000Z",
      emergencyContact: "Laura Thompson - 4155556789",
      height: 1.78,
      weight: 80,
      bmi: 25,
      bloodPressure: 120,
      heartRate: 72,
      temperature: 99,
      status: "Abnormal",
      address: "1234 Elm Street",
    },
    {
      patientId: 3,
      firstname: "Vikash",
      middlename: "Maheshwari",
      lastname: "Maheshwari",
      birthDate: "1973-04-20T18:30:00.000Z",
      email: "vikashmaheshwari6267@gmail.com",
      phone: "5126689794",
      gender: "Male",
      ethnicity: "Caucasian",
      lastVisit: "2025-06-15T18:30:00.000Z",
      emergencyContact: "Laura Thompson - 4155556789",
      height: 1.78,
      weight: 80,
      bmi: 25,
      bloodPressure: 120,
      heartRate: 72,
      temperature: 99,
      status: "Abnormal",
      address: "1234 Elm Street",
    },
    // Add some sample data for other statuses to demonstrate
    {
      patientId: 4,
      firstname: "John",
      middlename: "Michael",
      lastname: "Smith",
      birthDate: "1985-08-15T18:30:00.000Z",
      email: "john.smith@email.com",
      phone: "5551234567",
      gender: "Male",
      ethnicity: "Caucasian",
      lastVisit: "2025-06-20T18:30:00.000Z",
      emergencyContact: "Jane Smith - 5559876543",
      height: 1.75,
      weight: 75,
      bmi: 24.5,
      bloodPressure: 180,
      heartRate: 95,
      temperature: 102,
      status: "Critical",
      address: "5678 Oak Avenue",
    },
    {
      patientId: 5,
      firstname: "Sarah",
      middlename: "Elizabeth",
      lastname: "Johnson",
      birthDate: "1990-12-03T18:30:00.000Z",
      email: "sarah.johnson@email.com",
      phone: "5559876543",
      gender: "Female",
      ethnicity: "African American",
      lastVisit: "2025-06-18T18:30:00.000Z",
      emergencyContact: "Robert Johnson - 5551234567",
      height: 1.65,
      weight: 65,
      bmi: 23.9,
      bloodPressure: 115,
      heartRate: 68,
      temperature: 98.6,
      status: "Normal",
      address: "9012 Pine Street",
    },
  ],
  pagination: {
    total: 4,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

export default function PatientDashboard() {
  const [selectedCategory, setSelectedCategory] =
    useState<PatientCategory>("all");
  const [apiData, setApiData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const { token } = useSelector((state: RootState) => state.auth);

  const fetchPatients = async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const res = await getAllPatientsAPI(page, token, searchQuery);
      console.log(res);

      if (res?.data) {
        setApiData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1, search);
  }, [token]);
  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
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

  // Get full name
  const getFullName = (patient: Patient): string => {
    const parts = [
      patient.firstname,
      patient.middlename,
      patient.lastname,
    ].filter(Boolean);
    return parts.join(" ");
  };

  // Filter patients based on selected category
  const filteredPatients = useMemo(() => {
    if (!apiData) return [];

    if (selectedCategory === "all") return apiData;

    const statusMap: Record<PatientCategory, string[]> = {
      all: [],
      critical: ["Critical"],
      abnormal: ["Abnormal"],
      normal: ["Normal"],
    };

    return apiData.filter((patient) =>
      statusMap[selectedCategory]?.includes(patient.status)
    );
  }, [apiData, selectedCategory]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    if (!apiData) return { total: 0, critical: 0, abnormal: 0, normal: 0 };

    const counts = apiData.reduce(
      (acc, patient) => {
        acc.total++;
        switch (patient.status.toLowerCase()) {
          case "critical":
            acc.critical++;
            break;
          case "abnormal":
            acc.abnormal++;
            break;
          case "normal":
            acc.normal++;
            break;
        }
        return acc;
      },
      { total: 0, critical: 0, abnormal: 0, normal: 0 }
    );

    return counts;
  }, [apiData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white";
      case "abnormal":
        return "bg-yellow-500 text-white";
      case "normal":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "abnormal":
        return <Heart className="h-4 w-4" />;
      case "normal":
        return <Thermometer className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string): string => {
    try {
      const parsed = new Date(dateString);
      return format(parsed, "MM/dd/yyyy h:mm a");
    } catch {
      return "Invalid date";
    }
  };
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Patient Monitoring Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Last Updated: {format(new Date(), "MMM d, yyyy h:mm a")}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedCategory("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCounts.total}</div>
            <p className="text-xs text-muted-foreground">Currently monitored</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedCategory("critical")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {categoryCounts.critical}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedCategory("abnormal")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal</CardTitle>
            <Heart className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {categoryCounts.abnormal}
            </div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedCategory("normal")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal</CardTitle>
            <Thermometer className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {categoryCounts.normal}
            </div>
            <p className="text-xs text-muted-foreground">Stable condition</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as PatientCategory)}
      >
        <TabsList>
          <TabsTrigger value="all">
            All Patients ({categoryCounts.total})
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({categoryCounts.critical})
          </TabsTrigger>
          <TabsTrigger value="abnormal">
            Abnormal ({categoryCounts.abnormal})
          </TabsTrigger>
          <TabsTrigger value="normal">
            Normal ({categoryCounts.normal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.patientId}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getFullName(patient)}
                    </CardTitle>
                    <Badge className={getStatusColor(patient.status)}>
                      {getStatusIcon(patient.status)}
                      <span className="ml-1">{patient.status}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{calculateAge(patient.birthDate)} years old</span>
                      <span>•</span>
                      <span>{patient.gender}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Vital Signs */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Vital Signs</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BP:</span>
                          <span className="font-medium">
                            {patient.bloodPressure} mmHg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">HR:</span>
                          <span className="font-medium">
                            {patient.heartRate} bpm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Temp:</span>
                          <span className="font-medium">
                            {patient.temperature}°F
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BMI:</span>
                          <span className="font-medium">{patient.bmi}</span>
                        </div>
                      </div>
                    </div>

                    {/* Physical Stats */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Physical Stats
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Height:</span>
                          <span className="font-medium">{patient.height}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">
                            {patient.weight}kg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{patient.address}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <strong>Last Visit:</strong>{" "}
                        {formatDateTime(patient.lastVisit)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <strong>Emergency Contact:</strong>{" "}
                        {patient.emergencyContact}
                      </div>
                    </div>

                    <Link to={`/provider/patients/${patient.patientId}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 bg-transparent"
                      >
                        View Patient Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No patients found in this category.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination Info */}
      {filteredPatients.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Showing {filteredPatients.length} patients</span>
        </div>
      )}
    </div>
  );
}
