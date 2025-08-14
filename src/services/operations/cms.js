import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { cms } from "../apis";


const {
  GET_CMS_DETAILS,
  UPDATE_CMS_DETAILS
} = cms

export const updateCmsApi = async (token, formdata) => {
  const loadingToastId = toast.loading("Updating details...");
  try {
    const response = await apiConnector("POST", `${UPDATE_CMS_DETAILS}`, formdata,
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
    toast.error(error?.response?.data?.message || "Failed to update cms details.");
    console.error("cms update template ERROR:", error);
    return null;
  }
};



export const getCmsDetails = async (token, data) => {
  try {
    const response = await apiConnector(
      "POST",
      `${GET_CMS_DETAILS}`, data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;
  } catch (error) {
    console.error("error in get cms api ERROR:", error);
    toast.error(error || "Something went wrong.")

    return [];
  }
};




