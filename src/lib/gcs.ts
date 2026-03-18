import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const bucketName = process.env.GCS_BUCKET_NAME || "";

/**
 * Generates a signed URL for a GCS object path.
 * If the input is already a full public URL, it extracts the path.
 */
export async function getSignedUrl(filePathOrUrl: string | null): Promise<string | null> {
  if (!filePathOrUrl) return null;

  try {
    let filePath = filePathOrUrl;

    // If it's a full public URL, extract the path after the bucket name
    if (filePathOrUrl.startsWith("https://storage.googleapis.com/")) {
      const parts = filePathOrUrl.replace("https://storage.googleapis.com/", "").split("/");
      // parts[0] is the bucket name, the rest is the path
      filePath = parts.slice(1).join("/");
    }

    const [url] = await storage
      .bucket(bucketName)
      .file(filePath)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });

    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return filePathOrUrl; // Fallback to original
  }
}
