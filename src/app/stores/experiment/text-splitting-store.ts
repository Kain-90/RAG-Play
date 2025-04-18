import { create } from "zustand";
import {
  SplitStrategy,
  EnhancedTextBlock,
} from "@/app/experiment/types/text-splitting";
import { TEXT_SPLITTING_SAMPLE } from "@/app/experiment/constants/sample-texts";
interface TextSplittingState {
  text: string;
  blocks: EnhancedTextBlock[];
  strategy: SplitStrategy;
  chunkSize: number;
  overlap: number;
  setText: (text: string) => void;
  setBlocks: (blocks: EnhancedTextBlock[]) => void;
  setStrategy: (strategy: SplitStrategy) => void;
  setChunkSize: (size: number) => void;
  setOverlap: (overlap: number) => void;
}

export const useTextSplittingStore = create<TextSplittingState>((set) => ({
  text: TEXT_SPLITTING_SAMPLE,
  blocks: [],
  strategy: "recursive-character",
  chunkSize: 500,
  overlap: 50,
  setText: (text) => set({ text }),
  setBlocks: (blocks) => set({ blocks }),
  setStrategy: (strategy) => set({ strategy }),
  setChunkSize: (chunkSize) => set({ chunkSize }),
  setOverlap: (overlap) => set({ overlap }),
}));
