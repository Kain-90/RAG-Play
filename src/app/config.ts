export type GroqChatModelId =
  | "gemma2-9b-it"
  | "gemma-7b-it"
  | "llama3-groq-70b-8192-tool-use-preview"
  | "llama3-groq-8b-8192-tool-use-preview"
  | "llama-3.1-70b-versatile"
  | "llama-3.1-8b-instant"
  | "llama-3.2-1b-preview"
  | "llama-3.2-3b-preview"
  //   | "llama-3.2-11b-vision-preview"
  //   | "llama-3.2-90b-vision-preview"
  | "llama-guard-3-8b"
  | "llama3-70b-8192"
  | "llama3-8b-8192"
  | "mixtral-8x7b-32768"
  | (string & {});

export default class AppConfig {
  static readonly groq = {
    apiKey: process.env.GROQ_API_KEY!,
    model: process.env.GROQ_MODEL! as GroqChatModelId,
  };

  static readonly googleSiteVerificationId =
    process.env.GOOGLE_SITE_VERIFICATION_ID;
}
