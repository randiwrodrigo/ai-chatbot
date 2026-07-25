import { google } from "@/lib/ai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
