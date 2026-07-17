import { google } from "@/lib/ai";
import { generateText  } from "ai";
import test from "node:test";

export async function POST(request: Request) {
  try {
    // Get the user's message from the request body
    const { message } = await request.json();

    if (!message?.trim()) {
        return Response.json(
            { error: "Message is required." },
            { status: 400 }
        );
    }

    // Generate a response from Gemini
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: message,
    });

    return Response.json({
      message: text,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}