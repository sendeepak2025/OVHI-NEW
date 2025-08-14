import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Eye, Edit, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { formatDate, getStatusColor } from "@/utils/formatHelpers";
import AddPatientDialog from "@/components/patient/AddPatientDialog";
import EditPatientDialog from "@/components/patient/EditPatientDialog";
import { getAllPatientsAPI } from "@/services/operations/patient";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Patient } from "@/types/dataTypes";
import Loader from "@/components/Loader";

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const { addPatient, updatePatient } = useData();
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state: RootState) => state.auth);

  const fetchPatients = async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const res = await getAllPatientsAPI(page, token, searchQuery);
      // console.log(res, "all");

      if (res?.data) {
        setPatients(res.data);
      }

      if (res?.pagination) {
        setPagination(res.pagination);
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

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients(1, search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPatients(newPage, search);
    }
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();

    if (birth > today) return 0; // or throw an error if preferred

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

  const getStatusLabel = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "normal":
        return "Normal";
      case "abnormal":
        return "Abnormal";
      case "critical":
        return "Critical";
      default:
        return status || "Unknown";
    }
  };

  const handleAddPatient = (newPatient: any) => {
    addPatient(newPatient);
    fetchPatients(pagination.page, search); // Refresh the list
  };

  const handleEditPatient = (updatedPatient: any) => {
    updatePatient(updatedPatient);
    setEditingPatient(null);
    fetchPatients(pagination.page, search); // Refresh the list
  };

  const renderPaginationInfo = () => {
    const startItem = (pagination.page - 1) * pagination.limit + 1;
    const endItem = Math.min(
      pagination.page * pagination.limit,
      pagination.total
    );

    return (
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {pagination.total} patients
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <Button onClick={() => setAddDialogOpen(true)}>Add Patient</Button>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="search">Search:</Label>
        <Input
          type="search"
          id="search"
          placeholder="Search patients by name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
  <div>
    <CardTitle>All Patients</CardTitle>
    <CardDescription>Manage and view patient information</CardDescription>
  </div>
  <div className="mt-2 sm:mt-0 ml-2 text-sm font-semibold text-[#2563EB]">
    Total Patients: {patients?.length}
  </div>  
</CardHeader>
        <CardContent>
          {loading ? (
            <div className="min-h-[600px] flex items-center justify-center min-w-full">
              <Loader />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PatientID</TableHead>
                    <TableHead>Patient(DOB)</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {search
                            ? "No patients found matching your search."
                            : "No patients found."}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    patients.map((patient) => (
                      <TableRow key={patient.patientId}>
                        <TableCell>{patient.patientId}</TableCell>

                        {/* Patient Name + DOB */}
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-bold">
                                <a
                                  href={`/provider/patients/${patient.patientId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="uppercase text-[#1e3a8a] hover:text-[#2563eb] hover:underline transition-colors duration-200"
                                >
                                  {patient.firstname} {patient.middlename}{" "}
                                  {patient.lastname}
                                </a>
                              </p>
                              <p className="text-sm text-muted-foreground">
                               ({formatDate(patient.birthDate)})
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {calculateAge(patient.birthDate)} years
                        </TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(patient.status)}>
                            {getStatusLabel(patient.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(patient.lastVisit)}</TableCell>
                        <TableCell>{patient.enrollDate}</TableCell>
                        <TableCell>
                          {patient?.service_type
                            ?.map((type: number) => {
                              if (type === 1) return "RPM";
                              if (type === 2) return "CCM";
                              if (type === 3) return "PCM";
                              return "";
                            })
                            .join(", ")}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPatient(patient)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  {renderPaginationInfo()}

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNumber;
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNumber = i + 1;
                          } else if (
                            pagination.page >=
                            pagination.totalPages - 2
                          ) {
                            pageNumber = pagination.totalPages - 4 + i;
                          } else {
                            pageNumber = pagination.page - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNumber}
                              variant={
                                pagination.page === pageNumber
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AddPatientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddPatient={handleAddPatient}
      />

      {editingPatient !== null && (
        <EditPatientDialog
          open={editingPatient !== null}
          onOpenChange={() => setEditingPatient(null)}
          patient2={{
            ...editingPatient,
            patientId: String(editingPatient.patientId),
            bloodPressure: String(editingPatient.bloodPressure || ""),
            heartRate: String(editingPatient.heartRate || ""),
            temperature: String(editingPatient.temperature || ""),
            patientService: editingPatient.patientService || "CCM",
          }}
          onEditPatient={handleEditPatient}
        />
      )}
    </div>
  );
};

export default Patients;
