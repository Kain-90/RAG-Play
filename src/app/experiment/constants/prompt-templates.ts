export const CONTEXT_PROMPT_TEMPLATE = `
Please answer the user's question based on the following context. If an answer cannot be found in the context, please clearly state so.

# Context:
{context}

# User question:
{question}

Please provide a detailed answer:
`.trim()
