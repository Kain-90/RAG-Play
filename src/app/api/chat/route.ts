import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import AppConfig from "@/app/config";

export async function POST(req: Request) {
  const { messages, system } = await req.json();

  const result = streamText({
    model: groq(AppConfig.groq.model),
    system,
    messages,
  });
  // FIXME: recursive splitting chunks can't be handled

  return result.toDataStreamResponse();
}
