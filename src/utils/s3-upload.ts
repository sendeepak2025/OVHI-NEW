import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = import.meta.env.VITE_AWS_REGION || "us-east-1";
const ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "";
const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME || "varn-dev";

// Validate environment variables
if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.warn("AWS credentials not found in environment variables");
}

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export const uploadBlobToS3 = async (
  blob: Blob,
  fileName: string
): Promise<string> => {
  try {
    // Validate inputs
    if (!blob || blob.size === 0) {
      throw new Error("Invalid blob provided");
    }

    if (!fileName) {
      throw new Error("File name is required");
    }

    // Validate environment variables
    if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
      throw new Error(
        "Missing AWS configuration. Please check your environment variables."
      );
    }

    console.log("🚀 Starting S3 upload...");
    console.log("📁 File name:", fileName);
    console.log("📊 File size:", blob.size, "bytes");
    console.log("🪣 Bucket:", S3_BUCKET_NAME);
    console.log("🌍 Region:", REGION);

    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Create a more organized key structure
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const key = `pcm-assessments/${timestamp}/${fileName}`;

    console.log("🔑 S3 Key:", key);

    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: uint8Array,
      ContentType: "application/pdf",
      // Add metadata for better organization
      Metadata: {
        uploadedAt: new Date().toISOString(),
        fileType: "pcm-assessment",
        originalName: fileName,
      },
    };

    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);

    console.log("✅ Upload successful:", response);

    // Construct the public URL
    const s3Url = `https://${S3_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    console.log("🔗 Public URL:", s3Url);

    return s3Url;
  } catch (error) {
    console.error("❌ S3 Upload Error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("credentials")) {
        throw new Error(
          "AWS credentials are invalid or missing. Please check your environment variables."
        );
      } else if (error.message.includes("bucket")) {
        throw new Error(
          `S3 bucket '${S3_BUCKET_NAME}' not found or access denied.`
        );
      } else if (error.message.includes("region")) {
        throw new Error(`Invalid AWS region '${REGION}' specified.`);
      } else {
        throw new Error(`S3 upload failed: ${error.message}`);
      }
    }

    throw new Error("Unknown error occurred during S3 upload");
  }
};
