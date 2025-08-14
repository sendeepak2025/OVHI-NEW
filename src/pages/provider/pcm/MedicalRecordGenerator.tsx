
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Clock, 
  Activity, 
  Stethoscope, 
  Heart,
  Brain,
  Calendar,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ccmService } from '@/services/ccmService';
import { getSinglePatientAPI } from '@/services/operations/patient';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

interface MedicalRecordGeneratorProps {
  patientId: string;
}

interface ComprehensiveRecord {
  patient: any;
  timeEntries: any[];
  assessments: any[];
  notes: any[];
  careGoals: any[];
  superbills: any[];
  totalMinutes: number;
  cptCodes: string[];
  proofOfService: any;
}

const MedicalRecordGenerator: React.FC<MedicalRecordGeneratorProps> = ({ patientId }) => {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [comprehensiveRecord, setComprehensiveRecord] = useState<ComprehensiveRecord | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await getSinglePatientAPI(patientId, token);
      if (res) {
        setPatient(res);
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      toast.error("Failed to fetch patient data");
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveRecord = async () => {
    if (!patient) return;

    setLoading(true);
    try {
      // Fetch all data for the selected month
      const timeEntries = ccmService.getTimeEntries(patientId, selectedMonth);
      const assessments = ccmService.getAssessments(patientId);
      const superbills = ccmService.getSuperbills(patientId);
      
      // Calculate totals
      const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const cptCodes = [...new Set(timeEntries.map(entry => ccmService.determineCPTCode(entry.duration)))];

      // Generate proof of service
      const proofOfService = {
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientId: patient.id,
        serviceMonth: selectedMonth,
        totalTimeMinutes: totalMinutes,
        qualifyingConditions: patient.diagnosis || [],
        serviceActivities: timeEntries.map(entry => ({
          date: entry.startTime,
          activity: entry.activityType,
          duration: entry.duration,
          provider: entry.providerId,
          notes: entry.notes,
          cptCode: ccmService.determineCPTCode(entry.duration)
        })),
        billableServices: cptCodes.map(code => ({
          cptCode: code,
          description: getCPTDescription(code),
          occurrences: timeEntries.filter(entry => 
            ccmService.determineCPTCode(entry.duration) === code
          ).length
        })),
        complianceMetrics: {
          minimumTimeMet: totalMinutes >= 20,
          qualifyingConditions: patient.diagnosis?.length >= 2,
          consentObtained: true,
          careManagementProvided: timeEntries.some(entry => 
            ['care_coordination', 'medication_management', 'education'].includes(entry.activityType)
          )
        }
      };

      const record: ComprehensiveRecord = {
        patient,
        timeEntries,
        assessments,
        notes: patient.notes || [],
        careGoals: patient.careGoals || [],
        superbills,
        totalMinutes,
        cptCodes,
        proofOfService
      };

      setComprehensiveRecord(record);
      toast.success("Comprehensive medical record generated successfully");
    } catch (error) {
      console.error("Error generating record:", error);
      toast.error("Failed to generate medical record");
    } finally {
      setLoading(false);
    }
  };

  const getCPTDescription = (code: string): string => {
    const descriptions: Record<string, string> = {
      '99490': 'CCM services, first 20 minutes',
      '99491': 'CCM services, each additional 20 minutes',
      '99487': 'Complex CCM services, first 60 minutes',
      '99489': 'Complex CCM services, each additional 30 minutes',
      '99453': 'Remote patient monitoring setup',
      '99454': 'Remote patient monitoring device supply',
      '99458': 'Remote physiologic monitoring treatment, first 20 minutes',
      '99459': 'Remote physiologic monitoring treatment, additional 20 minutes'
    };
    return descriptions[code] || 'CCM Service';
  };

  const exportToJSON = () => {
    if (!comprehensiveRecord) return;
    
    const dataStr = JSON.stringify(comprehensiveRecord, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `Medical_Record_${patient?.firstName}_${selectedMonth}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Medical record exported successfully");
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!patient) return <div>Loading patient data...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Comprehensive Medical Record Generator
          </CardTitle>
          <CardDescription>
            Generate complete medical records for billing and proof of service documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Service Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="ml-2 p-2 border rounded"
              />
            </div>
            <Button 
              onClick={generateComprehensiveRecord}
              disabled={loading}
              className="ml-auto"
            >
              <Activity className="h-4 w-4 mr-2" />
              Generate Record
            </Button>
          </div>

          {comprehensiveRecord && (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="time">Time Tracking</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="proof">Proof of Service</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Time</p>
                          <p className="text-2xl font-bold">{formatDuration(comprehensiveRecord.totalMinutes)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Activities</p>
                          <p className="text-2xl font-bold">{comprehensiveRecord.timeEntries.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">CPT Codes</p>
                          <p className="text-2xl font-bold">{comprehensiveRecord.cptCodes.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Patient Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Name:</p>
                        <p>{patient.firstName} {patient.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Patient ID:</p>
                        <p>{patient.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Primary Conditions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.diagnosis?.map((d: any, i: number) => (
                            <Badge key={i} variant="outline">
                              {d.diagnosis} ({d.icd10})
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Service Period:</p>
                        <p>{new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="time">
                <Card>
                  <CardHeader>
                    <CardTitle>Time Entry Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {comprehensiveRecord.timeEntries.map((entry, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{entry.activityType.replace('_', ' ').toUpperCase()}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(entry.startTime).toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {formatDuration(entry.duration)}
                              </Badge>
                            </div>
                            {entry.notes && (
                              <p className="text-sm mt-2">{entry.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Activities Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comprehensiveRecord.proofOfService.serviceActivities.map((activity, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">
                                {new Date(activity.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{activity.cptCode}</Badge>
                              <Badge variant="outline">{formatDuration(activity.duration)}</Badge>
                            </div>
                          </div>
                          <p className="text-sm font-medium">{activity.activity.replace('_', ' ').toUpperCase()}</p>
                          {activity.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billable Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comprehensiveRecord.proofOfService.billableServices.map((service, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">CPT {service.cptCode}</p>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                            <Badge variant="outline">
                              {service.occurrences} occurrence{service.occurrences !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="proof">
                <Card>
                  <CardHeader>
                    <CardTitle>Proof of Service Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Compliance Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(comprehensiveRecord.proofOfService.complianceMetrics).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <CheckCircle className={`h-4 w-4 ${value ? 'text-green-500' : 'text-red-500'}`} />
                              <span className="text-sm">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-3">Service Documentation</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm">
                            <strong>Patient:</strong> {comprehensiveRecord.proofOfService.patientName}<br />
                            <strong>Service Period:</strong> {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}<br />
                            <strong>Total Qualifying Time:</strong> {formatDuration(comprehensiveRecord.totalMinutes)}<br />
                            <strong>Qualifying Conditions:</strong> {comprehensiveRecord.proofOfService.qualifyingConditions.length}<br />
                            <strong>Service Activities:</strong> {comprehensiveRecord.proofOfService.serviceActivities.length}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={exportToJSON} className="gap-2">
                          <Download className="h-4 w-4" />
                          Export Complete Record
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalRecordGenerator;
