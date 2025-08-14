import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { encounter } from "../apis";


const {
  CREATE_TEMPLATE_API,
  GET_TEMPLATE_API,
  UPDATE_TEMPLATE_API,
  DELETE_TEMPLATE_API,

  CREATE_ENCOUNTER_API,
  GET_ENCOUNTER_API,
  UPDATE_ENCOUNTER_API,
  DELETE_ENCOUNTER_API
} = encounter

export const createTemplateApi = async (formData, token) => {
  const loadingToastId = toast.loading("Creating Task...");
  try {
    const response = await apiConnector("POST", `${CREATE_TEMPLATE_API}`, formData,
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
    toast.error(error?.response?.data?.message || "Failed to create template.");
    console.error("create template ERROR:", error);
    return null;
  }
};



export const getTemplateApi = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_TEMPLATE_API}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;
  } catch (error) {
    console.error("error in get template api ERROR:", error);
    toast.error(error || "Something went wrong.")

    return [];
  }
};


export const updateTemplateApi = async (template_id, data, token) => {

  const loadingToastId = toast.loading("Template updating...");

  try {
    const response = await apiConnector(
      "POST",
      `${UPDATE_TEMPLATE_API}/${template_id}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }
    toast.dismiss(loadingToastId);
    toast.success(response?.data?.message)

    return response.data.data;
  } catch (error) {
    console.error("update task ERROR:", error);
    toast.error(error?.response?.data?.message || "Something went wrong.")
    toast.dismiss(loadingToastId);

    return null;
  }
};

export const deleteTemplate = async (template_id, token) => {
  try {
    const loadingToastId = toast.loading("Template deleting...");

    const response = await apiConnector(
      "DELETE",
      `${DELETE_TEMPLATE_API}/${template_id}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId);
    toast.success(response?.data?.message)

    return response.data.data;
  } catch (error) {
    console.error("delete task ERROR:", error);
    toast.error(error?.response?.data?.message || "Something went wrong.")
    toast.dismiss(loadingToastId);

    return null;
  }
};







export const createEncounterApi = async (formData, token) => {
  const loadingToastId = toast.loading("Creating Encounter...");
  try {
    const response = await apiConnector("POST", `${CREATE_ENCOUNTER_API}`, formData,
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
    toast.error(error?.response?.data?.message || "Failed to create template.");
    console.error("create template ERROR:", error);
    return null;
  }
};



export const getEncounterApi = async (token, patientId) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ENCOUNTER_API}?patientId=${patientId}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;
  } catch (error) {
    console.error("error in get template api ERROR:", error);
    toast.error(error || "Something went wrong.")

    return [];
  }
};
export const getAllEncounterApi = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ENCOUNTER_API}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;
  } catch (error) {
    console.error("error in get template api ERROR:", error);
    toast.error(error || "Something went wrong.")

    return [];
  }
};


export const updateEncounterApi = async (encounterId, data, token) => {

  const loadingToastId = toast.loading("Encounter updating...");

  try {
    const response = await apiConnector(
      "POST",
      `${UPDATE_ENCOUNTER_API}/${encounterId}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }
    toast.dismiss(loadingToastId);
    toast.success(response?.data?.message)

    return response.data.data;
  } catch (error) {
    console.error("update encounter ERROR:", error);
    toast.error(error?.response?.data?.message || "Something went wrong.")
    toast.dismiss(loadingToastId);

    return null;
  }
};



export const deleteEncounterApi = async (encounterId, token) => {
  let loadingToastId;

  try {
    loadingToastId = toast.loading("Encounter deleting...");

    const response = await apiConnector(
      "DELETE",
      `${DELETE_ENCOUNTER_API}/${encounterId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId);
    toast.success(response?.data?.message);

    return response.data;
  } catch (error) {
    console.error("delete encounter ERROR:", error);

    if (loadingToastId) toast.dismiss(loadingToastId);
    toast.error(error?.response?.data?.message || "Something went wrong.");

    return null;
  }
};


