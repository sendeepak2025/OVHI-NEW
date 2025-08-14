import {
  setUser,
  setToken,
  setOtpToken,
  setLoading,
} from "../../redux/authSlice";
import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";
import Swal from "sweetalert2";
import {
  showLoadingToast,
  showSuccess,
  showError,
  closeAlert,
} from "../../components/ui/customAlert";
import { toast } from "react-toastify";

const {
  LOGIN_API,
  SIGNUP_API,
  REGISTER_PROVIDER_API,
  GET_ALL_PROVIDER,
  GET_ALL_USERS,
  PROVIDER_TERMS_UPLOAD_API,
  ENCOUNTER_TEMPLATE_PRARTICE_CREATE_API,
  PROVIDER_PRACTICE_UPDATE_API,
  PROVIDER_VERIFY_PASSWORD_API,
  ADD_RINGCENTRAL_API,
  GET_RINGCENTRAL_API,
  CHANGE_PASSWORD_API,
  FETCH_PROFILE,
  RESET_PASSWORD_TOKEN,
  RESET_TOKEN,
  VERIFY_OTP,
  GET__ALL_ENCOUNTER_TEMPLATE_PRARTICE_API,
  UPDATE_ENCOUNTER_TEMPLATE_PRARTICE_API
} = endpoints;

export async function login(email, password, dispatch, isPatient) {
  showLoadingToast("Logging in...");

  try {
    const response = await apiConnector("POST", LOGIN_API, {
      email,
      password,
      userType: isPatient ? "patient" : "not",
    });
    closeAlert();

    if (!response?.data?.success) {
      await showError("Login Failed", response.data.message);

      throw new Error(response.data.message);
    }

    await showSuccess("You get otp on your email🎉");

    dispatch(setOtpToken(response?.data?.token));
    // dispatch(setUser(response.data.user));
    return response?.data;
  } catch (error) {
    console.log("LOGIN API ERROR............", error);
    showError(
      "Login Failed",
      error?.response?.data?.message || "Please try again later."
    );
  }
}

export async function verifyOtpApi(otp, token, dispatch) {
  showLoadingToast("Logging in...");

  try {
    const response = await apiConnector("POST", VERIFY_OTP, {
      otp,
      token,
    });
    closeAlert();
    if (!response?.data?.success) {
      await showError("Login Failed", response.data.message);

      throw new Error(response.data.message);
    }

    // console.log(response?.data)
    await showSuccess("Welcome!", "Login Successful 🎉");

    // console.log(response)
    dispatch(setToken(response?.data?.token));
    dispatch(setUser(response.data.user));
  } catch (error) {
    console.log("LOGIN API ERROR............", error);
    showError(
      "Login Failed",
      error?.response?.data?.message || "Please try again later."
    );
  }
}

export async function signUp(formData) {
  showLoadingToast("Registering user...");

  try {
    const response = await apiConnector("POST", SIGNUP_API, formData);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    closeAlert(); // ✅ Close loading toast on success
    showSuccess("User registered successfully!", "Have a nice day!");

    return response?.data?.success;
  } catch (error) {
    console.log("SIGNUP API ERROR............", error);

    closeAlert(); // ✅ Close loading toast on error
    showError(
      "Registration Failed",
      error?.response?.data?.message ||
        "Something went wrong. Please try again later."
    );
  }
}

export async function providerTermsUpload(formData, token) {
  // Show loading toast first
  showLoadingToast("Downloading Terms & Conditions...");

  try {
    const response = await apiConnector(
      "POST",
      PROVIDER_TERMS_UPLOAD_API,
      formData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    closeAlert(); // Close loading toast

    // ✅ Show success toast
    showSuccess("Terms & Conditions uploaded successfully");

    return true;
  } catch (error) {
    console.log("UPLOAD ERROR............", error);

    closeAlert(); // Close loading toast on error

    // ❌ Show error toast
    showError(
      "Upload Failed",
      error?.response?.data?.message ||
        "Something went wrong. Please try again later."
    );

    return false;
  }
}


//ENCOUTNER AND PRATICE
export async function providerPracticeUpdate(formData, token, dispatch) {
  try {
    // Show loading toast
    showLoadingToast("Updating Practices...");

    const response = await apiConnector(
      "POST",
      PROVIDER_PRACTICE_UPDATE_API,
      formData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    // Check for backend success flag
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Update failed");
    }
    console.log(response, "res")

    // Update Redux store
    dispatch(setToken(response.data.token));
    dispatch(setUser(response.data.user));

    // Close loader and show success toast
    closeAlert();
    showSuccess("Practices updated successfully");

    return response?.data;
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    // Ensure loading toast is closed even on error
    closeAlert();

    // Show error message
    showError(
      "Update Failed",
      error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again later."
    );

    return false;
  }
}

export const createEncounterTemplatePraticeAPI = async (data, token) => {
  try {
    showLoadingToast("Saving Encounter Template...");

    const response = await apiConnector("POST", ENCOUNTER_TEMPLATE_PRARTICE_CREATE_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Failed to update or fetch Encounter Template!");
    }

    closeAlert(); // close loading
    showSuccess(response?.data?.message );

    return response.data; // success data
  } catch (error) {
    console.error("Add_ENCOUNTER_TEMPLATE_Practish_API ERROR:", error?.response?.data?.error || error.message);

    closeAlert(); // close loading if still active
    showError(error?.response?.data?.error || "Failed to save Encounter Template. Please try again.");

    return null;
  }
};
export const updateEncounterTemplatePraticeAPI = async (data, token) => {
  try {
    showLoadingToast("Updating Encounter Template...");

    const response = await apiConnector("POST", UPDATE_ENCOUNTER_TEMPLATE_PRARTICE_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Failed to update or fetch Encounter Template!");
    }

    closeAlert(); // close loading
    showSuccess(response?.data?.message );

    return response.data; // success data
  } catch (error) {
    console.error("UPDATE_ENCOUNTER_TEMPLATE_API ERROR:", error?.response?.data?.error || error.message);

    closeAlert(); // close loading if still active
    showError(error?.response?.data?.error || "Failed to save Encounter Template. Please try again.");

    return null;
  }
};


export const getAllEncounterTemplatePraticeAPI = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET__ALL_ENCOUNTER_TEMPLATE_PRARTICE_API}`, null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Something went wrong!");
    }

    return response.data;
  } catch (error) {
    console.error("error in get encounter template practisg api ERROR:", error);
    toast.error(error || "Something went wrong.")

    return [];
  }
};

export async function verifyProviderToken(formData) {
  showLoadingToast("Verifying user..."); // 🟢 Updated toast message

  try {
    const response = await apiConnector(
      "POST",
      PROVIDER_VERIFY_PASSWORD_API,
      formData
    );
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Verification failed.");
    }

    showSuccess("User verified successfully!", "Have a nice day!");
    return true;
  } catch (error) {
    console.error("PROVIDER VERIFY API ERROR:", error);

    showError(
      "Verification Failed",
      error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again later."
    );
    return false;
  } finally {
    closeAlert(); // Always close loading toast
  }
}

export async function registerProvider(formData) {
  showLoadingToast("Registering user...");

  try {
    const response = await apiConnector(
      "POST",
      REGISTER_PROVIDER_API,
      formData
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    closeAlert(); // ✅ Close loading toast on success

    // Show Swal success message that stays until user clicks OK
    Swal.fire({
      icon: "success",
      title: response?.data?.message,
      text: "Have a nice day!",
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonText: "OK",
    });

    return response?.data?.success;
  } catch (error) {
    console.log("SIGNUP API ERROR............", error);

    closeAlert(); // ✅ Close loading toast on error
    showError(
      "Registration Failed",
      error?.response?.data?.message ||
        "Something went wrong. Please try again later."
    );
  }
}

export const getAllProvidersAPI = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_PROVIDER}`, // This should point to the correct endpoint
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.providers) {
      throw new Error("No providers found!");
    }

    return response.data; // contains: { success, message, providers }
  } catch (error) {
    console.error("GET_ALL_PROVIDERS_API ERROR:", error);

    return null;
  }
};

export const getAllUsersAPI = async () => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_USERS}` // This should point to the correct endpoint
    );

    if (!response?.data?.success) {
      throw new Error("No providers found!");
    }

    return response.data; // contains: { success, message, providers }
  } catch (error) {
    console.error("GET_ALL_PROVIDERS_API ERROR:", error);
    // Swal.fire({
    //   icon: "error",
    //   title: "Failed to fetch providers!",
    //   text: error?.response?.data?.message || "Something went wrong.",
    // });
    return null;
  }
};

export const createOrGetRingCentralAPI = async (data, token) => {
  try {
    const response = await apiConnector("POST", ADD_RINGCENTRAL_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.data) {
      throw new Error("Failed to create or fetch RingCentral config!");
    }
    // ✅ Success toast
    Swal.fire({
      icon: "success",
      title: response?.data?.message || "RingCentral config fetched/created!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    return response.data; // contains: { message, data }
  } catch (error) {
    console.error(
      "CREATE_OR_GET_RINGCENTRAL_API ERROR:",
      error.response.data.error
    );
    Swal.fire({
      icon: "error",
      title: "RingCentral Config Error",
      text: error?.response?.data?.error || "Something went wrong.",
    });
    return null;
  }
};

export const getRingCentralByProviderIdAPI = async (provider_id, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_RINGCENTRAL_API}/${provider_id}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.data) {
      throw new Error("No config found for this provider!");
    }

    return response.data; // contains: { data }
  } catch (error) {
    console.error("GET_RINGCENTRAL_BY_PROVIDER_ID_API ERROR:", error);

    return null;
  }
};

export const changePasswordAPI = async (data, token) => {
  try {
    const response = await apiConnector("POST", CHANGE_PASSWORD_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Password change failed!");
    }

    Swal.fire({
      icon: "success",
      title: response?.data?.message || "Password changed successfully!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    return response.data;
  } catch (error) {
    console.error(
      "CHANGE_PASSWORD_API ERROR:",
      error?.response?.data || error.message
    );

    Swal.fire({
      icon: "error",
      title: "Password Change Failed",
      text:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong.",
    });

    return null;
  }
};

export function fetchMyProfile(token, navigate) {
  return async (dispatch) => {
    try {
      const response = await apiConnector("GET", FETCH_PROFILE, null, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      });

      // console.log("APP JS RESPONSE............", response)

      if (!response?.data?.success) {
        throw new Error(response?.data?.message);
      }
      // console.log(response.data)

      dispatch(setUser(response?.data?.user));

      localStorage.setItem("user", JSON.stringify(response?.data?.user));
    } catch (error) {
      console.log(
        "LOGIN API ERROR............",
        error?.response?.data?.message
      );

      if (
        error?.response?.data?.message === "Token expired" ||
        error?.response?.data?.message === "token is invalid"
      ) {
        Swal({
          title: "Session Expired",
          text: "Please log in again for security purposes.",
          icon: "warning",
          button: "Login",
        }).then(() => {
          dispatch(logout(navigate));
          navigate("/login"); // Redirect to login page
        });
      }
    }
  };
}

export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null));
    dispatch(setUser(null));

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Swal.fire({
      title: "Logged Out Successfully!",
      text: "Hope to see you again soon 👋",
      icon: "success",
      background: "#f0f0f3",
      color: "#333",
      confirmButtonText: "Take me to Login",
      confirmButtonColor: "#6366F1", // Tailwind's indigo-500
      customClass: {
        popup: "rounded-2xl shadow-lg",
        title: "text-lg font-semibold",
        confirmButton: "px-6 py-2 text-sm",
      },
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });

    navigate("/login");
  };
}

export const getPasswordResetToken = (email, setEmailSent) => {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST", RESET_PASSWORD_TOKEN, {
        email,
      });

      // console.log("RESETPASSTOKEN RESPONSE............", response);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Reset request failed");
      }

      toast.success("Reset Email Sent");
      setEmailSent(true);
    } catch (error) {
      console.log("RESETPASSTOKEN ERROR............", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      toast.error(errorMessage);
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };
};

export const resetPassword = (password, confirmPassword, token, navigate) => {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", RESET_TOKEN, {
        password,
        confirmPassword,
        token,
      });

      // console.log("RESETPASSWORD RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Password Reset Successfully");
      navigate("/login");
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error);
      toast.error("Failed To Reset Password");
    }
    toast.dismiss(toastId);
    dispatch(setLoading(false));
  };
};
