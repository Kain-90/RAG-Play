import {
  SplitStrategy,
  EnhancedTextBlock,
  Separator,
} from "@/app/experiment/types/text-splitting";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";

const DEFAULT_PARENT_SIZE_MULTIPLIER = 2;

class SplitError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "SplitError";
  }
}

function getSeparatorList(separators: Separator | Separator[]): string[] {
  if (Array.isArray(separators)) {
    return separators.map((sep) => sep.char);
  }
  return [separators.char];
}

function getFirstSeparator(separators: Separator | Separator[]): string {
  if (Array.isArray(separators)) {
    return separators[0].char;
  }
  return separators.char;
}

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
    if (!text || text.trim().length === 0) {
      return { blocks: [] };
    }

    const separatorList = getSeparatorList(options.separators);
    const splitterConfig = {
      chunkSize: options.chunkSize,
      chunkOverlap: options.overlap,
    };

    let splitter;
    switch (strategy) {
      case "character":
        splitter = new CharacterTextSplitter({
          ...splitterConfig,
          separator: getFirstSeparator(options.separators),
        });
        break;
      case "recursive-character":
        splitter = new RecursiveCharacterTextSplitter({
          ...splitterConfig,
          separators: separatorList,
        });
        break;
      case "parent-child": {
        const parentChunkSize =
          options.parentChunkSize || options.chunkSize * DEFAULT_PARENT_SIZE_MULTIPLIER;

        const parentSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: parentChunkSize,
          chunkOverlap: 0,
          separators: separatorList,
        });

        const parentChunks = await parentSplitter.splitText(text);

        const allChildBlocks: EnhancedTextBlock[] = [];
        const parentStartIndexMap = new Map<number, number>();

        for (let parentIndex = 0; parentIndex < parentChunks.length; parentIndex++) {
          const parentText = parentChunks[parentIndex];
          const parentStartIndex = text.indexOf(parentText, parentIndex === 0 ? 0 : parentStartIndexMap.get(parentIndex - 1) ?? 0);
          parentStartIndexMap.set(parentIndex, parentStartIndex);

          const childSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: options.chunkSize,
            chunkOverlap: options.overlap,
            separators: separatorList,
          });

          const childChunks = await childSplitter.splitText(parentText);

          for (const childText of childChunks) {
            const relativeStartIndex = parentText.indexOf(childText);
            const absoluteStartIndex = parentStartIndex + relativeStartIndex;
            const absoluteEndIndex = absoluteStartIndex + childText.length;

            allChildBlocks.push({
              text: childText,
              startIndex: absoluteStartIndex,
              endIndex: absoluteEndIndex,
              parentId: parentIndex,
              parentText,
            });
          }
        }

        return { blocks: allChildBlocks };
      }
      default:
        return {
          blocks: [],
          error: new SplitError("Invalid split strategy", "INVALID_STRATEGY"),
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
