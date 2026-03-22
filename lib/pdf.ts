import { createRequire } from "module";

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
