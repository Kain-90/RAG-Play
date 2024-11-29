import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import AppConfig from "@/app/config";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq(AppConfig.groq.model),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
