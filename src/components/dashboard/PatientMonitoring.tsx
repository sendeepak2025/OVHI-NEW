import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  CalendarDays,
  Thermometer,
  Activity,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAllPatientsAPI } from "@/services/operations/patient";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "stable":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  const ageDifMs = Date.now() - birth.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const PatientMonitoring: React.FC = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchPatients = async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const res = await getAllPatientsAPI(page, token, searchQuery);
      if (res?.data) {
        const limitedPatients = res.data.slice(0, 10); // Fetch more to filter critical
        setPatients(limitedPatients);
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

  const criticalPatients = patients.filter(
    (patient) => patient.status?.toLowerCase() === "critical"
  );

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Critical Patients</CardTitle>
            <CardDescription>
              Patient vitals from connected devices
            </CardDescription>
          </div>
          <Badge className="bg-health-green/20 text-health-green-dark hover:bg-health-green/30">
            Live Data
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {criticalPatients.length > 0 ? (
          <div className="space-y-5">
            {criticalPatients.map((patient) => (
              <div
                key={patient?.patientId}
                className="p-3 bg-accent/50 rounded-lg transition-all hover:bg-accent cursor-pointer group space-y-2"
                onClick={() =>
                  navigate(`/provider/patients/${patient?.patientId}`)
                }
              >
                {/* Last Visit */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>Last Visit: {formatDateTime(patient?.lastVisit)}</span>
                </div>

                {/* Main Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg">
                          {patient?.firstname + " " + patient?.lastname}
                        </h3>
                        <Badge className={getStatusColor(patient?.status)}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{calculateAge(patient.birthDate)} yrs</span>
                        <span className="mx-2">•</span>
                        <span>
                          {patient?.diagnosis?.map((item, index) => (
                            <span key={item.id}>
                              {item?.diagnosis}
                              {index < patient.diagnosis.length - 1 && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="hidden md:flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <HeartPulse className="h-4 w-4 text-red-500" />
                      <span>{patient?.heartRate ?? "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span>{patient?.bloodPressure ?? "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span>{patient?.temperature ?? "N/A"}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile view button */}
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No Critical patient found</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientMonitoring;
