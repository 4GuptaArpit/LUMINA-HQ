import { createRequire } from "module";
import { get as getBlob } from "@vercel/blob";

const require = createRequire(import.meta.url);

function ensurePdfRuntimeGlobals() {
  try {
    const {
      DOMMatrix,
      DOMPoint,
      DOMRect,
      ImageData,
      Path2D,
    } = require("@napi-rs/canvas");

    if (typeof globalThis.DOMMatrix === "undefined") {
      globalThis.DOMMatrix = DOMMatrix;
    }

    if (typeof globalThis.DOMPoint === "undefined") {
      globalThis.DOMPoint = DOMPoint;
    }

    if (typeof globalThis.DOMRect === "undefined") {
      globalThis.DOMRect = DOMRect;
    }

    if (typeof globalThis.ImageData === "undefined") {
      globalThis.ImageData = ImageData;
    }

    if (typeof globalThis.Path2D === "undefined") {
      globalThis.Path2D = Path2D;
    }
  } catch {
    // If the canvas polyfill is unavailable, pdf-parse will throw a clearer error on use.
  }
}

function getPdfParse() {
  ensurePdfRuntimeGlobals();
  return require("pdf-parse") as {
    PDFParse: new (options: { data: Uint8Array }) => {
      getText(): Promise<{ text?: string }>;
      destroy(): Promise<void>;
    };
  };
}

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
  const { PDFParse } = getPdfParse();
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text?.trim() || "";
  } finally {
    await parser.destroy();
  }
}
