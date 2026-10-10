import { create } from "zustand";
import {
  SplitStrategy,
  EnhancedTextBlock,
  Separator,
  DEFAULT_FIXED_SEPARATOR,
  DEFAULT_RECURSIVE_SEPARATORS,
} from "@/app/experiment/types/text-splitting";
import { TEXT_SPLITTING_SAMPLE } from "@/app/experiment/constants/sample-texts";
interface TextSplittingState {
  text: string;
  blocks: EnhancedTextBlock[];
  strategy: SplitStrategy;
  parentChunkSize: number;
  chunkSize: number;
  overlap: number;
  /** Fixed Character uses exactly one separator. */
  fixedSeparator: Separator;
  /** Recursive and Parent-Child try these in order. */
  recursiveSeparators: Separator[];
  textareaRef: React.RefObject<HTMLTextAreaElement> | null;
  hoveredChunkIndex: number | null;
  setText: (text: string) => void;
  setBlocks: (blocks: EnhancedTextBlock[]) => void;
  setStrategy: (strategy: SplitStrategy) => void;
  setParentChunkSize: (parentChunkSize: number) => void;
  setChunkSize: (size: number) => void;
  setOverlap: (overlap: number) => void;
  setFixedSeparator: (separator: Separator) => void;
  addRecursiveSeparator: (separator: Separator) => void;
  removeRecursiveSeparator: (char: string) => void;
  resetFixedSeparator: () => void;
  resetRecursiveSeparators: () => void;
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
  fixedSeparator: DEFAULT_FIXED_SEPARATOR,
  recursiveSeparators: DEFAULT_RECURSIVE_SEPARATORS,
  textareaRef: null,
  hoveredChunkIndex: null,
  setText: (text) => set({ text }),
  setBlocks: (blocks) => set({ blocks }),
  setStrategy: (strategy) => set({ strategy }),
  setParentChunkSize: (parentChunkSize) => set({ parentChunkSize }),
  setChunkSize: (chunkSize) => set({ chunkSize }),
  setOverlap: (overlap) => set({ overlap }),
  setFixedSeparator: (fixedSeparator) => set({ fixedSeparator }),
  addRecursiveSeparator: (separator) =>
    set((state) =>
      state.recursiveSeparators.some(({ char }) => char === separator.char)
        ? state
        : { recursiveSeparators: [...state.recursiveSeparators, separator] }
    ),
  // The splitter needs at least one separator, so the last one stays.
  removeRecursiveSeparator: (char) =>
    set((state) =>
      state.recursiveSeparators.length <= 1
        ? state
        : {
            recursiveSeparators: state.recursiveSeparators.filter(
              (separator) => separator.char !== char
            ),
          }
    ),
  resetFixedSeparator: () => set({ fixedSeparator: DEFAULT_FIXED_SEPARATOR }),
  resetRecursiveSeparators: () =>
    set({ recursiveSeparators: DEFAULT_RECURSIVE_SEPARATORS }),
  setTextareaRef: (textareaRef) => set({ textareaRef }),
  setHoveredChunkIndex: (hoveredChunkIndex) => set({ hoveredChunkIndex }),
}));
