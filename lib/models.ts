export type ModelCategory = "general" | "coding";

export const MODEL_CATEGORY_LABELS: Record<ModelCategory, string> = {
  general: "General & Writing",
  coding: "Coding",
};

export interface AiModel {
  id: string;
  label: string;
  /** Approximate download size on disk. */
  size: string;
  /** Approximate GPU memory needed to run the model. */
  vram: string;
  category: ModelCategory;
  description: string;
}

export const AI_MODELS: AiModel[] = [
  {
    id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    label: "SmolLM2 360M",
    size: "~207 MB",
    vram: "~380 MB",
    category: "general",
    description: "Smallest & fastest, very basic answers",
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 0.5B",
    size: "~290 MB",
    vram: "~950 MB",
    category: "general",
    description: "Fast, but simple answers",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    label: "Llama 3.2 1B",
    size: "~705 MB",
    vram: "~1.1 GB",
    category: "general",
    description: "Good default",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 1.5B",
    size: "~880 MB",
    vram: "~1.6 GB",
    category: "general",
    description: "Noticeably smarter",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 3B",
    size: "~1.8 GB",
    vram: "~2.3 GB",
    category: "general",
    description: "Best quality, needs a decent GPU",
  },
  {
    id: "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 Coder 1.5B",
    size: "~880 MB",
    vram: "~1.6 GB",
    category: "coding",
    description: "Lightweight help with code",
  },
  {
    id: "Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 Coder 3B",
    size: "~1.8 GB",
    vram: "~2.5 GB",
    category: "coding",
    description: "Balanced speed and code quality",
  },
  {
    id: "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 Coder 7B",
    size: "~4.3 GB",
    vram: "~5.1 GB",
    category: "coding",
    description: "Best for writing and explaining code",
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
