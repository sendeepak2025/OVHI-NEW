import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { settings } from "../apis";
import Swal from "sweetalert2";
const {
  GET_ALL_ORG,
  GET_ALL_PRACTIS,
  UPDATE_SETTING_API,
  PDF_HEADER_API,
  GET_PDF_HEADER_API,
  UPDATE_PROVIDER_API,
  GET_ACOCUNT_DETAILS_PROVIDER_API,
  DASHBOARD_DATA,
  MEDICATON_DATA,

  ADD_SERVICE,
  ADD_INSURANCE_NETWORK,
  PRACTISH_SETTING_API,
  GET_PRACTISH_SETTING_API
} = settings

export const updateSettingsApi = async (patientData) => {
  try {
    const loadingToastId = toast.loading("Creating patient...");

    const response = await apiConnector("POST", UPDATE_SETTING_API, patientData);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "update successfully!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss();
    toast.error(error?.response?.data?.message || "Failed to update.");
    console.error("CREATE_PATIENT_API ERROR:", error);
    return null;
  }
};
export const practishSettingApi = async (patientData, token) => {
  const loadingToastId = toast.loading("Submitting practice settings...");
  try {
    const response = await apiConnector(
      "POST",
      PRACTISH_SETTING_API,
      patientData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId);
    toast.success(response.data.message || "Settings updated successfully");

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToastId);
    toast.error(error?.response?.data?.message || "Failed to update settings.");
    console.error("PRACTISH_SETTING_API ERROR:", error);
    return null;
  }
};




export const getPractishSettingApi = async (token, providerId) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_PRACTISH_SETTING_API}?providerId=${providerId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }

    );
    return response.data;
  } catch (error) {
    console.error("get org ERROR:", error);
   
    return null;
  }
};
export const getAllOrgAPI = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_ORG}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }

    );
    return response.data;
  } catch (error) {
    console.error("get org ERROR:", error);
    // Swal.fire({
    //   icon: "error",
    //   title: "Failed to fetch Organization !",
    //   text: error?.response?.data?.message || "Something went wrong.",
    // });
    return null;
  }
};
export const getDashboardDataApi = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${DASHBOARD_DATA}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }

    );
    return response.data;
  } catch (error) {
    console.error("get org ERROR:", error);
    // Swal.fire({
    //   icon: "error",
    //   title: "Failed to fetch Organization !",
    //   text: error?.response?.data?.message || "Something went wrong.",
    // });
    return null;
  }
};
export const getMedicationApi = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${MEDICATON_DATA}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }

    );
    return response.data;
  } catch (error) {
    console.error("get org ERROR:", error);
    // Swal.fire({
    //   icon: "error",
    //   title: "Failed to fetch Organization !",
    //   text: error?.response?.data?.message || "Something went wrong.",
    // });
    return null;
  }
};

export const getAllPractisAPI = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_PRACTIS}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }

    );
    return response.data;
  } catch (error) {
    console.error("get org ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch Practis !",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};


export const updatePdfSettingsApi = async (patientData, token) => {
  try {
    const loadingToastId = toast.loading("Uploading pdf settings...");

    const response = await apiConnector("POST", PDF_HEADER_API, patientData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "update successfully!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss();
    toast.error(error?.response?.data?.message || "Failed to update.");
    console.error("Pdf upload ERROR:", error);
    return null;
  }
};


export const getPdfAPI = async (id, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_PDF_HEADER_API}?providerId=${id}`, null, {
      Authorization: `Bearer ${token}`,
    }

    );
    return response.data;
  } catch (error) {
    console.error("get org ERROR:", error);
    // Swal.fire({
    //   icon: "error",
    //   title: "Failed to fetch Organization !",
    //   text: error?.response?.data?.message || "Something went wrong.",
    // });
    return null;
  }
};





export const updateProviderSettingsApi = async (patientData, token) => {
  try {
    const loadingToastId = toast.loading("Uploading provider settings...");

    const response = await apiConnector("PUT", UPDATE_PROVIDER_API, patientData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "update successfully!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss();
    toast.error(error?.response?.data?.message || "Failed to update.");
    console.error("Pdf upload ERROR:", error);
    return null;
  }
};


export const getAccountDetailsAPI = async (providerId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ACOCUNT_DETAILS_PROVIDER_API}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("No account details found!");
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_ACOCUNT_DETAILS_PROVIDER_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};


export const addServiceApi = async (serviceName, token) => {
  const loadingToastId = toast.loading("Adding service...");

  try {
    const response = await apiConnector("POST", ADD_SERVICE, serviceName,  {
        Authorization: `Bearer ${token}`,
      });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId);
    toast.success(response.data.message || "Service added successfully");

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToastId);
    toast.error(error?.response?.data?.message || "Failed to add service.");
    console.error("ADD_SERVICE_API ERROR:", error);
    return null;
  }
};



export const addInsouranceNetworkApi = async (networkName, token) => {
  const loadingToastId = toast.loading("Adding insurance...");

  try {
    const response = await apiConnector("POST", ADD_INSURANCE_NETWORK, networkName,  {
        Authorization: `Bearer ${token}`,
      });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId);
    toast.success(response.data.message);

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToastId);
    toast.error(error?.response?.data?.message || "Failed to add Insurance.");
    console.error("ADD_insurance_API ERROR:", error);
    return null;
  }
};
