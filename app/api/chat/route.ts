import { models } from "@/lib/ai";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(request: Request) {
  const { messages, model }: { messages: UIMessage[]; model?: string } =
    await request.json();

  const modelId = isModelId(model) ? model : DEFAULT_MODEL;

  const result = streamText({
    model: models[modelId],
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
