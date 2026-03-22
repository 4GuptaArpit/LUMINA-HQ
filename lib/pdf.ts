import { createRequire } from "module";
import { get as getBlob } from "@vercel/blob";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

export function isPdfFile(fileType?: string | null, fileName?: string) {
  const normalizedType = (fileType || "").toLowerCase();

  if (normalizedType === "application/pdf") {
    return true;
  }

  return fileName?.toLowerCase().endsWith(".pdf") || false;
}

export async function extractPdfText(file: File) {
  const buffer = new Uint8Array(await file.arrayBuffer());
  return extractPdfTextFromBuffer(buffer);
}

export async function extractPdfTextFromUrl(url: string) {
  const isBlobUrl = url.includes(".blob.vercel-storage.com");

  if (isBlobUrl) {
    const result = await getBlob(url, {
      access: "private",
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new Error("Failed to download PDF for analysis");
    }

    const buffer = new Uint8Array(await new Response(result.stream).arrayBuffer());
    return extractPdfTextFromBuffer(buffer);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to download PDF for analysis");
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  return extractPdfTextFromBuffer(buffer);
}

async function extractPdfTextFromBuffer(buffer: Uint8Array) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text?.trim() || "";
  } finally {
    await parser.destroy();
  }
}
