import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HeartPulse } from "lucide-react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { updatePatinetVitals } from "@/services/operations/patient";
import { EnhancedVitalsInput } from "@/components/vitals/EnhancedVitalsInput";

interface AddVitalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchPatient: () => void;
}

const AddVitalsDialog: React.FC<AddVitalsDialogProps> = ({
  open,
  onOpenChange,
  fetchPatient,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const [vitalsData, setVitalsData] = useState({
    height: 0,
    weight: 0,
    bmi: 0,
    bloodPressure: "",
    heartRate: 0,
    temperature: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleVitalsChange = (newVitals: any) => {
    setVitalsData(newVitals);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await updatePatinetVitals(vitalsData, token, id);
      fetchPatient();
      toast.success("Vitals added successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding vital signs:", error);
      toast.error("Failed to add vital signs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-blue-600" />{" "}
            {/* Updated icon */}
            Add New Vitals
          </DialogTitle>
          <DialogDescription>
            Enter patient vital signs to create a new record, including BMI
            calculation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <EnhancedVitalsInput
            initialVitals={vitalsData}
            onVitalsChange={handleVitalsChange}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Adding..." : "Add Vitals"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVitalsDialog;
