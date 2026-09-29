import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import type { LanguageModelV1 } from "ai";

import AppConfig, { LLM_PROVIDERS, type LlmProvider } from "@/app/config";

const isLlmProvider = (value: string): value is LlmProvider =>
  (LLM_PROVIDERS as readonly string[]).includes(value);

const requireApiKey = (apiKey: string | undefined, envName: string): string => {
  if (!apiKey) {
    throw new Error(`${envName} is not set`);
  }
  return apiKey;
};

/** Resolves the chat model from `LLM_PROVIDER` and that provider's `*_MODEL`. */
export const getChatModel = (): LanguageModelV1 => {
  const provider = AppConfig.llmProvider;

  if (!isLlmProvider(provider)) {
    throw new Error(
      `Unsupported LLM_PROVIDER "${provider}", expected one of: ${LLM_PROVIDERS.join(", ")}`
    );
  }

  if (provider === "mistral") {
    const { apiKey, model } = AppConfig.mistral;
    return createMistral({ apiKey: requireApiKey(apiKey, "MISTRAL_API_KEY") })(model);
  }

  const { apiKey, model } = AppConfig.groq;
  return createGroq({ apiKey: requireApiKey(apiKey, "GROQ_API_KEY") })(model);
};
