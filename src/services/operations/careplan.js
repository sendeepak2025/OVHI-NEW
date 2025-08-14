import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { careplan } from "../apis";


const {
  CREATE_CARE_PLAN, GET_CARE_PLAN } = careplan

export const createCarePlanApi = async (formData, token) => {
  const loadingToastId = toast.loading("Creating Task...");
  try {
    const response = await apiConnector("POST", `${CREATE_CARE_PLAN}`, formData,
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
    toast.error(error?.response?.data?.message || "Failed to create careplan.");
    console.error("care plan ERROR:", error);
    return null;
  }
};





export const getCarePlanApi = async (patientId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_CARE_PLAN}?patientId=${patientId}`,
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
    console.error("get careplan :", error);
    toast.error(error?.response?.data?.message || "Something went wrong.")

    return null;
  }
};