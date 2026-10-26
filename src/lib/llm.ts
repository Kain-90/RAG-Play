import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import type { LanguageModelV1 } from "ai";
import { createFallback } from "ai-fallback";

import AppConfig, { LLM_PROVIDERS, type LlmProvider } from "@/app/config";

/** How long to stay on a fallback provider before trying the first one again. */
const MODEL_RESET_INTERVAL_MS = 60_000;

const createProviderModel = (provider: LlmProvider, apiKey: string): LanguageModelV1 => {
  if (provider === "mistral") {
    return createMistral({ apiKey })(AppConfig.mistral.model);
  }
  return createGroq({ apiKey })(AppConfig.groq.model);
};

const createChatModel = (): LanguageModelV1 => {
  const models = LLM_PROVIDERS.flatMap((provider) => {
    const { apiKey } = AppConfig[provider];
    return apiKey ? [createProviderModel(provider, apiKey)] : [];
  });

  if (models.length === 0) {
    throw new Error("No LLM provider is configured: set GROQ_API_KEY and/or MISTRAL_API_KEY");
  }

  return createFallback({
    models,
    modelResetInterval: MODEL_RESET_INTERVAL_MS,
    onError: (error, modelId) => {
      console.warn(`[llm] ${modelId} failed, trying next provider: ${error.message}`);
    },
  });
};

// Created once per server instance so the fallback remembers which provider is
// currently rate-limited instead of starting from Groq on every request.
let chatModel: LanguageModelV1 | undefined;

/**
 * Returns the chat model: providers in `LLM_PROVIDERS` order (Groq first, Mistral
 * as backup), skipping any without an API key. A 429 or server error on one
 * provider moves the request to the next.
 */
export const getChatModel = (): LanguageModelV1 => {
  chatModel ??= createChatModel();
  return chatModel;
};
