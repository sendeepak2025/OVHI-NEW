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
import { MedicalRecordsSelectorDialog } from '@/components/encounters/MedicalRecordsSelectorDialog';
import { Patient, MedicalRecord } from '@/types/dataTypes';


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
  
  const {id} = useParams();

  // Mock patient and medical records data - replace with actual API calls
  const mockPatient: Patient = {
    patientId: id || '',
    firstName: 'John',
    lastName: 'Doe',
    birthDate: '1980-01-01',
    email: 'john.doe@email.com',
    phone: '555-123-4567'
  };

  const mockMedicalRecords: MedicalRecord[] = [
    {
      id: '1',
      patientId: id || '',
      date: '2024-01-15',
      type: 'Lab Results',
      provider: 'Dr. Smith',
      description: 'Complete Blood Count - Normal results',
      details: {},
      file: ''
    },
    {
      id: '2',
      patientId: id || '',
      date: '2024-01-10',
      type: 'Visit Notes',
      provider: 'Dr. Johnson',
      description: 'Annual physical examination',
      details: {},
      file: ''
    }
  ];
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
      }
    }, [token]);

  return (
    <div>
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
        <EncounterFaxDialog
          encounter={selectedEncounterForAction}
          patient={mockPatient}
          open={isFaxDialogOpen}
          onOpenChange={setIsFaxDialogOpen}
        />

        {/* Referral Dialog */}
        <EncounterReferralDialog
          encounter={selectedEncounterForAction}
          patient={mockPatient}
          medicalRecords={mockMedicalRecords}
          open={isReferralDialogOpen}
          onOpenChange={setIsReferralDialogOpen}
        />

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
