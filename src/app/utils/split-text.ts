import {
  SplitStrategy,
  EnhancedTextBlock,
  Separator,
} from "@/app/experiment/types/text-splitting";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";

type SplitTextResult = {
  blocks: EnhancedTextBlock[];
  error?: Error;
};

export const splitText = async (
  text: string,
  strategy: SplitStrategy,
  options: {
    chunkSize: number;
    overlap: number;
    separators: Separator | Separator[];
    parentChunkSize?: number;
  }
): Promise<SplitTextResult> => {
  try {
    // Validate input text
    if (!text || text.trim().length === 0) {
      return {
        blocks: [],
      };
    }

    let splitter;
    switch (strategy) {
      case "character":
        splitter = new CharacterTextSplitter({
          chunkSize: options.chunkSize,
          chunkOverlap: options.overlap,
          separator: Array.isArray(options.separators)
            ? options.separators[0].char
            : options.separators.char,
        });
        break;
      case "recursive-character":
        splitter = new RecursiveCharacterTextSplitter({
          chunkSize: options.chunkSize,
          chunkOverlap: options.overlap,
          separators: Array.isArray(options.separators)
            ? options.separators.map((sep) => sep.char)
            : [options.separators.char],
        });
        break;
      case "parent-child":
        const parentChunkSize = options.parentChunkSize || options.chunkSize * 2;
        const separatorList = Array.isArray(options.separators)
          ? options.separators.map((sep) => sep.char)
          : [options.separators.char];
  
        // First pass: Split into parent chunks
        const parentSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: parentChunkSize,
          chunkOverlap: 0,
          separators: separatorList,
        });
  
        const parentChunks = await parentSplitter.splitText(text);
        
        // Second pass: Split each parent into child chunks
        const allChildBlocks: EnhancedTextBlock[] = [];
        let textOffset = 0;
  
        for (let parentIndex = 0; parentIndex < parentChunks.length; parentIndex++) {
          const parentText = parentChunks[parentIndex];
          const parentStartIndex = text.indexOf(parentText, textOffset);
          
          // Create child splitter for this parent
          const childSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: options.chunkSize,
            chunkOverlap: options.overlap, // Overlap only between children within same parent
            separators: separatorList,
          });
  
          const childChunks = await childSplitter.splitText(parentText);
          let childOffset = 0;
  
        // Convert child chunks to EnhancedTextBlock
        for (const childText of childChunks) {
          const relativeStartIndex = parentText.indexOf(childText, childOffset);
          const absoluteStartIndex = parentStartIndex + relativeStartIndex;
          const absoluteEndIndex = absoluteStartIndex + childText.length;
          
          allChildBlocks.push({
            text: childText,
            startIndex: absoluteStartIndex,
            endIndex: absoluteEndIndex,
            parentId: parentIndex,
            parentText: parentText,
          });

          childOffset = relativeStartIndex + 1;
        }
  
          textOffset = parentStartIndex + 1;
        }
  
        return { blocks: allChildBlocks };
      default:
        return {
          blocks: [],
          error: new Error("Invalid split strategy"),
        };
    }

    const chunks = await splitter.splitText(text);
    let currentIndex = 0;
    return {
      blocks: chunks.map((chunk) => {
        const startIndex = text.indexOf(chunk, currentIndex);
        const endIndex = startIndex + chunk.length;
        currentIndex = startIndex + 1;
        return {
          text: chunk,
          startIndex,
          endIndex,
        };
      }),
    };
  } catch (error) {
    return {
      blocks: [],
      error: error as Error,
    };
  }
};
