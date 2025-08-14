import {
  showLoadingToast,
  showSuccess,
  showError,
  closeAlert,
} from "../../components/ui/customAlert";
import { apiConnector } from "../apiConnector";
import { WORKFLOW_API } from "../apis";

// 🔧 1. Create Workflow
export async function createWorkflow(formData, token) {
  showLoadingToast("Creating workflow...");

  try {
    const response = await apiConnector("POST", WORKFLOW_API.CREATE, formData, {
      Authorization: `Bearer ${token}`,
    });

    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    showSuccess("Success", "Workflow created successfully!");
    return response.data.data;
  } catch (error) {
    closeAlert();
    showError(
      "Error",
      error?.response?.data?.message || "Failed to create workflow."
    );
    throw error;
  }
}

// 🔎 2. Get Workflows by Provider ID
export async function getWorkflowsByProviderId(providerId, token) {
  showLoadingToast("Fetching workflows...");

  try {
    const response = await apiConnector(
      "GET",
      WORKFLOW_API.GET_BY_PROVIDER(providerId),
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
      error?.response?.data?.message || "Failed to fetch workflows."
    );
    return [];
  }
}

// ✏️ 3. Update Workflow
export async function updateWorkflow(id, formData, token) {
  showLoadingToast("Updating workflow...");

  try {
    const response = await apiConnector(
      "PUT",
      WORKFLOW_API.UPDATE(id),
      formData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    showSuccess("Success", "Workflow updated successfully!");
    return response.data.data;
  } catch (error) {
    closeAlert();
    showError(
      "Error",
      error?.response?.data?.message || "Failed to update workflow."
    );
    throw error;
  }
}

// ❌ 4. Delete Workflow
export async function deleteWorkflow(id, token) {
  showLoadingToast("Deleting workflow...");

  try {
    const response = await apiConnector(
      "DELETE",
      WORKFLOW_API.DELETE(id),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    closeAlert();

    if (!response.data.success) throw new Error(response.data.message);

    showSuccess("Deleted", "Workflow deleted successfully!");
    return true;
  } catch (error) {
    closeAlert();
    showError(
      "Error",
      error?.response?.data?.message || "Failed to delete workflow."
    );
    return false;
  }
}
