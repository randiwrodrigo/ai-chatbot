export interface AiModel {
  id: string;
  label: string;
  size: string;
  description: string;
}

export const AI_MODELS: AiModel[] = [
  {
    id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    label: "SmolLM2 360M",
    size: "~380 MB",
    description: "Smallest & fastest, very basic answers",
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 0.5B",
    size: "~950 MB",
    description: "Fast, but simple answers",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    label: "Llama 3.2 1B",
    size: "~1.1 GB",
    description: "Good default",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 1.5B",
    size: "~1.6 GB",
    description: "Noticeably smarter",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 3B",
    size: "~2.3 GB",
    description: "Best quality, needs a decent GPU",
  },
];

export type ModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_MODEL: ModelId = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

export function isModelId(value: unknown): value is ModelId {
  return AI_MODELS.some((m) => m.id === value);
}

export function getModel(id: ModelId): AiModel {
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS[0];
}
