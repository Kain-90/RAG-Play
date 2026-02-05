import { create } from "zustand";
import { cos_sim } from "@huggingface/transformers";
import { EmbeddingModel } from "@/app/experiment/types/embedding";
import { DEFAULT_QUESTION, DEFAULT_MODEL } from "@/app/experiment/constants/embedding";

interface SimilarityResult {
  index: number;
  similarity: number;
}

function calculateSimilarities(
  questionEmbedding: number[][],
  blocksEmbedding: number[][][]
): SimilarityResult[] {
  if (questionEmbedding.length === 0) {
    console.warn("Cannot calculate similarities: question embedding is empty");
    return [];
  }

  if (blocksEmbedding.length === 0) {
    console.warn("Cannot calculate similarities: blocks embedding is empty");
    return [];
  }

  const similarities = blocksEmbedding
    .map((blockEmbedding, index) => ({
      index,
      similarity: cos_sim(questionEmbedding[0], blockEmbedding[0]),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  return similarities;
}

interface EmbeddingState {
  similarities: SimilarityResult[];
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
  recalculateSimilarities: () => void;
}

export const useEmbeddingStore = create<EmbeddingState>((set, get) => ({
  similarities: [],
  questionEmbedding: [],
  blocksEmbedding: [],
  question: DEFAULT_QUESTION,
  model: DEFAULT_MODEL,
  worker: null,
  setQuestionEmbedding: (questionEmbedding) =>
    set({ questionEmbedding }),
  setBlocksEmbedding: (blocksEmbedding) =>
    set({ blocksEmbedding }),
  setQuestion: (question) => set({ question }),
  setModel: (model) => set({ model }),
  setWorker: (worker) => set({ worker }),
  recalculateSimilarities: () => {
    const { questionEmbedding, blocksEmbedding } = get();
    const similarities = calculateSimilarities(
      questionEmbedding,
      blocksEmbedding
    );
    set({ similarities });
  },
}));
