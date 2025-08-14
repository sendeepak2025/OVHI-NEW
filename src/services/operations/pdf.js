import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { sendPdf } from "../apis";


const {
  SEND_PDF
} = sendPdf

export const sendPdfToBackendApi = async (formData, patientId) => {
  const loadingToastId = toast.loading("Uploading PDF...");
  try {
    const response = await apiConnector("POST", `${SEND_PDF}/${patientId}`, formData);
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId);
    toast.success(response?.data?.message);
    return response.data;

  } catch (error) {
    toast.dismiss(loadingToastId);
    toast.error(error?.response?.data?.message || "Failed to upload PDF.");
    console.error("SEND_PDF_API ERROR:", error);
    return null;
  }
};



