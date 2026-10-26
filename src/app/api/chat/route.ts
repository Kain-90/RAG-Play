import { APICallError, streamText } from "ai";
import type { LanguageModelV1 } from "ai";
import { getChatModel } from "@/lib/llm";

const RATE_LIMIT_MESSAGE =
  "All free LLM providers are rate-limited right now. Please wait a minute and try again.";
const GENERIC_ERROR_MESSAGE = "The model couldn't generate an answer. Please try again.";

/** Turns a provider error into a message that is safe to show in the browser. */
const getClientErrorMessage = (error: unknown): string => {
  if (APICallError.isInstance(error) && error.statusCode === 429) {
    return RATE_LIMIT_MESSAGE;
  }
  console.error("[chat] generation failed:", error);
  return GENERIC_ERROR_MESSAGE;
};

export async function POST(req: Request) {
  const { messages, system, modelConfig } = await req.json();

  let model: LanguageModelV1;
  try {
    model = getChatModel();
  } catch (error) {
    console.error("[chat]", error);
    return new Response("The chat model isn't configured on the server.", { status: 500 });
  }

  const result = streamText({
    model,
    system,
    messages,
    temperature: modelConfig.temperature,
    maxTokens: modelConfig.maxTokens,
    // Fail fast on a 429 so ai-fallback can move on to the next provider
    // instead of waiting through the SDK's backoff retries.
    maxRetries: 0,
  });

  return result.toDataStreamResponse({ getErrorMessage: getClientErrorMessage });
}
