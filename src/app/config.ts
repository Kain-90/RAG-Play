/** Fallback order: the first provider with an API key is tried first. */
export const LLM_PROVIDERS = ["groq", "mistral"] as const;

export type LlmProvider = (typeof LLM_PROVIDERS)[number];

export interface LlmProviderConfig {
  apiKey: string | undefined;
  model: string;
}

export default class AppConfig {
  static readonly groq: LlmProviderConfig = {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
  };

  static readonly mistral: LlmProviderConfig = {
    apiKey: process.env.MISTRAL_API_KEY,
    model: process.env.MISTRAL_MODEL || "ministral-14b-latest",
  };

  static readonly googleSiteVerificationId =
    process.env.GOOGLE_SITE_VERIFICATION_ID;
}
