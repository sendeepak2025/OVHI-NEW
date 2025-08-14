import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ListPlus } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { getPatientTimingAPI } from "@/services/operations/patient";
import { useParams } from "react-router-dom";
import { PatientTiming } from "@/types/dataTypes";

interface CreateBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  selectedMonth: any;
  setSelectedMonth: any;
}

const CreateBillDialog: React.FC<CreateBillDialogProps> = ({
  open,
  onOpenChange,
  patient,
  selectedMonth,
  setSelectedMonth,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);

  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [billingStatus, setBillingStatus] = useState("Draft");

  const { id } = useParams();
  const [patientTiming, setPatientTiming] = useState<any>(null);

  const fetchPatientTiming = async () => {
    const response = await getPatientTimingAPI(id, token, selectedMonth);
    setPatientTiming(response);
    // console.log(response, "patient timing data");
  };

  useEffect(() => {
    if (id && selectedMonth) {
      fetchPatientTiming();
    }
  }, [id, selectedMonth]);
  const handleSubmit = () => {
    if (!selectedDiagnosis || !selectedInsurance || !billingStatus) {
      toast.error("Please select required fields.");
      return;
    }

    const payload = {
      patientId: patient?.patientId,
      firstName: patient?.firstName,
      lastName: patient?.lastName,
      middleName: patient?.middleName,
      created: patient?.created,
      patientService: patient?.patientService,
      diagnosis: selectedDiagnosis,
      insurance: selectedInsurance,
      billingStatus: billingStatus,
      totalAmount: patientTiming?.totalAmount || 0,
    };

    console.log("Billing payload:", payload);
    toast.success("Billing info prepared!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-blue-600" />
            Send To Billing
          </DialogTitle>
        </DialogHeader>

        <div>
          <label className="text-sm font-medium">Service Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="ml-2 p-2 border rounded"
          />
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label>First Name</Label>
            <Input disabled value={patient?.firstName || ""} />
          </div>
          <div>
            <Label>Middle Name</Label>
            <Input disabled value={patient?.middleName || ""} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input disabled value={patient?.lastName || ""} />
          </div>
          <div>
            <Label>Patient ID</Label>
            <Input disabled value={patient?.patientId || ""} />
          </div>
          <div>
            <Label>Patient Service</Label>
            <Input disabled value={patient?.patientService || ""} />
          </div>
          <div>
            <Label>Created</Label>
            <Input
              disabled
              value={
                patient?.created
                  ? new Date(patient.created).toLocaleDateString()
                  : ""
              }
            />
          </div>
        </div>

        {/* Select Diagnosis */}
        <div className="py-2">
          <Label>Select Diagnosis</Label>
          <Select onValueChange={setSelectedDiagnosis}>
            <SelectTrigger>
              <SelectValue placeholder="Select diagnosis" />
            </SelectTrigger>
            <SelectContent>
              {patient?.diagnosis?.map((d: any, idx: number) => (
                <SelectItem key={idx} value={d?.diagnosis}>
                  {d?.diagnosis} ({d?.icd10})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select Insurance */}
        <div className="py-2">
          <Label>Select Insurance</Label>
          <Select onValueChange={setSelectedInsurance}>
            <SelectTrigger>
              <SelectValue placeholder="Select insurance" />
            </SelectTrigger>
            <SelectContent>
              {patient?.insurance?.map((i: any, idx: number) => (
                <SelectItem key={idx} value={i?.company}>
                  {i?.company} - {i?.policyNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select Billing Status */}
        <div className="py-2">
          <Label>Billing Status</Label>
          <Select onValueChange={setBillingStatus} defaultValue="Draft">
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p>Total Amount $ : {patientTiming?.totalAmount || 0}</p>
        <p>Total Time $ : {patientTiming?.totalMinutes || 0}</p>
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit}>Submit to of Billing</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBillDialog;
