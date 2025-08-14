import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import AddPatientConsent from "./AddPatientConsent";
import { useEffect, useState } from "react";
import { getAllConsentsApi } from "@/services/operations/patient";
import GetAllConsents from "./GetAllConsents";
const PatientConsent = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [consents, setConsents] = useState([]);

  const fetchConsents = async () => {
    try {
      const res = await getAllConsentsApi(token);
      console.log(res, "consects");
      if (res?.success) {
        setConsents(res?.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch beds:", error);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <AddPatientConsent fetchConsents={fetchConsents} />
      <GetAllConsents consents={consents} />
    </div>
  );
};

export default PatientConsent;
