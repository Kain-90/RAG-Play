import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import AppConfig from "@/app/config";

export async function POST(req: Request) {
  const { messages, system, modelConfig } = await req.json();

  const result = streamText({
    model: groq(AppConfig.groq.model),
    system,
    messages,
    temperature: modelConfig.temperature,
    maxTokens: modelConfig.maxTokens,
  });

  return result.toDataStreamResponse();
}
