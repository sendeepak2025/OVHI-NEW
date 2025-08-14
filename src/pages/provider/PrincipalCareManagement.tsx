import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  UserCheck,
  Video,
  FileText,
  Activity,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CarePlanForm from "./pcm/Careplanform";
import { getSinglePatientAPI } from "@/services/operations/patient";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useParams } from "react-router-dom";
import { PCMAssessment } from "./pcm/PCMAssessment";
import { PCMQuestionnaire } from "./pcm/PCMQuestionnaire";
import PcmHistory from "./pcm/PcmHistory";
import Loader from "@/components/Loader";
import { getPcmReportsAPI } from "@/services/operations/patient";
import PcmNotes from "./pcm/PcmNotes";
import PCMCareCoordinationActivities from "@/components/pcm/PCMCareCoordinationActivities";

interface Patient {
  id: string | number;
  firstName: string;
  middleName?: string;
  lastName: string;
  condition?: string;
  riskLevel?: string;
  status?: string;
  lastAssessment?: string;
  heartRate?: string;
  bloodPressure?: string;
  lastVisit?: string;
  careGoals?: string[];
  diagnosis?: Array<{
    type: string;
    diagnosis: string;
  }>;
  [key: string]: any;
}

export const PrincipalCareManagement = () => {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const [carePlanFormOpen, setCarePlanFormOpen] = useState(false);
  const [pcmReports, setPcmReports] = useState<any[]>([]);
  const [selectedPatientForCarePlan, setSelectedPatientForCarePlan] =
    useState<Patient | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);

  const fetchPcmReports = async () => {
    try {
      setLoading(true);
      const res = await getPcmReportsAPI(id, token);
      console.log("Fetched pcm patient data:", res);

      if (res) {
        setPcmReports(Array.isArray(res) ? res : []);
      } else {
        setPcmReports([]);
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPcmReports();
    }
  }, [id]);

  const handleStartEVisit = (patientData: Patient, patientName: string) => {
    toast({
      title: "PCM E-Visit Started",
      description: `Starting comprehensive care visit for ${patientName}`,
    });
    setSelectedPatient(patientData);
    setActiveTab("assessment");
  };

  const handleUpdateCare = (patientData: Patient) => {
    setSelectedPatientForCarePlan(patientData);
    setCarePlanFormOpen(true);
  };

  const primaryDiagnosis = patient?.diagnosis?.find(
    (item) => item.type === "primary"
  );

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await getSinglePatientAPI(id, token);
      if (res) {
        setPatient(res);
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatients();
    }
  }, [id]);

  const handleCarePlanSave = (carePlanData: any) => {
    toast({
      title: "Care Plan Updated",
      description: `Care plan for ${carePlanData.patientName} has been updated successfully.`,
    });

    if (patient && selectedPatientForCarePlan) {
      setPatient((prev) =>
        prev
          ? {
              ...prev,
              condition: carePlanData.primaryCondition,
              riskLevel: carePlanData.riskLevel,
              bloodPressure: carePlanData.vitalSigns?.bloodPressure,
              heartRate: carePlanData.vitalSigns?.heartRate,
              weight: carePlanData.vitalSigns?.weight,
              temperature: carePlanData.vitalSigns?.temperature,
              careGoals: carePlanData.careGoals?.map(
                (goal: any) => goal.goal || goal
              ),
              medications: carePlanData.medications?.map(
                (med: any) => med.name || med
              ),
              lastAssessment: "Just now",
            }
          : null
      );
    }

    handleCarePlanClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCarePlanClose = () => {
    setCarePlanFormOpen(false);
    setSelectedPatientForCarePlan(null);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!patient) {
    return <Loader />;
  }

  const patientName = `${patient.firstName} ${patient.middleName || ""} ${
    patient.lastName
  }`.trim();
  const primaryConditionName =
    primaryDiagnosis?.diagnosis || patient.condition || "General Care";

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Principal Care Management (PCM)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive care coordination for patients with serious chronic
            conditions
          </p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Patient Overview</TabsTrigger>
              <TabsTrigger value="assessment">Long Assessment</TabsTrigger>
              <TabsTrigger value="short">Short Assessment</TabsTrigger>
              {/* <TabsTrigger value="coordination">Care Coordination</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <Card className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{patientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {primaryConditionName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getRiskColor(patient.riskLevel || "")}>
                          {(patient.riskLevel || "Unknown").toUpperCase()} RISK
                        </Badge>
                        <Badge variant="outline">
                          {patient.status || "Active"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Last Assessment
                          </p>
                          <p className="text-sm font-medium">
                            {pcmReports[0]?.created
                              ? new Date(pcmReports[0].created).toLocaleString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                  }
                                )
                              : "Not yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Heart Rate
                          </p>
                          <p className="text-sm font-medium">
                            {patient.heartRate || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Diagnosis
                          </p>
                          <p className="text-sm font-medium">
                            {primaryConditionName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Last Visit
                          </p>
                          <p className="text-sm font-medium">
                            {patient.lastVisit
                              ? new Date(patient.lastVisit).toLocaleDateString()
                              : "Not available"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {patient.careGoals && patient.careGoals.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">
                          Current Care Goals:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {patient.careGoals.map((goal, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              {goal}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleStartEVisit(patient, patient.firstName)
                        }
                        className="flex-1"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Start Long Assessment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateCare(patient)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Update Care Plan
                      </Button>
                    </div>
                  </Card>
                </div>
                <br />
                <PcmHistory id={id} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="assessment">
              <PCMAssessment />
            </TabsContent>

            <TabsContent value="short" className="space-y-6">
              <PcmNotes />
            </TabsContent>

            <TabsContent value="coordination" className="space-y-6">
              <PCMCareCoordinationActivities
                patientId={id!}
                providerId="current-provider" // You might want to get this from your auth state
                patientName={patientName}
                primaryCondition={primaryConditionName}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Care Plan Form Modal */}
      {selectedPatientForCarePlan && (
        <CarePlanForm
          patient={selectedPatientForCarePlan}
          isOpen={carePlanFormOpen}
          onClose={handleCarePlanClose}
          onSave={handleCarePlanSave}
        />
      )}
    </>
  );
};
