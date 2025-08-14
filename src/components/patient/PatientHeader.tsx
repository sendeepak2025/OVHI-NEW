import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Video,
  PenLine,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { QuickDiagnosisWidget } from "@/components/provider/QuickDiagnosisWidget";

const PatientHeader: React.FC = () => {
  const navigate = useNavigate();
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "pending sync" | "sync error"
  >("synced");
  const [lastSynced, setLastSynced] = useState<string>(
    new Date().toISOString()
  );

  const handleSync = () => {
    setSyncStatus("pending sync");

    // Simulate EHR synchronization with
    setTimeout(() => {
      setSyncStatus("synced");
      setLastSynced(new Date().toISOString());
      toast({
        title: "Synchronization Complete",
        description: "Patient data has been synchronized with  EHR",
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
        <div className="flex gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center mr-4"></div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last synchronized: {new Date(lastSynced).toLocaleString()}</p>
                <p>Click to sync with EHR</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {false && (
            <Button
              variant="outline"
              onClick={() => navigate("/appointments/new")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" /> Schedule Appointment
            </Button>
          )}
        </div>
      </div>
      
      {/* Quick Diagnosis Entry for Patient Header */}
      <div className="flex justify-end">
        <QuickDiagnosisWidget
          onDiagnosisAdd={(diagnosis) => {
            console.log('Quick diagnosis added from header:', diagnosis);
            toast({
              title: "Diagnosis Added",
              description: `Added: ${diagnosis.description}`,
            });
          }}
          patientId="current-patient"
          compact={true}
          showFavorites={true}
          showRecent={true}
        />
      </div>
    </div>
  );
};

export default PatientHeader;
