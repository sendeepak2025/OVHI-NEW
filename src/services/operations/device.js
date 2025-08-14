import { toast } from "react-toastify";
import { apiConnector } from "../apiConnector";
import { device } from "../apis";


const {
    GET_ALL_DEVICE,
    ASSIGN_DEVICE,
    GET_PATIENT_DEVICE
} = device


export const getAllDevices = async (token, imei) => {
    try {
        const response = await apiConnector(
            "GET",
            `${GET_ALL_DEVICE}?imei=${imei}`,
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
        console.error("get device :", error);
        toast.error(error?.response?.data?.message || "Something went wrong.")

        return null;
    }
};
export const getPatientDevice = async (token, patientId) => {
    try {
        const response = await apiConnector(
            "GET",
            `${GET_PATIENT_DEVICE}?patientId=${patientId}`,
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
        console.error("get patient  device :", error);
        toast.error(error?.response?.data?.message || "Something went wrong.")

        return null;
    }
};
export const assignDeviceToPatientApi = async (data, token) => {
    const loadingToastId = toast.loading("Assigning device to patient...");

    try {
        const response = await apiConnector(
            "POST",
            `${ASSIGN_DEVICE}`,
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
        return response.data;

    } catch (error) {
        console.error("assign device :", error);
        toast.error(error?.response?.data?.message || "Something went wrong.", {
            id: loadingToastId,
        });
        return null;

    }
    finally {
        // Optional: auto-dismiss after success or error if not already handled
        toast.dismiss(loadingToastId);
    }
};
