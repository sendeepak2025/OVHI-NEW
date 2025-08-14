import { showLoadingToast, showSuccess, showError, closeAlert } from "../../components/ui/customAlert";
import { apiConnector } from "../apiConnector";
import { LOCATION_API } from "../apis";

// Create a new location
export async function createProviderLocation(formData, token) {
  showLoadingToast("Creating location...");
  try {
    const response = await apiConnector("POST", LOCATION_API.CREATE, formData, {
      Authorization: `Bearer ${token}`,
    });
    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    showSuccess("Success", "Location created successfully!");
    return response.data.data;
  } catch (error) {
    console.log(error)
    closeAlert();
    showError("Error", error?.response?.data?.message || "Failed to create location.");
  }
}




// Get locations by provider ID
export async function getLocationsByProviderId(providerId, token) {
  showLoadingToast("Fetching provider locations...");
  try {
    const response = await apiConnector("GET", LOCATION_API.GET_BY_PROVIDER(providerId), null, {
      Authorization: `Bearer ${token}`,
    });
    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    return response.data.data;
  } catch (error) {
    closeAlert();
    showError("Error", error?.response?.data?.message || "Failed to fetch provider locations.");
  }
}


// Update location
export async function updateProviderLocation(formData, token) {
  showLoadingToast("Updating location...");
  try {
    const response = await apiConnector("PUT", LOCATION_API.UPDATE, formData, {
      Authorization: `Bearer ${token}`,
    });
    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    showSuccess("Success", "Location updated successfully!");
    return true;
  } catch (error) {
    closeAlert();
    showError("Error", error?.response?.data?.message || "Failed to update location.");
    return false;
  }
}


// Delete location by ID
export async function deleteProviderLocation(locationId, token) {
  showLoadingToast("Deleting location...");
  try {
    const response = await apiConnector("DELETE", LOCATION_API.DELETE(locationId), null, {
      Authorization: `Bearer ${token}`,
    });
    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    showSuccess("Deleted", "Location removed successfully.");
    return true;
  } catch (error) {
    closeAlert();
    showError("Error", error?.response?.data?.message || "Failed to delete location.");
    return false;
  }
}

