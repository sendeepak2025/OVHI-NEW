"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { FileText, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getAllPatientsBillingAPI,
  updateBillingStatusAPI,
} from "@/services/operations/patient";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import Loader from "@/components/Loader";
import CMS1500Form from "@/components/billing/CMS1500Form";

// Define the structure of the incoming API data
interface CptData {
  cpt_code_id: number;
  code: string;
  code_units: number;
  created: string;
  price: string;
}

interface PatientBillingData {
  billing_ids: string; // Changed to string based on "1, 2, 3" in example
  patient_id: number;
  phone: string;
  dob: string;
  date_of_service: string; // "2025-07-31 23:59:59"
  cpt_codes: string;
  cpt_code_ids: string;
  code_units: string;
  enrolled_date: string | null;
  patient_name: string;
  provider_name: string;
  billing_status: number; // 0, 1, 2, 3
  fk_physician_id: string;
  total_minutes: number;
  cpt_data: CptData[]; // Added
  totalPrice: number; // Added
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: PatientBillingData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Status mapping as per user request
const BILLING_STATUS_MAP: { [key: number]: string } = {
  0: "Draft", // Assuming 0 is an initial/draft state
  1: "Hold",
  2: "Approved",
  3: "Not Approved",
};

const getStatusText = (status: number) =>
  BILLING_STATUS_MAP[status] || "Unknown";

const getStatusColor = (status: number) => {
  switch (status) {
    case 1: // Hold
      return "bg-yellow-100 text-yellow-800 border-yellow-500";
    case 2: // Approved
      return "bg-green-100 text-green-800 border-green-500";
    case 3: // Not Approved
      return "bg-red-100 text-red-800 border-red-500";
    case 0: // Draft/Initial
    default:
      return "bg-gray-100 text-gray-800 border-gray-500";
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [billingRecords, setBillingRecords] = useState<PatientBillingData[]>(
    []
  );
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] =
    useState(false);
  const [selectedBillForStatusChange, setSelectedBillForStatusChange] =
    useState<PatientBillingData | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<string>(""); // To hold the selected new status (1, 2, 3)

  // State for View Details Dialog
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedBillDetails, setSelectedBillDetails] =
    useState<PatientBillingData | null>(null);

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Assuming a fixed limit for now, can be made dynamic
  const [cms, setCms] = useState(false);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const fetchBilling = async (
    page: number,
    query: string,
    statusFilter: number | null
  ) => {
    if (!token) {
      console.warn("No token available for fetching billing data.");
      return;
    }
    setLoading(true);
    try {
      // Modify getAllPatientsBillingAPI to accept statusFilter if needed, or filter client-side
      const res: ApiResponse = await getAllPatientsBillingAPI(
        page,
        token,
        query
      );
      console.log("API Response:", res);
      if (res.success && Array.isArray(res.data)) {
        let filteredData = res.data;
        if (statusFilter !== null) {
          filteredData = res.data.filter(
            (record) => record.billing_status === statusFilter
          );
        }
        setBillingRecords(filteredData);
        setTotalPages(res.pagination.totalPages);
        setCurrentPage(res.pagination.page);
      } else {
        toast.error("Failed to fetch billing data.");
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("An error occurred while fetching billing data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const statusMap: { [key: string]: number | null } = {
      all: null,
      draft: 0,
      hold: 1,
      approved: 2,
      "not approved": 3,
    };
    const statusFilter = statusMap[selectedTab];
    fetchBilling(currentPage, searchTerm, statusFilter);
  }, [token, currentPage, searchTerm, selectedTab]); // Depend on token, currentPage, searchTerm, and selectedTab

  const handleStatusBadgeClick = (bill: PatientBillingData) => {
    setSelectedBillForStatusChange(bill);
    setNewStatusValue(String(bill.billing_status)); // Set initial value to current status
    setIsStatusChangeDialogOpen(true);
  };

  const handleSaveStatusChange = async () => {
    if (selectedBillForStatusChange && newStatusValue !== "") {
      const updatedStatus = Number.parseInt(newStatusValue);
      try {
        await updateBillingStatusAPI(
          selectedBillForStatusChange.billing_ids,
          updatedStatus,
          token
        );
        setBillingRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.billing_ids === selectedBillForStatusChange.billing_ids
              ? { ...record, billing_status: updatedStatus }
              : record
          )
        );
        toast.success(
          `Status for Bill #${
            selectedBillForStatusChange.billing_ids
          } updated to ${getStatusText(updatedStatus)}`
        );
        setIsStatusChangeDialogOpen(false);
        setSelectedBillForStatusChange(null);
        setNewStatusValue("");
      } catch (error) {
        console.error("Error updating billing status:", error);
        toast.error("Failed to update billing status.");
      }
    }
  };

  const handleViewDetailsClick = (bill: PatientBillingData) => {
    setSelectedBillDetails(bill);
    setIsViewDetailsDialogOpen(true);
  };

  // New function to handle "View Details" click from the status change dialog
  const handleViewDetailsFromStatusChange = () => {
    if (selectedBillForStatusChange) {
      // setIsStatusChangeDialogOpen(false); // Close status change dialog
      setSelectedBillDetails(selectedBillForStatusChange); // Set details for the view dialog
      setIsViewDetailsDialogOpen(true); // Open view details dialog
    }
  };

  const handleBillingCcmForm = (bill: PatientBillingData) => {
    setSelectedBillDetails(bill);
    setCms(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Billing Management
          </h1>
          <p className="text-muted-foreground">
            Manage patient billing records and their statuses.
          </p>
        </div>
      </div>
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[600px] grid-cols-5">
          <TabsTrigger value="all">All Bills</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="hold">Hold</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="not approved">Not Approved</TabsTrigger>
        </TabsList>
        <div className="flex flex-col md:flex-row items-center gap-4 my-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bills by patient name, ID, or CPT codes..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Billing Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Date of Service</TableHead>
                  <TableHead>CPT Codes</TableHead>
                  <TableHead>Total Minutes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  <TableHead className="text-right"></TableHead>{" "}
                  {/* Empty header for CMS button */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="h-[120px] flex justify-center items-center">
                        <Loader />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : billingRecords.length > 0 ? (
                  billingRecords.map((bill) => (
                    <TableRow key={bill.billing_ids}>
                      <TableCell>{bill.patient_name}</TableCell>
                      <TableCell>{bill.provider_name}</TableCell>
                      <TableCell>{formatDate(bill.date_of_service)}</TableCell>
                      <TableCell>{bill.cpt_codes}</TableCell>
                      <TableCell>{bill.total_minutes}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Badge
                          className={`${getStatusColor(bill.billing_status)} `}
                          // onClick={() => handleStatusBadgeClick(bill)} // Keep this if badge itself should trigger the dialog
                        >
                          {getStatusText(bill.billing_status) || "Normal"}
                        </Badge>
                        <Button
                          onClick={() => handleStatusBadgeClick(bill)}
                          className="text-xs w-full px-2 h-auto min-h-[1.5rem] rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          Update Status
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetailsClick(bill)}
                          >
                            <FileText className="h-4 w-4 mr-1" /> View Details
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBillingCcmForm(bill)}
                          >
                            CMS
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No billing records found. Try adjusting your search or
                      filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </Tabs>
      {/* Status Change Dialog */}
      <Dialog
        open={isStatusChangeDialogOpen}
        onOpenChange={setIsStatusChangeDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Billing Status</DialogTitle>
            <DialogDescription>
              Update the status for Bill #
              {selectedBillForStatusChange?.billing_ids}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={newStatusValue} onValueChange={setNewStatusValue}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BILLING_STATUS_MAP).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusChangeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleViewDetailsFromStatusChange} // New button to view details
            >
              View Details
            </Button>
            <Button onClick={handleSaveStatusChange}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* View Details Dialog */}
      <Dialog
        open={isViewDetailsDialogOpen}
        onOpenChange={setIsViewDetailsDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Billing Details for {selectedBillDetails?.patient_name}
            </DialogTitle>
            <DialogDescription>
              Comprehensive information for Bill #
              {selectedBillDetails?.billing_ids}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-medium">Patient Name:</p>
                <p>{selectedBillDetails?.patient_name}</p>
              </div>
              <div>
                <p className="font-medium">Patient ID:</p>
                <p>{selectedBillDetails?.patient_id}</p>
              </div>
              <div>
                <p className="font-medium">Provider Name:</p>
                <p>{selectedBillDetails?.provider_name}</p>
              </div>
              <div>
                <p className="font-medium">Phone:</p>
                <p>{selectedBillDetails?.phone}</p>
              </div>
              <div>
                <p className="font-medium">Date of Birth:</p>
                <p>{formatDate(selectedBillDetails?.dob || "")}</p>
              </div>
              <div>
                <p className="font-medium">Date of Service:</p>
                <p>{formatDate(selectedBillDetails?.date_of_service || "")}</p>
              </div>
              <div>
                <p className="font-medium">Enrolled Date:</p>
                <p>{formatDate(selectedBillDetails?.enrolled_date || "")}</p>
              </div>
              <div>
                <p className="font-medium">Total Minutes:</p>
                <p>{selectedBillDetails?.total_minutes}</p>
              </div>
              <div>
                <p className="font-medium">Billing Status:</p>
                <Badge
                  className={getStatusColor(
                    selectedBillDetails?.billing_status || 0
                  )}
                >
                  {getStatusText(selectedBillDetails?.billing_status || 0)}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Total Price:</p>
                <p>${selectedBillDetails?.totalPrice?.toFixed(2)}</p>
              </div>
            </div>
            <h3 className="font-semibold mt-4 mb-2">CPT Codes Details:</h3>
            {selectedBillDetails?.cpt_data &&
            selectedBillDetails.cpt_data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBillDetails.cpt_data.map((cpt, index) => (
                    <TableRow key={index}>
                      <TableCell>{cpt.code}</TableCell>
                      <TableCell>{cpt.code_units}</TableCell>
                      <TableCell>
                        ${Number.parseFloat(cpt.price).toFixed(2)}
                      </TableCell>
                      <TableCell>{formatDate(cpt.created)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">
                No CPT data available for this bill.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CMS1500Form
        open={cms}
        onOpenChange={setCms}
        selectedBillDetails={selectedBillDetails}
      />
    </div>
  );
};

export default Billing;
