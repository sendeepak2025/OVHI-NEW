import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { intake } from "../apis";


const {
  SEND_INTAKE,
  REGISTER_INTAKE_PATIENT
} = intake

export const sendIntakeApi = async (token, formdata) => {
  const loadingToastId = toast.loading("Intake Sending...");
  try {
    const response = await apiConnector("POST", `${SEND_INTAKE}`, formdata,
      {
        Authorization: `Bearer ${token}`,
      });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId);
    toast.success(response?.data?.message);
    return response.data;

  } catch (error) {
    toast.dismiss(loadingToastId);
    toast.error(error?.response?.data?.message || "Failed to send intake.");
    console.error("intake send  ERROR:", error);
    return null;
  }
};


export const registerPatientIntakakeAPI = async (patientData) => {
  try {
    const loadingToastId = toast.loading("Creating patient...");
    // console.log(patientData)
    // return;
    const response = await apiConnector("POST", REGISTER_INTAKE_PATIENT, patientData);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Patient Created!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to create patient.");
    console.error("CREATE_PATIENT_API ERROR:", error);
    return null;
  }
};


