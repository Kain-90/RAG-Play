export const SYSTEM_PROMPT_TEMPLATE = (context: string) => `
You are a helpful AI assistant. Use the following pieces of context to answer the user's question. 
If you don't know the answer, just say that you don't know. Don't try to make up an answer.

Context:
${context}`.trim();

export const USER_PROMPT_TEMPLATE = (question: string) => {
  return `${question}`;
};
