import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParsePkg = require("pdf-parse");

let pdfParse = pdfParsePkg;
if (pdfParsePkg.default && typeof pdfParsePkg.default === "function") {
  pdfParse = pdfParsePkg.default;
} else if (typeof pdfParsePkg !== "function") {
  for (const key in pdfParsePkg) {
    if (typeof pdfParsePkg[key] === "function") {
      pdfParse = pdfParsePkg[key];
      break;
    }
  }
}

console.log("pdf-parse loaded, type:", typeof pdfParse);

let ocrSpaceApiKey = null;
let initialized = false;

const OCR_SPACE_API_URL = "https://api.ocr.space/parse/image";

const initializeOcrSpace = () => {
  if (initialized) return;
  initialized = true;

  const ocrKey = process.env.OCR_SPACE_API_KEY || "helloworld";
  if (ocrKey) {
    ocrSpaceApiKey = ocrKey;
    console.log("OCR.space API configured (fallback enabled)");
  } else {
    console.warn("OCR.space API key not configured");
  }
};

const normalizeExtractedText = (text) => text.replace(/\s+/g, " ").trim().substring(0, 2500);

const extractUsingPdfParse = async (source) => {
  console.log("Attempting to extract text using pdf-parse...");

  const dataBuffer = Buffer.isBuffer(source) ? source : fs.readFileSync(source);
  console.log("  Buffer size:", dataBuffer.length);

  let data;
  try {
    data = await pdfParse(dataBuffer);
  } catch (e) {
    if (e.message?.includes("cannot be invoked without 'new'")) {
      const instance = new pdfParse(dataBuffer);
      data = await (instance.promise ?? instance);
    } else {
      throw e;
    }
  }

  const rawText = data?.text ?? "";
  console.log("  text length:", rawText.length);

  if (!rawText || rawText.trim().length < 20) {
    throw new Error(
      `PDF appears image-based or empty (${rawText.trim().length} chars), OCR fallback needed.`
    );
  }

  return normalizeExtractedText(rawText);
};

const extractUsingOcrSpace = async (source) => {
  if (!ocrSpaceApiKey) throw new Error("OCR.space API not configured");

  const fileBuffer = Buffer.isBuffer(source) ? source : fs.readFileSync(source);
  console.log("Attempting OCR extraction using OCR.space...");
  console.log("  Buffer size:", fileBuffer.length);

  const formData = new FormData();
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("isTable", "false");
  formData.append("scale", "true");
  formData.append("detectOrientation", "true");
  formData.append("filetype", "PDF");
  formData.append("file", new Blob([fileBuffer], { type: "application/pdf" }), "resume.pdf");

  const res = await fetch(OCR_SPACE_API_URL, {
    method: "POST",
    headers: { apikey: ocrSpaceApiKey },
    body: formData,
  });

  const bodyText = await res.text();
  let payload = null;
  try {
    payload = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const apiError = new Error(`OCR.space request failed: ${res.status} - ${bodyText}`);
    apiError.statusCode = res.status;
    apiError.code = "OCR_SPACE_HTTP_ERROR";
    throw apiError;
  }

  if (payload?.IsErroredOnProcessing) {
    const message = Array.isArray(payload?.ErrorMessage)
      ? payload.ErrorMessage.join(" ")
      : payload?.ErrorMessage || payload?.ErrorDetails || "OCR.space processing failed.";

    const processingError = new Error(`OCR.space processing failed: ${message}`);
    processingError.statusCode = 503;
    processingError.code = "OCR_SPACE_PROCESSING_ERROR";
    throw processingError;
  }

  const parsedResults = Array.isArray(payload?.ParsedResults) ? payload.ParsedResults : [];
  const combinedText = parsedResults.map((item) => item?.ParsedText || "").join("\n").trim();

  console.log("OCR.space extracted text length:", combinedText.length);

  if (!combinedText || combinedText.length < 20) {
    const insufficientError = new Error("OCR.space returned too little text.");
    insufficientError.statusCode = 422;
    insufficientError.code = "OCR_SPACE_INSUFFICIENT_TEXT";
    throw insufficientError;
  }

  return normalizeExtractedText(combinedText);
};

export const extractTextFromPDF = async (source) => {
  initializeOcrSpace();

  try {
    return await extractUsingPdfParse(source);
  } catch (pdfParseError) {
    console.log("pdf-parse failed, using OCR.space fallback. Reason:", pdfParseError.message);
  }

  try {
    return await extractUsingOcrSpace(source);
  } catch (ocrError) {
    console.error("OCR fallback failed:", ocrError.message);

    if (ocrError.statusCode) {
      throw ocrError;
    }

    const unavailableError = new Error(
      "Unable to OCR this PDF right now. Please try again in a minute or use a text-based PDF."
    );
    unavailableError.statusCode = 503;
    unavailableError.code = "OCR_SPACE_UNAVAILABLE";
    throw unavailableError;
  }
};
