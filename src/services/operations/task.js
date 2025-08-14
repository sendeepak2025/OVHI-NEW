import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { task } from "../apis";


const {
  CREATE_TASK_API, GET_TASK_BY_PATIENT_ID, GET_TASK_BY_PROVIDER_ID, GET_TASK_BY_NURSE_ID, EDIT_TASK, GET_TASK_DETAILS, GET_ALL_TASK
} = task

export const createTaskAPI = async (formData, patientId, token) => {
  const loadingToastId = toast.loading("Creating Task...");
  try {
    const response = await apiConnector("POST", `${CREATE_TASK_API}?patientId=${patientId}`, formData,
      {
        Authorization: `Bearer ${token}`,
      });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId);
    toast.success(response?.data?.message);
    // console.log(response)
    return response.data;

  } catch (error) {
    toast.dismiss(loadingToastId);
    toast.error(error?.response?.data?.message || "Failed to create task.");
    console.error("CREATE_TASK_API ERROR:", error);
    return null;
  }
};



export const getTaskByPatientID = async (patientId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_TASK_BY_PATIENT_ID}?patientId=${patientId}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;
  } catch (error) {
    console.error("GET_TASK_BY_PATIENT_ID ERROR:", error);
    toast.error(error || "Something went wrong.")

    return [];
  }
};
export const getTaskByProviderID = async (providerId, query, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_TASK_BY_PROVIDER_ID}/${providerId}/?${query}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_TASK_BY_PROVIDER_ID ERROR:", error);
    toast.error(error?.response?.data?.message || "Something went wrong.")

    return null;
  }
};
export const getTaskByNurseID = async (nurseId, query, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_TASK_BY_NURSE_ID}/${nurseId}/?${query}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_TASK_BY_NURSE_ID_ERROR:", error);
    toast.error(error?.response?.data?.message || "Something went wrong.")

    return null;
  }
};


export const editTask = async (taskId, formData, patientId, token) => {
  const loadingToastId = toast.loading("Task Status Updating...");
  try {

    const response = await apiConnector(
      "POST",
      `${EDIT_TASK}?taskId=${taskId}&patientId=${patientId}`,
      formData,

      {
        Authorization: `Bearer ${token}`,
      }
    );

    toast.dismiss(loadingToastId); // ✅ dismiss before showing success toast

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message);
    return response.data;
  } catch (error) {
    toast.dismiss(loadingToastId); // already handled
    toast.error(error?.response?.data?.message || "Failed to update task.");
    console.error("update task ERROR:", error);
    return null;
  }
};


export const getTaskDetails = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_TASK_DETAILS}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;
  } catch (error) {
    console.error("GET_TASK_DETAILS_ERROR:", error);
    toast.error(error?.response?.data?.message || "Something went wrong.")

    return null;
  }
};
export const getAllTaskApi = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_TASK}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;
  } catch (error) {
    console.error("GET_TASK_DETAILS_ERROR:", error);
    toast.error(error?.response?.data?.message || "Something went wrong.")

    return null;
  }
};