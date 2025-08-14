"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SmartEncounterWorkflow } from "@/components/encounter/SmartEncounterWorkflow";

interface CreateEncounterProps {
  onSuccess?: () => void;
}

const CreateEncounter: React.FC<CreateEncounterProps> = ({ onSuccess }) => {
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  const handleEncounterComplete = (encounterData: any) => {
    console.log("Encounter completed:", encounterData);
    setIsWorkflowOpen(false);
    onSuccess?.();
  };

  return (
    <>
      <Button
        onClick={() => setIsWorkflowOpen(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Smart Encounter
      </Button>
      
      <SmartEncounterWorkflow
        isOpen={isWorkflowOpen}
        onClose={() => setIsWorkflowOpen(false)}
        onEncounterComplete={handleEncounterComplete}
      />
    </>
  );
};

export default CreateEncounter;