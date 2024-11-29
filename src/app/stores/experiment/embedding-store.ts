import { create } from 'zustand'
import { EmbeddingModel } from '@/app/experiment/types/embedding'

interface EmbeddingState {
  similarities: { index: number; similarity: number }[]
  questionEmbedding: number[][]
  blocksEmbedding: number[][][]
  question: string
  model: EmbeddingModel
  worker: Worker | null
  setSimilarities: (similarities: { index: number; similarity: number }[]) => void
  setQuestionEmbedding: (questionEmbedding: number[][]) => void
  setBlocksEmbedding: (blocksEmbedding: number[][][]) => void
  setQuestion: (question: string) => void
  setModel: (model: EmbeddingModel) => void
  setWorker: (worker: Worker | null) => void
}

export const useEmbeddingStore = create<EmbeddingState>((set) => ({
  similarities: [],
  questionEmbedding: [],
  blocksEmbedding: [],
  question: "What is the RAG?",
  model: "Snowflake/snowflake-arctic-embed-xs",
  worker: null,
  setSimilarities: (similarities) => set({ similarities }),
  setQuestionEmbedding: (questionEmbedding) => set({ questionEmbedding }),
  setBlocksEmbedding: (blocksEmbedding) => set({ blocksEmbedding }),
  setQuestion: (question) => set({ question }),
  setModel: (model) => set({ model }),
  setWorker: (worker) => set({ worker }),
})) 
