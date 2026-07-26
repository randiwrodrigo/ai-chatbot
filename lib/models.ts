export const AI_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gpt-4o", label: "GPT-4o" },
] as const;

export type ModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_MODEL: ModelId = "gemini-2.5-flash";

export function isModelId(value: unknown): value is ModelId {
  return AI_MODELS.some((m) => m.id === value);
}
