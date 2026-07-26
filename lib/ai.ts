import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { ModelId } from "./models";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const models: Record<ModelId, LanguageModel> = {
  "gemini-2.5-flash": google("gemini-2.5-flash"),
  "gpt-4o": openai("gpt-4o"),
};
