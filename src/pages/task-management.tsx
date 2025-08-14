import React from "react";
import { useParams } from "react-router-dom";
import AdvancedTaskManager from "@/components/tasks/AdvancedTaskManager";

const TaskManagement = () => {
  const { patientId } = useParams();
  
  // Mock patient conditions - in real implementation, these would come from patient data
  const patientConditions = ['Diabetes', 'Hypertension', 'Heart Disease'];

  return (
    <div className="container mx-auto p-6">
      <AdvancedTaskManager 
        patientId={patientId || 'default-patient-id'} 
        patientConditions={patientConditions}
      />
    </div>
  );
};

export default TaskManagement;