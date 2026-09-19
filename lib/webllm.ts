import type {
  ChatCompletionMessageParam,
  InitProgressReport,
  MLCEngine,
} from "@mlc-ai/web-llm";

let engine: MLCEngine | null = null;
let loadedModelId: string | null = null;
let loadingPromise: Promise<MLCEngine> | null = null;

export function isWebGPUSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function isModelCached(modelId: string): Promise<boolean> {
  const webllm = await import("@mlc-ai/web-llm");
  return webllm.hasModelInCache(modelId);
}

export async function deleteModelFromCache(modelId: string): Promise<void> {
  const webllm = await import("@mlc-ai/web-llm");
  await webllm.deleteModelAllInfoInCache(modelId);
}

export async function loadWebLLMModel(
  modelId: string,
  onProgress: (report: InitProgressReport) => void,
): Promise<MLCEngine> {
  if (engine && loadedModelId === modelId) {
    return engine;
  }

  if (loadingPromise) {
    await loadingPromise.catch(() => {});
  }

  const load = async () => {
    const webllm = await import("@mlc-ai/web-llm");

    if (!engine) {
      engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: onProgress,
      });
    } else {
      engine.setInitProgressCallback(onProgress);
      await engine.reload(modelId);
    }

    loadedModelId = modelId;
    return engine;
  };

  loadingPromise = load();
  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

export async function* streamWebLLMChat(
  messages: ChatCompletionMessageParam[],
): AsyncGenerator<string> {
  if (!engine) {
    throw new Error("No WebLLM model is loaded yet");
  }

  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
