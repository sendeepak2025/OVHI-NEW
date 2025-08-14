import { apiConnector } from "../apiConnector";
import { image } from "../apis";
import { toast } from 'react-toastify';

const { IMAGE_UPLOAD } = image


export const imageUpload = async (data) => {
    let result = [];
    // console.log(data);
    const toastId = toast.loading("Uploading...");
    try {
        const formData = new FormData();
        for (let i = 0; i < data.length; i++) {
            formData.append("thumbnail", data[i]);
        }
        const response = await apiConnector("POST", IMAGE_UPLOAD, formData);

        if (!response?.data?.success) {
            throw new Error("Could Not Upload Image");
        }

        toast.success("Image Uploaded Successfully");
        result = response?.data?.images?.map(img => img.url); // Cloudinary Public URL

    } catch (error) {
        console.log("IMAGE UPLOAD ERROR:", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
    return result;
};







