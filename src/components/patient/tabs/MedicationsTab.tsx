import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Download,
  RefreshCw,
  Check,
  AlertTriangle,
  Edit,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Medication } from "@/data/medicalData";
import { formatDate, getStatusColor } from "@/utils/formatHelpers";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MedicationsTabProps {
  medications: Medication[];
  onEdit?: () => void;
}

interface EhrMedication extends Medication {
  ehrSource: string;
  syncStatus: "synced" | "not synced" | "conflict";
}

// Mock EHR medications from
const mockEhrMedications: EhrMedication[] = [
  {
    id: "1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    startDate: "2025-01-15",
    endDate: null,
    status: "Active",
    prescribedBy: "Dr. Sarah Johnson",
    ehrSource: "",
    syncStatus: "synced",
  },
  {
    id: "4",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily, at bedtime",
    startDate: "2025-01-20",
    endDate: null,
    status: "Active",
    prescribedBy: "Dr. Michael Wilson",
    ehrSource: "",
    syncStatus: "not synced",
  },
  {
    id: "2",
    name: "Metformin",
    dosage: "850mg", // Different dosage than in our system
    frequency: "Twice daily",
    startDate: "2024-11-10",
    endDate: null,
    status: "Active",
    prescribedBy: "Dr. Sarah Johnson",
    ehrSource: "",
    syncStatus: "conflict",
  },
];

const MedicationsTab: React.FC<MedicationsTabProps> = ({
  medications,
  onEdit,
}) => {
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconciliationComplete, setReconciliationComplete] = useState(false);

  const handleReconcile = () => {
    setIsReconciling(true);
    // Simulate reconciliation process
    setTimeout(() => {
      setIsReconciling(false);
      setReconciliationComplete(true);
      toast({
        title: "Medication Reconciliation Complete",
        description: "Medications have been reconciled with  EHR",
      });
    }, 2000);
  };

  const handleExportToPronoCIS = () => {
    toast({
      title: "Exporting to ",
      description: "Medication data is being exported to  EHR",
    });

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Medication data has been successfully exported to  EHR",
      });
    }, 2000);
  };

  return (
    <div className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Current Medications</CardTitle>
            <CardDescription>
              All active and recently discontinued medications
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reconcile with EHR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Medication Reconciliation</DialogTitle>
                  <DialogDescription>
                    Compare medications with EHR and resolve any conflicts
                  </DialogDescription>
                </DialogHeader>

                {reconciliationComplete ? (
                  <Alert className="bg-green-50 border-green-500">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertTitle>Reconciliation Complete</AlertTitle>
                    <AlertDescription>
                      All medications have been successfully reconciled with EHR
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="py-4">
                      <h3 className="font-medium mb-2">
                        Medications found in{" "}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockEhrMedications.map((med) => (
                            <TableRow
                              key={med.id}
                              className={
                                med.syncStatus === "conflict"
                                  ? "bg-amber-50"
                                  : ""
                              }
                            >
                              <TableCell className="font-medium">
                                {med.name}
                              </TableCell>
                              <TableCell>{med.dosage}</TableCell>
                              <TableCell>
                                {med.syncStatus === "conflict" ? (
                                  <Badge className="bg-amber-500 text-white">
                                    Conflict
                                  </Badge>
                                ) : med.syncStatus === "not synced" ? (
                                  <Badge className="bg-blue-500 text-white">
                                    New
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-500 text-white">
                                    Synced
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {med.syncStatus === "conflict" ? (
                                  <Button variant="outline" size="sm">
                                    Resolve
                                  </Button>
                                ) : med.syncStatus === "not synced" ? (
                                  <Button variant="outline" size="sm">
                                    Import
                                  </Button>
                                ) : (
                                  <span className="text-gray-500 text-sm">
                                    No action needed
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {mockEhrMedications.some(
                      (med) => med.syncStatus === "conflict"
                    ) && (
                      <Alert className="bg-amber-50 border-amber-500 mb-4">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertTitle>Conflicts Detected</AlertTitle>
                        <AlertDescription>
                          Some medications have conflicts between this system
                          and EHR
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                <DialogFooter>
                  {!reconciliationComplete ? (
                    <Button onClick={handleReconcile} disabled={isReconciling}>
                      {isReconciling ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Reconciling...
                        </>
                      ) : (
                        "Complete Reconciliation"
                      )}
                    </Button>
                  ) : (
                    <Button onClick={() => setReconciliationComplete(false)}>
                      Close
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prescribed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((med) => (
                <TableRow key={med.id}>
                  <TableCell className="font-medium">{med.name}</TableCell>
                  <TableCell>{med.dosage}</TableCell>
                  <TableCell>{med.frequency}</TableCell>
                  <TableCell>{formatDate(med.startDate)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(med.status)}>
                      {med.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{med.prescribedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportToPronoCIS}>
              <RefreshCw className="h-4 w-4 mr-2" /> Export to
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" /> Download Medication List
            </Button>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-1" /> Add Medication
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MedicationsTab;
