import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  PlusCircle,
  AlarmClock,
  Pill,
  Info,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMedicationApi } from "@/services/operations/settings";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface Medication {
  id: string;
  name: string;
  patient_name: string;
  dosage: string;
  frequency: string;
  status: string;
  refills: number;
  patient_id: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-health-green border-health-green text-black";
    case "expired":
      return "bg-health-red border-health-red text-black";
    case "completed":
      return "bg-secondary border-secondary text-secondary-foreground";
    case "in stock":
      return "bg-health-green border-health-green text-black";
    case "low stock":
      return "bg-health-blue border-health-blue text-black";
    case "critical stock":
      return "bg-health-red border-health-red text-black";
    default:
      return "bg-secondary border-secondary text-secondary-foreground";
  }
};

const Medications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("prescriptions");
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "error">(
    "idle"
  );
  const [lastSynced, setLastSynced] = useState<string | null>(
    new Date().toISOString()
  );
  const [selectedStatus, setSelectedStatus] = useState("all"); // New state for status filter

  const { token } = useSelector((state: RootState) => state.auth);

  const [medication, setMedication] = useState<Medication[] | null>(null); // Explicitly type medication state
  const fetchMedication = async () => {
    try {
      const response = await getMedicationApi(token);
      setMedication(response.data);
      console.log(response, "medicaton");
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch medication data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMedication();
  }, []);

  // Modified filteredPrescriptions to include status filter
  const filteredPrescriptions = medication?.filter(
    (med) =>
      (med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === "all" ||
        med.status.toLowerCase() === selectedStatus.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-muted-foreground">
            Manage prescriptions and medication inventory
          </p>
        </div>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row items-center gap-4 my-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medications..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select
              value={selectedStatus} // Bind the Select to the new state
              onValueChange={setSelectedStatus} // Update the state on change
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="prescriptions" className="mt-0">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Patient Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Refills</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions && filteredPrescriptions.length > 0 ? (
                    filteredPrescriptions.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{med?.patient_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {med?.name}
                        </TableCell>
                        <TableCell>{med?.dosage}</TableCell>
                        <TableCell>{med?.frequency}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(med?.status)}>
                            {med?.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{med?.refills}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Link
                                  to={`/provider/patients/${med?.patient_id}`}
                                  className="flex items-center"
                                >
                                  <Info className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>{" "}
                              </DropdownMenuItem>
                              {/* You can uncomment and use these if needed */}
                              {/* <DropdownMenuItem>
                                <Pill className="mr-2 h-4 w-4" /> Renew
                                Prescription
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <AlarmClock className="mr-2 h-4 w-4" /> Set
                                Reminder
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-health-red-dark">
                                Discontinue Medication
                              </DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No prescriptions found. Try adjusting your search or
                        filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Medications;
