import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PatientNotFoundProps {
  id: string | undefined;
}

const PatientNotFound: React.FC<PatientNotFoundProps> = ({ id }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Patient Not Found</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            The patient with ID {id} could not be found. Please check the
            patient ID or return to the patients list.
          </p>
          <Button
            onClick={() => navigate("/provider/patients")}
            className="mt-4"
          >
            Return to Patients
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientNotFound;
