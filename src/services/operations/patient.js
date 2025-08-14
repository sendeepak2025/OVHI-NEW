import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { patientEndpoints } from "../apis";
import Swal from "sweetalert2";
import { setLoading } from "../../redux/authSlice"
const {
  CREATE_PATIENT_API,
  GET_ALL_PATIENTS_API,

  UPDATE_PATIENT_API,
  GET_SINGLE_PATIENT_API,
  GET_ALL_PATIENTS_FOR_PROVIDER_API,
  SEND_FORM_TO_PATIENT_API,
  GET_SINGLE_PATIENT_BY_NUMBER,
  GET_PATIENT_MONITOIRING_DATA,
  GET_PCM_REPORTS,
  GET_CCM_REPORTS,
  GET_PROVIDERS_API,
  ADD_PATIENT_NOTES,
  GET_PATIENT_NOTES,
  ADD_PATIENT_DIAGNOSIS,
  SUBMITE_TIMER,
  ADD_MEDICATION,
  ADD_INSURANCE,
  ADD_ALLERGIES,
  GET_PATIENET_TIMING,
  UPDATE_PATIENT_VITALS,

  GET_PATIENT_SUMMARY,
  GET_PATIENT_SUMMARY_RPM,

  GET_BILLING_DETAILS,
  UPDATE_BILLING_STATUS,

  ASSIGN_BED,
  UNASSIGN_BED, GET_ALL_BED,
  SEND_CONSENCT,
  GET_ALL_CONSENCT
} = patientEndpoints

export const createPatientAPI = async (patientData, token) => {
  try {
    const loadingToastId = toast.loading("Creating patient...");
    // console.log(patientData)
    // return;
    const response = await apiConnector("POST", CREATE_PATIENT_API, patientData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Patient Created!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to create patient.");
    console.error("CREATE_PATIENT_API ERROR:", error);
    return null;
  }
};
export const addPatinetNotes = async (notes, token, patientId) => {
  try {
    const loadingToastId = toast.loading("Notes creating...");

    const response = await apiConnector("POST", `${ADD_PATIENT_NOTES}?patientId=${patientId}`, notes, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Notes Created!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to create notes.");
    console.error("CREATE Note ERROR:", error);
    return null;
  }
};
export const getPatinetNotes = async (patientId, token) => {
  try {

    const response = await apiConnector("GET", `${GET_PATIENT_NOTES}?patientId=${patientId}`, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }



    return response.data;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to get notes.");
    console.error(" Note get ERROR:", error);
    return null;
  }
};
export const addPatinetDiagnosis = async (notes, token, patientId) => {
  try {
    const loadingToastId = toast.loading("Diagnosis creating...");

    const response = await apiConnector("POST", `${ADD_PATIENT_DIAGNOSIS}?patientId=${patientId}`, notes, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Diagnosis Created!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to create Diagnosis.");
    console.error("Diagnosis create ERROR:", error);
    return null;
  }
};

export const editPatientAPI = async (patientData, token, type = "Patient") => {

  const loadingToastId = toast.loading("Updating patient...");
  try {
    const response = await apiConnector("POST", `${UPDATE_PATIENT_API}`, patientData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.dismiss(loadingToastId); // ✅ dismiss the specific loading toast
    toast.success(response?.data?.message);

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToastId); // ✅ dismiss the specific loading toast
    toast.error(error?.response?.data?.message || "Failed to update patient.");
    console.error("UPDATE_PATIENT_API ERROR:", error);
    return null;
  }
};


export const getAllPatientsAPI = async (page = 1, token, searchQuery) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_PATIENTS_API}?page=${page}&searchterm=${searchQuery}`,
      null,
      {
        Authorization: `Bearer ${token}`,
        searchterm: searchQuery
      }
    );


    return response.data;
  } catch (error) {
    console.error("GET_ALL_PATIENTS_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};


export const getAllPatientsBillingAPI = async (
  page = 1,
  token,
  searchQuery = "",
  date = null
) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_BILLING_DETAILS}?page=${page}&searchterm=${encodeURIComponent(searchQuery)}`,
      { date }, // Send date in body if available
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    );

    return response?.data || null;
  } catch (error) {
    console.error("GET_ALL_PATIENTS_BILLING_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch billing details!",
      text: error?.response?.data?.message || "Something went wrong while fetching billing information.",
    });
    return null;
  }
};



export const updateBillingStatusAPI = async (billing_ids, status, token) => {
  try {
    // Convert to comma-separated string if it's an array
    const idsString = Array.isArray(billing_ids)
      ? billing_ids.join(",")
      : billing_ids

    const response = await apiConnector(
      "POST",
      UPDATE_BILLING_STATUS,
      {
        billing_ids: idsString,
        status
      },
      {
        Authorization: `Bearer ${token}`
      }
    )

    return response.data
  } catch (error) {
    console.error("UPDATE_BILLING_STATUS_API ERROR:", error)
    Swal.fire({
      icon: "error",
      title: "Status update failed",
      text: error?.response?.data?.error || "Could not update billing status."
    })
    return null
  }
}




export const getSinglePatientAPI = async (patientId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_SINGLE_PATIENT_API}?patientId=${patientId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // console.log(patientId)
    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_ALL_PATIENTS_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};




export const getPcmReportsAPI = async (patientId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_PCM_REPORTS}/${patientId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_pcm_reports_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};
export const getCcmReportsAPI = async (patientId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_CCM_REPORTS}/${patientId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_ccm_reports_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};



export const getMonitoiringPatientAPI = async (token) => {
  try {
    const response = await apiConnector(
      "get",
      `${GET_PATIENT_MONITOIRING_DATA}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_ALL_PATIENTS_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};



export const getSinglePatientByNumberAPI = async (phone, token) => {
  try {
    const response = await apiConnector(
      "POST",
      `${GET_SINGLE_PATIENT_BY_NUMBER}?phone=${phone}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // console.log(phone)
    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data.data;
  } catch (error) {
    console.error("get patient by phone ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};





// export const getProviderPatientAPI = async (providerId, token) => {
//   try {
//     const response = await apiConnector(
//       "GET",
//       `${GET_ALL_PATIENTS_FOR_PROVIDER_API}/${providerId}`,
//       null,
//       {
//         Authorization: `Bearer ${token}`,
//       }
//     );

//     if (!response?.data?.patients) {
//       throw new Error("No patients found!");
//     }

//     return response.data;
//   } catch (error) {
//     console.error("GET_ALL_PATIENTS_API ERROR:", error);
//     Swal.fire({
//       icon: "error",
//       title: "Failed to fetch patients!",
//       text: error?.response?.data?.message || "Something went wrong.",
//     });
//     return null;
//   }
// };




export const getAPatientAPI = async (id, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_SIGNLE_PATIENT_API}/${id}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.patient) {
      throw new Error("Patient not found!");
    }

    return response.data.patient;
  } catch (error) {
    console.error("GET_PATIENT_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patient!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};

export const sendFormToPatient = async (patientId, isForm) => {
  const loadingToastId = toast.loading("Sending form...");
  try {
    const response = await apiConnector("PUT", `${SEND_FORM_TO_PATIENT_API}/${patientId}`, { isForm });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message);
    return response.data?.form;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to send form.");
    console.error("Form send ERROR:", error);
    return null;
  } finally {
    toast.dismiss(loadingToastId);
  }
};




export const getProvidersAPI = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_PROVIDERS_API}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // console.log(patientId)
    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_ALL_PATIENTS_API ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};





export const submiteDurationApi = async (data, token, patientId) => {
  try {
    const loadingToastId = toast.loading("Submiting time...");

    const response = await apiConnector("POST", `${SUBMITE_TIMER}?patientId=${patientId}`, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Timer Submited!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data?.savedPatient;
  } catch (error) {
    toast.dismiss();
    toast.error(error?.response?.data?.message || "Failed to submite time.");
    console.error("timer submition ERROR:", error);
    return null;
  }
};



export const addPatinetMediationAPI = async (data, token, patientId) => {
  try {
    const loadingToastId = toast.loading("Medication  creating...");

    const response = await apiConnector("POST", `${ADD_MEDICATION}?patientId=${patientId}`, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Medication  Created!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to create Medication .");
    console.error("Medication  create ERROR:", error);
    return null;
  }
};
export const addPatinetInsuranceAPI = async (data, token, patientId) => {
  try {
    const loadingToastId = toast.loading("Insurance  creating...");

    const response = await apiConnector("POST", `${ADD_INSURANCE}?patientId=${patientId}`, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Insurance  Created!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to create Insurance .");
    console.error("Insurance  create ERROR:", error);
    return null;
  }
};
export const addPatinetAllergiesAPI = async (data, token, patientId) => {
  try {
    const loadingToastId = toast.loading("Allergies   creating...");

    const response = await apiConnector("POST", `${ADD_ALLERGIES}?patientId=${patientId}`, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Allergies Created!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to create Allergies  .");
    console.error("Allergies   create ERROR:", error);
    return null;
  }
};


export const getPatientTimingAPI = async (patientId, token, selectedMonth) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_PATIENET_TIMING}?patientId=${patientId}&date=${selectedMonth}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // console.log(patientId)
    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data;
  } catch (error) {
    console.error("get patient timing ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients timing!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};





export const updatePatinetVitals = async (data, token, patientId) => {
  try {
    const loadingToastId = toast.loading("Vitals Updating...");

    const response = await apiConnector("PUT", `${UPDATE_PATIENT_VITALS}/${patientId}`, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.update(loadingToastId, {
      render: "Vitals Update!",
      type: "success",
      isLoading: false,
      autoClose: 2500,
      closeButton: true,
    });

    return response.data;
  } catch (error) {
    toast.dismiss(); // Dismiss any loading toast
    toast.error(error?.response?.data?.message || "Failed to update  vitals  .");
    console.error("update vitals   ERROR:", error);
    return null;
  }
};

export const getPatientSummaryAPI = async (patientId, reportType, token,) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_PATIENT_SUMMARY}/${patientId}/summary/ccm?reportType=${reportType}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // console.log(patientId)
    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data;
  } catch (error) {
    console.error("get patient timing ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients timing!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};


export const getPatientRpmSummaryAPI = async (patientId, token, selectedMonth) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_PATIENT_SUMMARY_RPM}/${patientId}/summary`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // console.log(patientId)
    if (!response?.data?.success) {
      throw new Error("No patients found!");
    }

    return response.data;
  } catch (error) {
    console.error("get patient timing ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch patients timing!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};



export const assignBedApi = async (data, token) => {
  const loadingToastId = toast.loading("Bed assigning...");

  try {
    const response = await apiConnector("POST", ASSIGN_BED, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message);
    return response;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to assign bed.");
    console.error("assign bed ERROR:", error);
    return null;
  } finally {
    toast.dismiss(loadingToastId);
  }
};
export const unAssignBedApi = async (patientId, token) => {
  const loadingToastId = toast.loading("Bed unassigning...");

  try {
    const response = await apiConnector(
      "POST",
      `${UNASSIGN_BED}?patientId=${patientId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    toast.success(response?.data?.message);
    return response;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to unassign bed.");
    console.error("unassign bed ERROR:", error);
    return null;
  } finally {
    toast.dismiss(loadingToastId);
  }
};



export const getAllBedsApi = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_BED}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // console.log(patientId)
    if (!response?.data?.success) {
      throw new Error("No bed found!");
    }

    return response.data;
  } catch (error) {
    console.error("get bed  ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch bed!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};
export const sendConsentApi = async (patientId, token) => {
  const loadingToastId = toast.loading("Sending consent...");

  try {
    const response = await apiConnector(
      "GET",
      `${SEND_CONSENCT}?patientId=${patientId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong.");
    }

    toast.dismiss(loadingToastId);
    toast.success("Consent sent successfully!");
    return response.data;
  } catch (error) {
    toast.dismiss(loadingToastId);

    Swal.fire({
      icon: "error",
      title: "Failed to send consent!",
      text: error?.response?.data?.message || "Something went wrong.",
    });

    return null;
  }
};

export const getAllConsentsApi = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_CONSENCT}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    // console.log(patientId)
    if (!response?.data?.success) {
      throw new Error(toast.error(response?.data?.message));
    }

    return response.data;
  } catch (error) {
    console.error("get consect  ERROR:", error);
    Swal.fire({
      icon: "error",
      title: "Failed to fetch consents!",
      text: error?.response?.data?.message || "Something went wrong.",
    });
    return null;
  }
};