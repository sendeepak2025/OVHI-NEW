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
  Plus,
  TrendingUp,
  Brain,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CarePlanForm from "./pcm/Careplanform";
import { getSinglePatientAPI } from "@/services/operations/patient";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useParams } from "react-router-dom";
import { CCMAssessment } from "./pcm/CCMAssessment";
import CcmHistory from "./pcm/CcmHistory";
import Loader from "@/components/Loader";
import { getCcmReportsAPI } from "@/services/operations/patient";
import EnhancedCCMAssessment from "./pcm/EnhancedCCMAssessment";
import PcmNotes from "./pcm/PcmNotes";
import { PCMCareplan } from "./pcm/PCMCareplan";
import MedicalRecordGenerator from "./pcm/MedicalRecordGenerator";
import EnhancedClinicalDashboard from "./pcm/EnhancedClinicalDashboard";
import SuperbillGenerator from "./pcm/SuperbillGenerator";
import AutomatedTaskManager from "@/components/tasks/AutomatedTaskManager";
import AIClinicalGuidance from "@/components/ccm/AIClinicalGuidance";
import GetCarePlan from "./GetCarePlan";

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
  notes?: Array<{
    date: string;
    note: string;
  }>;
  diagnosis?: Array<{
    id: string;
    diagnosis: string;
    icd10: string;
  }>;
  patientId?: string | number;
  currentMedications?: Array<{
    name: string;
  }>;
  [key: string]: any;
}

export const ChronicCareManagement = () => {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [pcmReports, setPcmReports] = useState([]);
  const [showCarePlan, setShowCarePlan] = useState(false);

  const [carePlanFormOpen, setCarePlanFormOpen] = useState(false);
  const [selectedPatientForCarePlan, setSelectedPatientForCarePlan] =
    useState<Patient | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);

  const handleStartEVisit = (patientData: Patient, patientName: string) => {
    toast({
      title: "CCM Enhanced Assessment Started",
      description: `Starting comprehensive care management assessment for ${patientName}`,
    });
    setSelectedPatient(patientData);
    setActiveTab("assessment");
  };

  const handleUpdateCare = (patientData: Patient) => {
    setSelectedPatientForCarePlan(patientData);
    setCarePlanFormOpen(true);
  };

  const handleGenerateCarePlan = () => {
    if (patient) {
      setShowCarePlan(true);
      setActiveTab("careplan");
      toast({
        title: "Care Plan Generated",
        description:
          "Care plan has been generated based on patient notes and assessments.",
      });
    }
  };

  const fetchPcmReports = async () => {
    try {
      setLoading(true);
      const res = await getCcmReportsAPI(id, token);

      if (res) {
        setPcmReports(res);
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

  // Get patient conditions for AI guidance
  const getPatientConditions = (): string[] => {
    if (!patient?.diagnosis) return [];
    return patient.diagnosis.map((d) => d.diagnosis.toLowerCase());
  };

  // Get current medications
  const getCurrentMedications = (): string[] => {
    if (!patient?.currentMedications) return [];
    return patient.currentMedications.map((m) => m.name);
  };

  // if (loading ) {
  //   return (
  //     <div>
  //       <Loader />
  //     </div>
  //   );
  // }

  if (!patient) {
    return <Loader />;
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Advanced Chronic Care Management (CCM) with AI Guidance
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered CCM with clinical decision support, automated time
            tracking, quality measures, clinical alerts, care gap analysis, and
            comprehensive medical records
          </p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-1">
              <TabsTrigger value="overview" className="text-xs px-2">
                Overview
              </TabsTrigger>
              {/* <TabsTrigger value="ai-guidance" className="text-xs px-2">
                AI Guide
              </TabsTrigger> */}
              <TabsTrigger value="dashboard" className="text-xs px-2">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="assessment" className="text-xs px-2">
                Assessment
              </TabsTrigger>
              {/* <TabsTrigger value="short" className="text-xs px-2">
                Quick
              </TabsTrigger> */}
              <TabsTrigger value="notes" className="text-xs px-2">
                Notes
              </TabsTrigger>
              <TabsTrigger value="careplan" className="text-xs px-2">
                Care Plan
              </TabsTrigger>
              {/* <TabsTrigger value="billing" className="text-xs px-2">
                Billing
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <Card className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {`${patient?.firstName} ${
                            patient?.middleName || ""
                          } ${patient?.lastName}`.trim()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {patient?.condition || "Condition not specified"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getRiskColor(patient?.riskLevel || "")}>
                          {(patient?.riskLevel || "Unknown").toUpperCase()} RISK
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
                            {patient?.diagnosis?.map((item, index) => (
                              <span key={item.id}>
                                {item.diagnosis} ({item.icd10})
                                {index < patient.diagnosis!.length - 1 && ", "}
                              </span>
                            ))}
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

                    <div className="flex flex-wrap gap-2">
                      {/* <Button
                        onClick={() => setActiveTab("ai-guidance")}
                        className="flex-1 min-w-fit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        AI Clinical Guidance
                      </Button> */}
                      <Button
                        onClick={() => setActiveTab("dashboard")}
                        variant="outline"
                        className="flex-1 min-w-fit"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Clinical Dashboard
                      </Button>
                      <Button
                        onClick={() =>
                          handleStartEVisit(patient, patient.firstName)
                        }
                        variant="outline"
                        className="flex-1 min-w-fit"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Start Assessment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateCare(patient)}
                        className="flex-1 min-w-fit"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Update Care Plan
                      </Button>
                    </div>
                  </Card>
                </div>

                <CcmHistory id={id} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai-guidance">
              <AIClinicalGuidance
                patientId={id || ""}
                providerId="dr-smith"
                patientConditions={getPatientConditions()}
                currentTasks={[]}
                medications={getCurrentMedications()}
              />
            </TabsContent>

            <TabsContent value="dashboard">
              <EnhancedClinicalDashboard
                patientId={id || ""}
                providerId="dr-smith"
              />
            </TabsContent>

            <TabsContent value="assessment">
              <EnhancedCCMAssessment
                patientId={id || ""}
                providerId="dr-smith"
              />
            </TabsContent>

            <TabsContent value="short">
              <CCMAssessment />
            </TabsContent>

            <TabsContent value="notes">
              <PcmNotes onNotesUpdate={fetchPatients} type="ccm" />
            </TabsContent>

            <TabsContent value="careplan">
              {showCarePlan && patient ? (
                <PCMCareplan
                  patient={{
                    id: Number(patient.patientId || patient.id),
                    name: `${patient.firstName} ${patient.lastName}`,
                    condition: patient.status || "General Care",
                    riskLevel: "medium",
                    careGoals: [],
                    medications:
                      patient.currentMedications?.map((med) => med.name) || [],
                  }}
                />
              ) : (
                <Card>
                  <CardContent className="text-center p-8">
                    <p className="text-muted-foreground mb-4">
                      No care plan generated yet. Click "Generate Care Plan"
                      from the overview tab to create one based on patient notes
                      and assessments.
                    </p>
                    <GetCarePlan patientId={patient.patientId} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* <TabsContent value="billing">
              <SuperbillGenerator patientId={id || ""} />
            </TabsContent> */}
          </Tabs>
        </CardContent>
      </Card>

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
