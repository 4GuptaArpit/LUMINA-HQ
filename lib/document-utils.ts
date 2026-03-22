const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "",
  "unknown",
]);

const TEXT_EXTENSIONS = new Set([".txt", ".md"]);
const UNSUPPORTED_EXTRACTION_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const UNSUPPORTED_EXTRACTION_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
]);

function getFileExtension(fileName?: string) {
  return fileName?.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
    : "";
}

export function canExtractTextFromFile(fileType?: string | null, fileName?: string) {
  const normalizedType = (fileType || "").toLowerCase();

  if (TEXT_MIME_TYPES.has(normalizedType)) {
    return true;
  }

  const extension = getFileExtension(fileName);

  return TEXT_EXTENSIONS.has(extension);
}

export function requiresUnsupportedTextExtraction(
  fileType?: string | null,
  fileName?: string,
) {
  const normalizedType = (fileType || "").toLowerCase();

  if (UNSUPPORTED_EXTRACTION_MIME_TYPES.has(normalizedType)) {
    return true;
  }

  const extension = getFileExtension(fileName);
  return UNSUPPORTED_EXTRACTION_EXTENSIONS.has(extension);
}
