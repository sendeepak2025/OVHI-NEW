import React, { useEffect, useState } from 'react'
import {
  getEncounterApi,deleteEncounterApi
} from "@/services/operations/encounter";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { SmartEncounterWorkflow } from '@/components/encounter/SmartEncounterWorkflow';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Plus } from "lucide-react";
import EditEncounter from './EditEncounter';
import { EncounterActionsPanel } from '@/components/encounters/EncounterActionsPanel';
import { EncounterFaxDialog } from '@/components/encounters/EncounterFaxDialog';
import { EncounterReferralDialog } from '@/components/encounters/EncounterReferralDialog';
import { Patient, MedicalRecord } from '@/types/dataTypes';
import { getSinglePatientAPI } from '@/services/operations/patient';
import { getDocApi } from '@/services/operations/documents';


interface PatientEncounterData {
  _id: string;
  patient_id: any;
  provider_id: string;
  template_id: string;
  provider: any;
  templateId?: {
    template_id: number;
    template_name: string;
  };
  encounter_id: any;
  encounter_type: string;
  reason_for_visit: string;
  notes: string;
  procedure_codes: string;
  diagnosis_codes: string;
  follow_up_plan: string;
  status: "pending" | "completed" | "cancelled";
  created: string;
  updated: string;
  updatedAt: string;
}
const PatientEncounter = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [encounters, setEncounters] = useState<PatientEncounterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<PatientEncounterData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Enhanced dialog states
  const [isFaxDialogOpen, setIsFaxDialogOpen] = useState(false);
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);
  const [selectedEncounterForAction, setSelectedEncounterForAction] = useState<PatientEncounterData | null>(null);
  const [isSmartWorkflowOpen, setIsSmartWorkflowOpen] = useState(false);
  
  const { id } = useParams();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const fetchPatient = async () => {
    if (!id) return;
    setPatientLoading(true);
    setPatientError(null);
    try {
      const res = await getSinglePatientAPI(id, token);
      if (res) {
        const mapped: Patient = {
          patientId: res.patientId || id,
          firstName: res.firstName || res.firstname || '',
          lastName: res.lastName || res.lastname || '',
          birthDate: res.birthDate || res.dob || '',
          email: res.email || '',
          phone: res.phone || res.phoneNumber || ''
        };
        setPatient(mapped);
      } else {
        setPatientError('Failed to fetch patient');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      setPatientError('Failed to fetch patient');
    } finally {
      setPatientLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    if (!id) return;
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const res = await getDocApi(id, token);
      if (res?.types) {
        const records: MedicalRecord[] = res.types.map((doc: any) => ({
          id: String(doc.id),
          patientId: String(doc.patient_id),
          date: doc.created,
          type: doc.description || 'Document',
          provider: doc.provider || '',
          description: doc.description || '',
          details: {},
          file: doc.aws_url || '',
          attachmentUrl: doc.aws_url || ''
        }));
        setMedicalRecords(records);
      } else {
        setRecordsError('Failed to fetch medical records');
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setRecordsError('Failed to fetch medical records');
    } finally {
      setRecordsLoading(false);
    }
  };
  const fetchEncounters = async () => {
    setIsLoading(true);
    try {
      const response = await getEncounterApi(token, id);
      console.log(response);
      if (response?.success) {
        setEncounters(response.data || []);
      } else {
        toast.error("Failed to fetch encounters");
      }
    } catch (error) {
      console.error("Error fetching encounters:", error);
      toast.error("Failed to fetch encounters");
    } finally {
      setIsLoading(false);
    }
  };

   const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };
  
  const handleDelete = async (encounterId: string) => {
    console.log(encounterId, "eid");
    await deleteEncounterApi(Number(encounterId), token);
    fetchEncounters();
  };

   // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = (encounter: PatientEncounterData) => {
    setSelectedEncounter(encounter);
    setIsEditOpen(true);
  };

  // Enhanced action handlers
  const handleFax = (encounter: PatientEncounterData) => {
    setSelectedEncounterForAction(encounter);
    setIsFaxDialogOpen(true);
  };

  const handleCreateReferral = (encounter: PatientEncounterData) => {
    setSelectedEncounterForAction(encounter);
    setIsReferralDialogOpen(true);
  };

  const handleGenerateSuperbill = (encounter: PatientEncounterData) => {
    // Simulate superbill generation
    toast.success(`Superbill generated for encounter ${encounter.encounter_type}`);
  };

  const handlePrint = (encounter: PatientEncounterData) => {
    // Simulate print/export functionality
    toast.success(`Encounter exported: ${encounter.encounter_type}`);
  };

  const handleClone = (encounter: PatientEncounterData) => {
    // Simulate encounter cloning
    toast.success(`Encounter cloned: ${encounter.encounter_type}`);
  };

  // Handle successful operations (for real-time updates)
  const handleOperationSuccess = () => {
    fetchEncounters(); // Refresh the table
  };

  const handleEncounterComplete = (encounterData: any) => {
    console.log("New encounter completed:", encounterData);
    setIsSmartWorkflowOpen(false);
    fetchEncounters(); // Refresh the table
  };

   useEffect(() => {
      if (id) {
        fetchEncounters();
        fetchPatient();
        fetchMedicalRecords();
      }
    }, [id, token]);

  return (
    <div>
      {(patientLoading || recordsLoading) && (
        <div className="flex items-center mb-4 text-sm text-gray-600">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Loading patient information...
        </div>
      )}
      {(patientError || recordsError) && (
        <div className="mb-4 text-sm text-red-500">
          {patientError || recordsError}
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Patient Encounters</h2>
        <Button
          onClick={() => setIsSmartWorkflowOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start New Encounter
        </Button>
      </div>
      
      <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading encounters...
            </div>
          ) : encounters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No encounters found. Create your first encounter to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Encounter Type</TableHead>
                    <TableHead>Reason for Visit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Diagnosis Codes</TableHead>
                    <TableHead>Procedure Codes</TableHead>
                    <TableHead>follow Up plan</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {encounters.map((encounter) => (
                    <TableRow key={encounter._id}>
                      <TableCell className="font-medium">
                        {encounter?.patient_id}
                      </TableCell>
                      <TableCell>{encounter?.encounter_type}</TableCell>

                      <TableCell className="max-w-xs truncate">
                        {encounter.reason_for_visit}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(encounter.status)}>
                          {encounter.status.charAt(0).toUpperCase() +
                            encounter.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {encounter?.diagnosis_codes || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {encounter.procedure_codes || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {encounter.follow_up_plan || "N/A"}
                      </TableCell>
                      <TableCell>{formatDate(encounter.created)}</TableCell>
                      <TableCell>
                        <EncounterActionsPanel
                          encounter={encounter}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onFax={handleFax}
                          onCreateReferral={handleCreateReferral}
                          onGenerateSuperbill={handleGenerateSuperbill}
                          onPrint={handlePrint}
                          onClone={handleClone}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Edit Dialog */}
         {selectedEncounter && (
        <EditEncounter
          encounter={selectedEncounter}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={handleOperationSuccess}
        />
      )}
        {/* Fax Dialog */}
        {patient && (
          <EncounterFaxDialog
            encounter={selectedEncounterForAction}
            patient={patient}
            open={isFaxDialogOpen}
            onOpenChange={setIsFaxDialogOpen}
          />
        )}

        {/* Referral Dialog */}
        {patient && (
          <EncounterReferralDialog
            encounter={selectedEncounterForAction}
            patient={patient}
            medicalRecords={medicalRecords}
            open={isReferralDialogOpen}
            onOpenChange={setIsReferralDialogOpen}
          />
        )}

        {/* Smart Encounter Workflow */}
        <SmartEncounterWorkflow
          isOpen={isSmartWorkflowOpen}
          onClose={() => setIsSmartWorkflowOpen(false)}
          onEncounterComplete={handleEncounterComplete}
        />
    </div>
  )
}

export default PatientEncounter
