export const EMBEDDING_CONSTANTS = {
  DEBOUNCE_MS: 500,
  SELECTOR_WIDTH: 400,
  CHUNK_LIST_HEIGHT: 600,
  MIN_INPUT_HEIGHT: 80,
  EMBEDDING_PREVIEW_COUNT: 8,
  SIMILARITY_TOP_N: 10,
  /** How many top matches the chart links to the question with dashed lines. */
  CHART_LINK_TOP_N: 5,
  MIN_EMBEDDING_POINTS: 3,
} as const;

export type EmbeddingConstantKey = keyof typeof EMBEDDING_CONSTANTS;
