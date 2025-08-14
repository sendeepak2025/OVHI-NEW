import React, { useEffect, useState } from "react";
import AssignBedToPatient from "./AssignBedToPatient";
import GetAllBeds from "./GetAllBeds";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getAllBedsApi } from "@/services/operations/patient";

const PatientBeds = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [beds, setBeds] = useState([]);

  const fetchAllBeds = async () => {
    try {
      const res = await getAllBedsApi(token);
      if (res?.success) {
        setBeds(res?.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch beds:", error);
    }
  };

  useEffect(() => {
    fetchAllBeds();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <AssignBedToPatient fetchAllBeds={fetchAllBeds} />
      <GetAllBeds beds={beds} fetchAllBeds={fetchAllBeds} />
    </div>
  );
};

export default PatientBeds;
