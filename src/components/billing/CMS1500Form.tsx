"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Check,
  FileText,
  Printer,
  Download,
  HeartPulse,
  Plus,
  Trash2,
  Save,
  Edit,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getCmsDetails, updateCmsApi } from "@/services/operations/cms";
import { toast } from "sonner";

// --- Updated CMS1500FormData Interface ---
interface Charge {
  charge: string;
  charge_record_type: string;
  diag_ref: string;
  place_of_service: string;
  proc_code: string;
  units: number;
  total: number;
}

interface CMS1500FormData {
  accept_assign: string;
  auto_accident: string;
  balance_due: string;
  bill_addr_1: string;
  bill_city: string;
  bill_name: string;
  bill_npi: string;
  bill_phone: string;
  bill_state: string;
  bill_taxid: string;
  bill_taxid_type: string;
  bill_zip: string;
  charge: any[];
  claim_form: string;
  diag_1: string;
  diag_2: string;
  diag_3: string;
  diag_4: string;
  clia_number: string;
  employment_related: string;
  ins_addr_1: string;
  ins_city: string;
  ins_dob: string;
  ins_name_f: string;
  ins_name_l: string;
  ins_number: string;
  ins_sex: string;
  ins_state: string;
  ins_zip: string;
  ins_group: string;
  pat_addr_1: string;
  pat_city: string;
  pat_dob: string;
  pat_name_f: string;
  pat_name_l: string;
  pat_rel: string;
  pat_sex: string;
  pat_state: string;
  pat_zip: string;
  payerid: string;
  pcn: string;
  payer_name: string;
  payer_order: string;
  payer_addr_1: string;
  payer_city: string;
  payer_state: string;
  payer_zip: string;
  prov_name_f: string;
  prov_name_l: string;
  prov_name_m: string;
  prov_npi: string;
  prov_taxonomy: string;
  ref_name_f: string;
  ref_name_l: string;
  ref_name_m: string;
  ref_npi: string;
  remote_fileid: string;
  remote_batchid: string;
  remote_claimid: string;
  total_charge: string;
}

// Dummy function for formatting currency
const formatCurrency = (amount: string | number): string => {
  const numAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numAmount);
};

// Dummy validation function
const validateCMS1500Form = (formData: CMS1500FormData | null): string[] => {
  const errors: string[] = [];
  if (!formData) {
    errors.push("Form data is not loaded.");
    return errors;
  }
  if (!formData.pat_name_f || !formData.pat_name_l)
    errors.push("Patient name is required.");
  if (!formData.ins_number) errors.push("Insured ID is required.");
  if (formData.charge.length === 0)
    errors.push("At least one service line is required.");
  if (isNaN(Number.parseFloat(formData.total_charge)))
    errors.push("Total charge must be a valid number.");
  if (isNaN(Number.parseFloat(formData.balance_due)))
    errors.push("Balance due must be a valid number.");
  return errors;
};

// Service Line Modal Component
interface ServiceLineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge: Charge | null;
  onSave: (charge: Charge) => void;
  mode: "add" | "edit";
}

const ServiceLineModal: React.FC<ServiceLineModalProps> = ({
  open,
  onOpenChange,
  charge,
  onSave,
  mode,
}) => {
  const [formData, setFormData] = useState<Charge>({
    charge: "0.00",
    charge_record_type: "UN",
    diag_ref: "",
    place_of_service: "",
    proc_code: "",
    units: 1,
    total: 0,
  });

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  useEffect(() => {
    if (charge && mode === "edit") {
      setFormData(charge);
    } else if (mode === "add") {
      setFormData({
        charge: "0.00",
        charge_record_type: "UN",
        diag_ref: "",
        place_of_service: "",
        proc_code: "",
        units: 1,
        total: 0,
      });
    }
  }, [charge, mode, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let updatedValue: string | number = value;

    // Convert to number if it's units or charge
    if (name === "units") {
      updatedValue = parseInt(value) || 0;
    } else if (name === "charge") {
      updatedValue = parseFloat(value) || 0;
    }

    // Compute new total
    const newUnits =
      name === "units"
        ? parseInt(value) || 0
        : parseInt(formData.units as any) || 0;
    const newCharge =
      name === "charge"
        ? parseFloat(value) || 0
        : parseFloat(formData.charge as any) || 0;
    const newTotal = newUnits * newCharge;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
      total: newTotal,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.proc_code.trim()) {
      toast.error("Procedure code is required");
      return;
    }
    if (Number.parseFloat(formData.charge) <= 0) {
      toast.error("Charge must be greater than 0");
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {mode === "add" ? "Add Service Line" : "Edit Service Line"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="proc_code" className="text-sm font-medium">
              Procedure Code *
            </Label>
            <Input
              id="proc_code"
              name="proc_code"
              value={formData.proc_code}
              onChange={handleInputChange}
              placeholder="e.g., 99213"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="units" className="text-sm font-medium">
              Units
            </Label>
            <Input
              id="units"
              name="units"
              type="number"
              min="1"
              value={formData.units}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="charge" className="text-sm font-medium">
              Charge Amount *
            </Label>
            <Input
              id="charge"
              name="charge"
              type="number"
              step="0.01"
              min="0"
              value={formData.charge}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="place_of_service" className="text-sm font-medium">
              Place of Service
            </Label>
            <Select
              value={formData.place_of_service}
              onValueChange={(value) =>
                handleSelectChange("place_of_service", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select place of service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="11">Office</SelectItem>
                <SelectItem value="12">Home</SelectItem>
                <SelectItem value="21">Inpatient Hospital</SelectItem>
                <SelectItem value="22">Outpatient Hospital</SelectItem>
                <SelectItem value="23">Emergency Room</SelectItem>
                <SelectItem value="31">Skilled Nursing Facility</SelectItem>
                <SelectItem value="32">Nursing Facility</SelectItem>
                <SelectItem value="99">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="diag_ref" className="text-sm font-medium">
              Diagnosis Reference
            </Label>
            <Select
              value={formData.diag_ref}
              onValueChange={(value) => handleSelectChange("diag_ref", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select diagnosis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Diagnosis A</SelectItem>
                <SelectItem value="B">Diagnosis B</SelectItem>
                <SelectItem value="C">Diagnosis C</SelectItem>
                <SelectItem value="D">Diagnosis D</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="diag_ref" className="text-sm font-medium">
              Diagnosis Reference
            </Label>
            <input
              type="text"
              id="diag_ref"
              name="diag_ref"
              value={formData.diag_ref}
              onChange={(e) => handleSelectChange("diag_ref", e.target.value)}
              placeholder="Enter diagnosis"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Total</Label>
            <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
              ${formData.total.toFixed(2)}
            </p>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="charge_record_type" className="text-sm font-medium">
              Record Type
            </Label>
            <Select
              value={formData.charge_record_type}
              onValueChange={(value) =>
                handleSelectChange("charge_record_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UN">Unit</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {mode === "add" ? "Add Service" : "Update Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CMS1500FormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedBillDetails?: any;
  onPrintForm?: () => void;
  onDownloadForm?: () => void;
}

const CMS1500Form: React.FC<CMS1500FormProps> = ({
  open = false,
  onOpenChange = () => {},
  selectedBillDetails,
}) => {
  console.log(selectedBillDetails, "data");
  const { token } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<CMS1500FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [fileid, setFileid] = useState("");

  const fetchCcmDetails = async () => {
    setLoading(true);
    const data = {
      patientId: selectedBillDetails?.patient_id,
      billing_ids: selectedBillDetails?.billing_ids,
    };
    try {
      const response = await getCmsDetails(token, data);
      if (response?.data?.claim && response.data.claim.length > 0) {
        setFormData(response.data.claim[0]);
        setFileid(response.data?.fileid);
        console.log(response.data.claim[0]);
      } else {
        setFormData(null);
      }
    } catch (error) {
      console.error("Error fetching CMS details:", error);
      setFormData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && selectedBillDetails) {
      fetchCcmDetails();
    }
  }, [open, selectedBillDetails]);

  // Calculate total charge from individual charges
  const calculateTotalCharge = (charges: Charge[]) => {
    return charges.reduce((acc, item) => {
      const charge = parseFloat(item.charge as string) || 0;
      const units = Number(item.units) || 1;
      return acc + charge * units;
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return null;
      const updated = { ...prev, [name]: value };

      // Auto-calculate total charge if balance_due changes
      if (name === "balance_due") {
        updated.total_charge = calculateTotalCharge(prev.charge).toString();
      }

      return updated;
    });
  };

  const handleCheckboxChange = (name: keyof CMS1500FormData) => {
    setFormData((prev) =>
      prev ? { ...prev, [name]: prev[name] === "Y" ? "N" : "Y" } : null
    );
  };

  // Open modal for adding new charge
  const handleAddCharge = () => {
    setModalMode("add");
    setEditingCharge(null);
    setEditingIndex(-1);
    setServiceModalOpen(true);
  };

  // Open modal for editing existing charge
  const handleEditCharge = (charge: Charge, index: number) => {
    setModalMode("edit");
    setEditingCharge(charge);
    setEditingIndex(index);
    setServiceModalOpen(true);
  };

  // Save charge (add or edit)
  const handleSaveCharge = (charge: Charge) => {
    setFormData((prev) => {
      if (!prev) return null;
      console.log(charge);
      let updatedCharges: Charge[];

      if (modalMode === "add") {
        updatedCharges = [...prev.charge, charge];
      } else {
        updatedCharges = [...prev.charge];
        updatedCharges[editingIndex] = charge;
      }

      const totalCharge = calculateTotalCharge(updatedCharges);

      return {
        ...prev,
        charge: updatedCharges,
        total_charge: totalCharge.toString(),
        balance_due: totalCharge.toString(),
      };
    });
  };

  // Remove charge line
  const handleRemoveCharge = (index: number) => {
    setFormData((prev) => {
      if (!prev || prev.charge.length <= 1) return prev; // Keep at least one charge
      const updatedCharges = prev.charge.filter((_, i) => i !== index);
      const totalCharge = calculateTotalCharge(updatedCharges);

      return {
        ...prev,
        charge: updatedCharges,
        total_charge: totalCharge.toString(),
      };
    });
  };

  // Save form data
  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const payload = {
        patientId: selectedBillDetails?.patient_id,
        billing_ids: selectedBillDetails?.billing_ids,
        fileid,
        formdata: formData,
      };

      const response = await updateCmsApi(token, payload);
    } catch (error) {
      console.error("Error saving form:", error);
    } finally {
      setSaving(false);
    }
  };

  const validationErrors = validateCMS1500Form(formData);
  const hasErrors = validationErrors.length > 0;

  // Dummy functions for print and download
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Download PDF functionality would be implemented here.");
  };

  {
    loading ? (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading CMS-1500 Form...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3">Loading data. Please wait...</p>
          </div>
        </DialogContent>
      </Dialog>
    ) : !formData && open ? (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>No Record Found</DialogTitle>
          </DialogHeader>
          <div className="text-center text-gray-500 py-10">
            No CMS-1500 data available for this patient.
          </div>
        </DialogContent>
      </Dialog>
    ) : null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-blue-600" /> CMS-1500 Health
              Insurance Claim Form
            </DialogTitle>
          </DialogHeader>

          <div className="font-sans antialiased">
            <Card className="w-full mx-auto rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <CardHeader className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex flex-col sm:flex-row items-center justify-between text-xl font-bold">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                    CMS-1500 Health Insurance Claim Form
                  </div>
                  <div className="flex gap-2">
                    {/* <Button
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSave}
                      disabled={hasErrors || saving}
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save"}
                    </Button> */}
                    {/* <Button
                      className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-gray-100 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={onPrint}
                      disabled={hasErrors}
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-gray-100 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={onDownload}
                      disabled={hasErrors}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button> */}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 bg-white">
                <div className="space-y-6">
                  {/* Validation Alerts */}
                  {hasErrors && (
                    <Alert
                      variant="destructive"
                      className="border-red-200 bg-red-50"
                    >
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <AlertTitle className="text-red-800">
                          Validation Error
                        </AlertTitle>
                        <AlertDescription className="text-red-700">
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  {!hasErrors && (
                    <Alert
                      variant="default"
                      className="bg-green-50 text-green-800 border-green-200"
                    >
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <AlertTitle className="text-green-800">
                          Form is Valid
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                          The CMS-1500 form is ready for submission to the
                          insurance provider.
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="flex justify-center bg-gray-100 rounded-lg p-1 mb-6 shadow-inner">
                      <TabsTrigger
                        value="preview"
                        className="px-6 py-2 text-sm font-medium text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200"
                      >
                        Form Preview
                      </TabsTrigger>
                      <TabsTrigger
                        value="details"
                        className="px-6 py-2 text-sm font-medium text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-200"
                      >
                        Field Details
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview">
                      {/* Form Preview - Real-time updates */}
                      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                        <div className="text-lg text-center font-extrabold mb-6 border-b-2 border-gray-200 pb-3 text-gray-800">
                          HEALTH INSURANCE CLAIM FORM (CMS-1500)
                        </div>

                        <div className="grid grid-cols-12 gap-x-4 gap-y-6 text-sm border border-gray-200 p-6 bg-gray-50 rounded-md">
                          {/* Header area with insurance info */}
                          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-200 pb-6 mb-6">
                            <div className="border border-gray-200 p-4 bg-white rounded-md shadow-sm">
                              <div className="text-gray-500 text-xs uppercase font-semibold mb-2">
                                Insurance Type (Claim Form)
                              </div>
                              <div className="font-medium text-gray-800 text-base">
                                {formData?.claim_form || "N/A"}
                              </div>
                            </div>
                            <div className="border border-gray-200 p-4 bg-white rounded-md shadow-sm">
                              <div className="text-gray-500 text-xs uppercase font-semibold mb-2">
                                Insured's ID Number
                              </div>
                              <div className="font-medium text-gray-800 text-base">
                                {formData?.ins_number || "N/A"}
                              </div>
                            </div>
                            <div className="border border-gray-200 p-4 bg-white rounded-md shadow-sm">
                              <div className="text-gray-500 text-xs uppercase font-semibold mb-2">
                                Assignment
                              </div>
                              <div className="font-medium text-gray-800 text-base">
                                {formData?.accept_assign === "Y" ? "YES" : "NO"}
                              </div>
                            </div>
                          </div>

                          {/* Patient Info */}
                          <div className="col-span-12 sm:col-span-6 border border-gray-200 p-4 bg-white rounded-md shadow-sm">
                            <div className="text-gray-500 text-xs uppercase font-semibold mb-2">
                              Patient's Name
                            </div>
                            <div className="font-medium text-gray-800 text-base">
                              {formData?.pat_name_f} {formData?.pat_name_l}
                            </div>
                          </div>
                          <div className="col-span-6 sm:col-span-2 border border-gray-200 p-4 bg-white rounded-md shadow-sm">
                            <div className="text-gray-500 text-xs uppercase font-semibold mb-2">
                              Birth Date
                            </div>
                            <div className="font-medium text-gray-800 text-base">
                              {formData?.pat_dob}
                            </div>
                          </div>
                          <div className="col-span-3 sm:col-span-2 border border-gray-200 p-4 bg-white rounded-md shadow-sm">
                            <div className="text-gray-500 text-xs uppercase font-semibold mb-2">
                              Gender
                            </div>
                            <div className="font-medium text-gray-800 text-base">
                              {formData?.pat_sex?.substring(0, 1) || "N/A"}
                            </div>
                          </div>
                          <div className="col-span-9 sm:col-span-2 border border-gray-200 p-4 bg-white rounded-md shadow-sm">
                            <div className="text-gray-500 text-xs uppercase font-semibold mb-2">
                              Relation to Insured
                            </div>
                            <div className="font-medium text-gray-800 text-base">
                              {formData?.pat_rel || "N/A"}
                            </div>
                          </div>

                          {/* Patient Address */}
                          <div className="col-span-12 border border-gray-200 p-4 bg-white rounded-md shadow-sm">
                            <div className="text-gray-500 text-xs uppercase font-semibold mb-2">
                              Patient's Address
                            </div>
                            <div className="font-medium text-gray-800 text-base">
                              {formData?.pat_addr_1}
                            </div>
                            <div className="font-medium text-gray-800 text-base">
                              {formData?.pat_city}, {formData?.pat_state}{" "}
                              {formData?.pat_zip}
                            </div>
                          </div>

                          {/* Service Lines Section - Enhanced */}
                          <div className="col-span-12">
                            <div className="flex justify-between items-center mb-4">
                              <div className="text-gray-700 font-bold text-lg">
                                SERVICE DETAILS
                              </div>
                              <Button
                                onClick={handleAddCharge}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md transition-all duration-200"
                              >
                                <Plus className="h-4 w-4" />
                                Add Service
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {formData?.charge?.map((line, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 flex-1">
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium mb-1">
                                          CPT/HCPCS
                                        </div>
                                        <div className="font-semibold text-blue-700">
                                          {line.proc_code}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium mb-1">
                                          Units
                                        </div>
                                        <div className="font-medium">
                                          {line.units}
                                        </div>
                                      </div>

                                      <div>
                                        <div className="text-xs text-gray-500 font-medium mb-1">
                                          POS
                                        </div>
                                        <div className="font-medium">
                                          {line.place_of_service || "N/A"}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium mb-1">
                                          Diag Ref
                                        </div>
                                        <div className="font-medium">
                                          {line.diag_ref || "N/A"}
                                        </div>
                                      </div>

                                      <div>
                                        <div className="text-xs text-gray-500 font-medium mb-1">
                                          Charge
                                        </div>
                                        <div className="font-semibold text-green-700">
                                          {formatCurrency(line.charge)}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium mb-1">
                                          total
                                        </div>
                                        <div className="font-semibold text-green-700">
                                          $ {line.total || "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                      {/* <Button
                                        onClick={() =>
                                          handleEditCharge(line, index)
                                        }
                                        size="sm"
                                        variant="outline"
                                        className="p-2 hover:bg-blue-50 hover:border-blue-300"
                                      >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                      </Button> */}
                                      {formData.charge.length > 1 && (
                                        <Button
                                          onClick={() =>
                                            handleRemoveCharge(index)
                                          }
                                          size="sm"
                                          variant="outline"
                                          className="p-2 hover:bg-red-50 hover:border-red-300"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Totals Section */}
                          <div className="col-span-12 border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0">
                            <div className="space-y-2">
                              <div className="text-gray-500 text-sm font-semibold">
                                Federal Tax ID:{" "}
                                <span className="font-medium text-gray-800">
                                  {formData?.bill_taxid || "N/A"}
                                </span>
                              </div>
                              <div className="text-gray-500 text-sm font-semibold">
                                Remote Claim ID:{" "}
                                <span className="font-medium text-gray-800">
                                  {formData?.remote_claimid || "N/A"}
                                </span>
                              </div>
                              <div className="text-gray-500 text-sm font-semibold">
                                Accept Assignment:{" "}
                                <span className="font-medium text-gray-800">
                                  {formData?.accept_assign === "Y"
                                    ? "YES"
                                    : "NO"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-gray-500 text-sm font-semibold mb-1">
                                Total Charge:
                              </div>
                              <div className="font-bold text-2xl text-blue-700">
                                {formatCurrency(
                                  formData?.total_charge || "0.00"
                                )}
                              </div>
                              <div className="text-gray-500 text-sm font-semibold mt-2">
                                Balance Due:
                              </div>
                              <div className="font-semibold text-xl text-red-600">
                                {formatCurrency(
                                  formData?.balance_due || "0.00"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="details">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Patient Information Card */}
                          <Card className="border border-gray-200 rounded-lg shadow-sm">
                            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 rounded-t-lg">
                              <CardTitle className="text-lg font-semibold text-gray-700">
                                Patient Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pat_name_f"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Firstname:
                                  </Label>
                                  <Input
                                    id="pat_name_f"
                                    name="pat_name_f"
                                    value={formData?.pat_name_f || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pat_name_l"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Lastname:
                                  </Label>
                                  <Input
                                    id="pat_name_l"
                                    name="pat_name_l"
                                    value={formData?.pat_name_l || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pat_dob"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Birth Date:
                                  </Label>
                                  <Input
                                    id="pat_dob"
                                    name="pat_dob"
                                    type="date"
                                    value={formData?.pat_dob || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pat_sex"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Gender:
                                  </Label>
                                  <Select
                                    value={formData?.pat_sex || ""}
                                    onValueChange={(value) =>
                                      setFormData((prev) =>
                                        prev
                                          ? { ...prev, pat_sex: value }
                                          : null
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Male">Male</SelectItem>
                                      <SelectItem value="Female">
                                        Female
                                      </SelectItem>
                                      <SelectItem value="Other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label
                                    htmlFor="pat_addr_1"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Address:
                                  </Label>
                                  <Input
                                    id="pat_addr_1"
                                    name="pat_addr_1"
                                    value={formData?.pat_addr_1 || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pat_city"
                                    className="text-muted-foreground font-medium"
                                  >
                                    City:
                                  </Label>
                                  <Input
                                    id="pat_city"
                                    name="pat_city"
                                    value={formData?.pat_city || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pat_state"
                                    className="text-muted-foreground font-medium"
                                  >
                                    State:
                                  </Label>
                                  <Input
                                    id="pat_state"
                                    name="pat_state"
                                    value={formData?.pat_state || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pat_zip"
                                    className="text-muted-foreground font-medium"
                                  >
                                    ZIP Code:
                                  </Label>
                                  <Input
                                    id="pat_zip"
                                    name="pat_zip"
                                    value={formData?.pat_zip || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pat_rel"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Relation to Insured:
                                  </Label>
                                  <Select
                                    value={formData?.pat_rel || ""}
                                    onValueChange={(value) =>
                                      setFormData((prev) =>
                                        prev
                                          ? { ...prev, pat_rel: value }
                                          : null
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Self">Self</SelectItem>
                                      <SelectItem value="Spouse">
                                        Spouse
                                      </SelectItem>
                                      <SelectItem value="Child">
                                        Child
                                      </SelectItem>
                                      <SelectItem value="Other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {/* Insurance Information Card */}
                          <Card className="border border-gray-200 rounded-lg shadow-sm">
                            <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 p-4 rounded-t-lg">
                              <CardTitle className="text-lg font-semibold text-gray-700">
                                Insurance Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_name_f"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured Firstname:
                                  </Label>
                                  <Input
                                    id="ins_name_f"
                                    name="ins_name_f"
                                    value={formData?.ins_name_f || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_name_l"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured Lastname:
                                  </Label>
                                  <Input
                                    id="ins_name_l"
                                    name="ins_name_l"
                                    value={formData?.ins_name_l || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_number"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured ID:
                                  </Label>
                                  <Input
                                    id="ins_number"
                                    name="ins_number"
                                    value={formData?.ins_number || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_group"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Group Number:
                                  </Label>
                                  <Input
                                    id="ins_group"
                                    name="ins_group"
                                    value={formData?.ins_group || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_dob"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured DOB:
                                  </Label>
                                  <Input
                                    id="ins_dob"
                                    name="ins_dob"
                                    type="date"
                                    value={formData?.ins_dob || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_sex"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured Gender:
                                  </Label>
                                  <Select
                                    value={formData?.ins_sex || ""}
                                    onValueChange={(value) =>
                                      setFormData((prev) =>
                                        prev
                                          ? { ...prev, ins_sex: value }
                                          : null
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Male">Male</SelectItem>
                                      <SelectItem value="Female">
                                        Female
                                      </SelectItem>
                                      <SelectItem value="Other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label
                                    htmlFor="ins_addr_1"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured Address:
                                  </Label>
                                  <Input
                                    id="ins_addr_1"
                                    name="ins_addr_1"
                                    value={formData?.ins_addr_1 || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_city"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured City:
                                  </Label>
                                  <Input
                                    id="ins_city"
                                    name="ins_city"
                                    value={formData?.ins_city || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_state"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured State:
                                  </Label>
                                  <Input
                                    id="ins_state"
                                    name="ins_state"
                                    value={formData?.ins_state || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ins_zip"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Insured ZIP:
                                  </Label>
                                  <Input
                                    id="ins_zip"
                                    name="ins_zip"
                                    value={formData?.ins_zip || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="accept_assign"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Accept Assignment:
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="accept_assign"
                                      checked={formData?.accept_assign === "Y"}
                                      onCheckedChange={() =>
                                        handleCheckboxChange("accept_assign")
                                      }
                                    />
                                    <Label htmlFor="accept_assign">
                                      {formData?.accept_assign === "Y"
                                        ? "Yes"
                                        : "No"}
                                    </Label>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {/* Provider Information Card */}
                          <Card className="border border-gray-200 rounded-lg shadow-sm">
                            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200 p-4 rounded-t-lg">
                              <CardTitle className="text-lg font-semibold text-gray-700">
                                Provider Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="prov_name_f"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Firstname:
                                  </Label>
                                  <Input
                                    id="prov_name_f"
                                    name="prov_name_f"
                                    value={formData?.prov_name_f || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="prov_name_l"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Lastname:
                                  </Label>
                                  <Input
                                    id="prov_name_l"
                                    name="prov_name_l"
                                    value={formData?.prov_name_l || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="prov_name_m"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Middle Name:
                                  </Label>
                                  <Input
                                    id="prov_name_m"
                                    name="prov_name_m"
                                    value={formData?.prov_name_m || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="prov_npi"
                                    className="text-muted-foreground font-medium"
                                  >
                                    NPI:
                                  </Label>
                                  <Input
                                    id="prov_npi"
                                    name="prov_npi"
                                    value={formData?.prov_npi || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label
                                    htmlFor="prov_taxonomy"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Taxonomy:
                                  </Label>
                                  <Input
                                    id="prov_taxonomy"
                                    name="prov_taxonomy"
                                    value={formData?.prov_taxonomy || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {/* Billing Information Card */}
                          <Card className="border border-gray-200 rounded-lg shadow-sm">
                            <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200 p-4 rounded-t-lg">
                              <CardTitle className="text-lg font-semibold text-gray-700">
                                Billing Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                  <Label
                                    htmlFor="bill_name"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Billing Name:
                                  </Label>
                                  <Input
                                    id="bill_name"
                                    name="bill_name"
                                    value={formData?.bill_name || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label
                                    htmlFor="bill_addr_1"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Billing Address:
                                  </Label>
                                  <Input
                                    id="bill_addr_1"
                                    name="bill_addr_1"
                                    value={formData?.bill_addr_1 || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="bill_city"
                                    className="text-muted-foreground font-medium"
                                  >
                                    City:
                                  </Label>
                                  <Input
                                    id="bill_city"
                                    name="bill_city"
                                    value={formData?.bill_city || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="bill_state"
                                    className="text-muted-foreground font-medium"
                                  >
                                    State:
                                  </Label>
                                  <Input
                                    id="bill_state"
                                    name="bill_state"
                                    value={formData?.bill_state || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="bill_zip"
                                    className="text-muted-foreground font-medium"
                                  >
                                    ZIP Code:
                                  </Label>
                                  <Input
                                    id="bill_zip"
                                    name="bill_zip"
                                    value={formData?.bill_zip || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="bill_phone"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Phone:
                                  </Label>
                                  <Input
                                    id="bill_phone"
                                    name="bill_phone"
                                    value={formData?.bill_phone || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="bill_npi"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Billing NPI:
                                  </Label>
                                  <Input
                                    id="bill_npi"
                                    name="bill_npi"
                                    value={formData?.bill_npi || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="bill_taxid"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Tax ID:
                                  </Label>
                                  <Input
                                    id="bill_taxid"
                                    name="bill_taxid"
                                    value={formData?.bill_taxid || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label
                                    htmlFor="bill_taxid_type"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Tax ID Type:
                                  </Label>
                                  <Select
                                    value={formData?.bill_taxid_type || ""}
                                    onValueChange={(value) =>
                                      setFormData((prev) =>
                                        prev
                                          ? { ...prev, bill_taxid_type: value }
                                          : null
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select tax ID type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="EIN">EIN</SelectItem>
                                      <SelectItem value="SSN">SSN</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {/* Payer Information Card */}
                          <Card className="border border-gray-200 rounded-lg shadow-sm">
                            <CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200 p-4 rounded-t-lg">
                              <CardTitle className="text-lg font-semibold text-gray-700">
                                Payer Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                  <Label
                                    htmlFor="payer_name"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Payer Name:
                                  </Label>
                                  <Input
                                    id="payer_name"
                                    name="payer_name"
                                    value={formData?.payer_name || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="payerid"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Payer ID:
                                  </Label>
                                  <Input
                                    id="payerid"
                                    name="payerid"
                                    value={formData?.payerid || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="pcn"
                                    className="text-muted-foreground font-medium"
                                  >
                                    PCN:
                                  </Label>
                                  <Input
                                    id="pcn"
                                    name="pcn"
                                    value={formData?.pcn || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="payer_order"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Payer Order:
                                  </Label>
                                  <Input
                                    id="payer_order"
                                    name="payer_order"
                                    value={formData?.payer_order || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2 col-span-1">
                                  <Label
                                    htmlFor="payer_addr_1"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Payer Address:
                                  </Label>
                                  <Input
                                    id="payer_addr_1"
                                    name="payer_addr_1"
                                    value={formData?.payer_addr_1 || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="payer_city"
                                    className="text-muted-foreground font-medium"
                                  >
                                    City:
                                  </Label>
                                  <Input
                                    id="payer_city"
                                    name="payer_city"
                                    value={formData?.payer_city || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="payer_state"
                                    className="text-muted-foreground font-medium"
                                  >
                                    State:
                                  </Label>
                                  <Input
                                    id="payer_state"
                                    name="payer_state"
                                    value={formData?.payer_state || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="payer_zip"
                                    className="text-muted-foreground font-medium"
                                  >
                                    ZIP Code:
                                  </Label>
                                  <Input
                                    id="payer_zip"
                                    name="payer_zip"
                                    value={formData?.payer_zip || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {/* Referral Information Card */}
                          <Card className="border border-gray-200 rounded-lg shadow-sm">
                            <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 p-4 rounded-t-lg">
                              <CardTitle className="text-lg font-semibold text-gray-700">
                                Referral Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ref_name_f"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Referring Firstname:
                                  </Label>
                                  <Input
                                    id="ref_name_f"
                                    name="ref_name_f"
                                    value={formData?.ref_name_f || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ref_name_l"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Referring Lastname:
                                  </Label>
                                  <Input
                                    id="ref_name_l"
                                    name="ref_name_l"
                                    value={formData?.ref_name_l || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ref_name_m"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Referring Middle Name:
                                  </Label>
                                  <Input
                                    id="ref_name_m"
                                    name="ref_name_m"
                                    value={formData?.ref_name_m || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="ref_npi"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Referring NPI:
                                  </Label>
                                  <Input
                                    id="ref_npi"
                                    name="ref_npi"
                                    value={formData?.ref_npi || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {/* Diagnosis Codes Card */}
                          <Card className="border border-gray-200 rounded-lg shadow-sm">
                            <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200 p-4 rounded-t-lg">
                              <CardTitle className="text-lg font-semibold text-gray-700">
                                Diagnosis Codes
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="diag_1"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Diagnosis A:
                                  </Label>
                                  <Input
                                    id="diag_1"
                                    name="diag_1"
                                    value={formData?.diag_1 || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="diag_2"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Diagnosis B:
                                  </Label>
                                  <Input
                                    id="diag_2"
                                    name="diag_2"
                                    value={formData?.diag_2 || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="diag_3"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Diagnosis C:
                                  </Label>
                                  <Input
                                    id="diag_3"
                                    name="diag_3"
                                    value={formData?.diag_3 || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="diag_4"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Diagnosis D:
                                  </Label>
                                  <Input
                                    id="diag_4"
                                    name="diag_4"
                                    value={formData?.diag_4 || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          Other Claim Details Card
                          <Card className="border border-gray-200 rounded-lg shadow-sm col-span-full">
                            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 p-4 rounded-t-lg">
                              <CardTitle className="text-lg font-semibold text-gray-700">
                                Other Claim Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="claim_form"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Claim Form:
                                  </Label>
                                  <Input
                                    id="claim_form"
                                    name="claim_form"
                                    value={formData?.claim_form || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    readOnly
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="total_charge"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Total Charge:
                                  </Label>
                                  <Input
                                    id="total_charge"
                                    name="total_charge"
                                    type="number"
                                    step="0.01"
                                    value={formData?.total_charge || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    readOnly
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="balance_due"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Balance Due:
                                  </Label>
                                  <Input
                                    id="balance_due"
                                    name="balance_due"
                                    type="number"
                                    step="0.01"
                                    value={formData?.balance_due || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="clia_number"
                                    className="text-muted-foreground font-medium"
                                  >
                                    CLIA Number:
                                  </Label>
                                  <Input
                                    id="clia_number"
                                    name="clia_number"
                                    value={formData?.clia_number || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="auto_accident"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Auto Accident:
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="auto_accident"
                                      checked={formData?.auto_accident === "Y"}
                                      onCheckedChange={() =>
                                        handleCheckboxChange("auto_accident")
                                      }
                                    />
                                    <Label htmlFor="auto_accident">
                                      {formData?.auto_accident === "Y"
                                        ? "Yes"
                                        : "No"}
                                    </Label>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="employment_related"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Employment Related:
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="employment_related"
                                      checked={
                                        formData?.employment_related === "Y"
                                      }
                                      onCheckedChange={() =>
                                        handleCheckboxChange(
                                          "employment_related"
                                        )
                                      }
                                    />
                                    <Label htmlFor="employment_related">
                                      {formData?.employment_related === "Y"
                                        ? "Yes"
                                        : "No"}
                                    </Label>
                                  </div>
                                </div>
                                {/* <div className="space-y-2">
                                  <Label
                                    htmlFor="remote_fileid"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Remote File ID:
                                  </Label>
                                  <Input
                                    id="remote_fileid"
                                    name="remote_fileid"
                                    value={formData?.remote_fileid || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    readOnly
                                  />
                                </div> */}
                                {/* <div className="space-y-2">
                                  <Label
                                    htmlFor="remote_batchid"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Remote Batch ID:
                                  </Label>
                                  <Input
                                    id="remote_batchid"
                                    name="remote_batchid"
                                    value={formData?.remote_batchid || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    readOnly
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor="remote_claimid"
                                    className="text-muted-foreground font-medium"
                                  >
                                    Remote Claim ID:
                                  </Label>
                                  <Input
                                    id="remote_claimid"
                                    name="remote_claimid"
                                    value={formData?.remote_claimid || ""}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    readOnly
                                  />
                                </div> */}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>

              <DialogFooter className="p-4 border-t bg-gradient-to-r from-gray-50 to-slate-50 rounded-b-xl flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={hasErrors || saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Line Modal */}
      <ServiceLineModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
        charge={editingCharge}
        onSave={handleSaveCharge}
        mode={modalMode}
      />
    </>
  );
};

export default CMS1500Form;
