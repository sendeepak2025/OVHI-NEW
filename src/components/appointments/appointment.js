import {
  showLoadingToast,
  showSuccess,
  showError,
  closeAlert,
} from "../../components/ui/customAlert";
import { apiConnector } from "../apiConnector";
import { APPOINTMENT_API } from "../apis"; // define endpoint paths here

// Create a new appointment
export async function createAppointment(formData, token) {
  showLoadingToast("Creating appointment...");

  try {
    const response = await apiConnector("POST", APPOINTMENT_API.CREATE, formData, {
      Authorization: `Bearer ${token}`,
    });

    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    showSuccess("Success", "Appointment created successfully!");
    return response.data.data;
  } catch (error) {
    closeAlert();
    showError(
      "Error",
      error?.response?.data?.message || "Failed to create appointment."
    );
    throw error; // optional if you want to catch in frontend
  }
}



export async function getAppointmentsByProviderId(providerId, token) {
  showLoadingToast("Fetching appointments...");

  try {
    const response = await apiConnector(
      "GET",
      APPOINTMENT_API.GET_BY_PROVIDER(providerId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

 
    return response.data.data;
  } catch (error) {
    closeAlert();
    showError(
      "Error",
      error?.response?.data?.message || "Failed to fetch appointments."
    );
    return [];
  }
}