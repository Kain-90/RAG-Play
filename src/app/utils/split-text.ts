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
  }
): Promise<SplitTextResult> => {
  try {
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
