// utils/getImageAsBase64.ts
export const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
    const proxyBaseUrl = `${BASE_URL}/proxy-image`;
    const proxiedImageUrl = `${proxyBaseUrl}?url=${encodeURIComponent(
      imageUrl
    )}`;
    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        } catch (error) {
          console.error("Canvas conversion error:", error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error("Image load failed:", error);
        reject(error);
      };

      img.src = `${proxiedImageUrl}&t=${Date.now()}`;
    });
  } catch (error) {
    console.error("Image conversion failed:", error);
    throw error;
  }
};
