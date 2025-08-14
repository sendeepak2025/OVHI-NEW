import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  getAllEncounterApi,
  deleteEncounterApi,
} from "@/services/operations/encounter";
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
import { Edit, Trash2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import CreateEncounter from "./CreateEncountert";
import EditEncounter from "./EditEncounter";

// Interface for Encounter data
interface EncounterData {
  _id: string;
  patient_id: any;
  provider_id: string;
  template_id: string;
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

const EncounterTable = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [encounters, setEncounters] = useState<EncounterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<EncounterData | null>(
    null
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch encounters
  const fetchEncounters = async () => {
    setIsLoading(true);
    try {
      const response = await getAllEncounterApi(token);
      console.log(response, "en");
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

  const handleDelete = async (id: number) => {
    console.log(id, "eid");
    await deleteEncounterApi(id, token);
    fetchEncounters();
  };

  useEffect(() => {
    if (token) {
      fetchEncounters();
    }
  }, [token]);

  // Get status badge variant
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

  // Handle edit
  const handleEdit = (encounter: EncounterData) => {
    setSelectedEncounter(encounter);
    setIsEditOpen(true);
  };

  // Handle successful operations (for real-time updates)
  const handleOperationSuccess = () => {
    fetchEncounters(); // Refresh the table
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

  return (
    <div className="w-full p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              Encounter Management
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={fetchEncounters}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <CreateEncounter onSuccess={handleOperationSuccess} />
            </div>
          </div>
        </CardHeader>
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
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(encounter)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              handleDelete(encounter?.encounter_id)
                            }
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
       {selectedEncounter && (
        <EditEncounter
          encounter={selectedEncounter}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={handleOperationSuccess}
        />
      )}
    </div>
  );
};

export default EncounterTable;
