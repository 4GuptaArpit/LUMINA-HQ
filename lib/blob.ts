// lib/blob.ts
import { put, del } from "@vercel/blob";

export function buildBlobPathname(
  fileName: string,
  organizationId: string,
  userId: string,
) {
  const sanitizedName = fileName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
  const filename = `${Date.now()}-${sanitizedName || "upload"}`;

  return `org-${organizationId}/user-${userId}/${filename}`;
}

export async function uploadToBlob(
  file: File,
  organizationId: string,
  userId: string,
): Promise<{ url: string; downloadUrl: string; pathname: string }> {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      throw new Error("Blob storage is not configured");
    }

    const pathname = buildBlobPathname(file.name, organizationId, userId);

    const blob = await put(pathname, file, {
      access: "private",
      token,
    });

    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error("Blob upload error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to upload file");
  }
}

export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });
  } catch (error) {
    console.error("Blob delete error:", error);
    throw new Error("Failed to delete file");
  }
}
