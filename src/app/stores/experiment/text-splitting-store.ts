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
  parentChunkSize: number;
  chunkSize: number;
  overlap: number;
  textareaRef: React.RefObject<HTMLTextAreaElement> | null;
  hoveredChunkIndex: number | null;
  setText: (text: string) => void;
  setBlocks: (blocks: EnhancedTextBlock[]) => void;
  setStrategy: (strategy: SplitStrategy) => void;
  setParentChunkSize: (parentChunkSize: number) => void;
  setChunkSize: (size: number) => void;
  setOverlap: (overlap: number) => void;
  setTextareaRef: (textareaRef: React.RefObject<HTMLTextAreaElement> | null) => void;
  setHoveredChunkIndex: (hoveredChunkIndex: number | null) => void;
}

export const useTextSplittingStore = create<TextSplittingState>((set) => ({
  text: TEXT_SPLITTING_SAMPLE,
  blocks: [],
  strategy: "recursive-character",
  parentChunkSize: 1024,
  chunkSize: 500,
  overlap: 50,
  textareaRef: null,
  hoveredChunkIndex: null,
  setText: (text) => set({ text }),
  setBlocks: (blocks) => set({ blocks }),
  setStrategy: (strategy) => set({ strategy }),
  setParentChunkSize: (parentChunkSize) => set({ parentChunkSize }),
  setChunkSize: (chunkSize) => set({ chunkSize }),
  setOverlap: (overlap) => set({ overlap }),
  setTextareaRef: (textareaRef) => set({ textareaRef }),
  setHoveredChunkIndex: (hoveredChunkIndex) => set({ hoveredChunkIndex }),
}));
