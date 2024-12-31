import { create } from "zustand";
import { cos_sim } from "@huggingface/transformers";
import { EmbeddingModel } from "@/app/experiment/types/embedding";

function calculateSimilarities(
  questionEmbedding: number[][],
  blocksEmbedding: number[][][]
) {
  if (questionEmbedding.length > 0 && blocksEmbedding.length > 0) {
    const similarities = blocksEmbedding
      .map((blockEmbedding, index) => ({
        index,
        similarity: cos_sim(questionEmbedding[0], blockEmbedding[0]),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return similarities;
  }
  return [];
}

interface EmbeddingState {
  similarities: { index: number; similarity: number }[];
  questionEmbedding: number[][];
  blocksEmbedding: number[][][];
  question: string;
  model: EmbeddingModel;
  worker: Worker | null;
  setQuestionEmbedding: (questionEmbedding: number[][]) => void;
  setBlocksEmbedding: (blocksEmbedding: number[][][]) => void;
  setQuestion: (question: string) => void;
  setModel: (model: EmbeddingModel) => void;
  setWorker: (worker: Worker | null) => void;
}

export const useEmbeddingStore = create<EmbeddingState>((set, get) => ({
  similarities: [],
  questionEmbedding: [],
  blocksEmbedding: [],
  question: "What is the RAG?",
  model: "Snowflake/snowflake-arctic-embed-xs",
  worker: null,
  setQuestionEmbedding: (questionEmbedding) => {
    set({ questionEmbedding });
    const state = get();
    const similarities = calculateSimilarities(
      questionEmbedding,
      state.blocksEmbedding
    );
    set({ similarities: similarities || [] });
  },
  setBlocksEmbedding: (blocksEmbedding) => {
    set({ blocksEmbedding });
    const state = get();
    const similarities = calculateSimilarities(
      state.questionEmbedding,
      blocksEmbedding
    );
    set({ similarities: similarities || [] });
  },
  setQuestion: (question) => set({ question }),
  setModel: (model) => set({ model }),
  setWorker: (worker) => set({ worker }),
}));
