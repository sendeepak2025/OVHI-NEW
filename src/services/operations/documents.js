import { toast } from "react-toastify";
import { showLoadingToast, showSuccess, showError, closeAlert } from "../../components/ui/customAlert";
import { apiConnector } from "../apiConnector";
import { documents } from "../apis";

const { GET_TYPE, UPLOAD_DOC, GET_DOC } = documents;

// Create a new location
export async function uploadDocApi(formData, token, patient_id) {
  showLoadingToast("Uploading files...");
  try {
    const response = await apiConnector("POST", `${UPLOAD_DOC}?patient_id=${patient_id}`, formData, {
      Authorization: `Bearer ${token}`,
    });
    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);
    toast.success(response?.data?.message)
    return response.data;
  } catch (error) {
    console.log(error)
    closeAlert();
    showError("Error", error?.response?.data?.message || "Failed to upload files.");
  }
}




// Get locations by provider ID
export async function getDocumentTypeApi(providerId, token) {
  try {
    const response = await apiConnector("GET", `${GET_TYPE}?providerId=${providerId}`, null, {
      Authorization: `Bearer ${token}`,
    });
    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    return response.data;
  } catch (error) {
    closeAlert();
    showError("Error", error?.response?.data?.message || "Failed to fetch types.");
  }
}


export async function getDocApi(patientId, token) {
  try {
    const response = await apiConnector("GET", `${GET_DOC}?patientId=${patientId}`, null, {
      Authorization: `Bearer ${token}`,
    });
    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    return response.data;
  } catch (error) {
    closeAlert();
    showError("Error", error?.response?.data?.message || "Failed to fetch document.");
  }
}



