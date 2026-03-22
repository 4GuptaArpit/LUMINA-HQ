import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function analyzeWithGemini(
  text: string,
  analysisType: "summary" | "qa" | "sentiment" | "entities" | "extract",
) {
  if (!ai) {
    throw new Error("Gemini API key is not configured");
  }

  const prompts = {
    summary: `Summarize the following document. Focus on the key ideas, main findings, and important action items.\n\n${text}`,
    qa: `Based on the following document, generate 5 useful question-and-answer pairs.\n\n${text}`,
    sentiment: `Analyze the tone and sentiment of the following document. Explain your reasoning briefly.\n\n${text}`,
    entities: `Extract the important named entities from the following document. Group them by type.\n\n${text}`,
    extract: `Extract the most important structured data from the following document in a clean bullet list.\n\n${text}`,
  } as const;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompts[analysisType],
      config: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    });

    const output = result.text?.trim();

    if (!output) {
      throw new Error("Gemini returned an empty response");
    }

    return output;
  } catch (error: any) {
    console.error("[Lumina-HQ] Gemini Error:", error);
    throw new Error(error?.message || `Analysis failed for ${analysisType}`);
  }
}
