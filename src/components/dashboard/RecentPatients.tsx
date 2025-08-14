import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeartPulse, Calendar, Clock, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAllPatientsAPI } from "@/services/operations/patient";
import { Patient } from "@/types/dataTypes";
import Loader from "../Loader";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "critical":
      return "bg-health-red border-health-red text-black";
    case "stable":
      return "bg-health-green border-health-green text-black";
    case "improving":
      return "bg-health-blue border-health-blue text-black";
    default:
      return "bg-secondary border-secondary text-secondary-foreground";
  }
};

const RecentPatients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const { token } = useSelector((state: RootState) => state.auth);

  const fetchPatients = async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const res = await getAllPatientsAPI(page, token, searchQuery);

      if (res?.data) {
        const limitedPatients = res.data.slice(0, 3);
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

  const calculateAge = (birthDate: string) => {
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
  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients(1, search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>
              Monitor your recent patient activities
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/provider/patients")}
          >
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {patients.length > 0 ? ( // Corrected syntax: added '?' for ternary operator
          <div className="space-y-5">
            {patients.map((patient) => (
              <div
                key={patient?.patientId}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg transition-all hover:bg-accent cursor-pointer group"
                onClick={() =>
                  navigate(`/provider/patients/${patient?.patientId}`)
                }
              >
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
                      <span> {calculateAge(patient.birthDate)} yrs</span>
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

                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <HeartPulse className="h-4 w-4 text-health-red" />
                    <span>{patient?.heartRate}</span>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{patient?.lastVisit}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="ghost" size="icon" className="md:hidden">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          // Corrected syntax: added ':' for the else condition
          <p className="text-center "> No patient found</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPatients;
