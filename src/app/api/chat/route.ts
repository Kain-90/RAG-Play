import { streamText } from "ai";
import { getChatModel } from "@/lib/llm";

export async function POST(req: Request) {
  const { messages, system, modelConfig } = await req.json();

  const result = streamText({
    model: getChatModel(),
    system,
    messages,
    temperature: modelConfig.temperature,
    maxTokens: modelConfig.maxTokens,
  });

  return result.toDataStreamResponse();
}
