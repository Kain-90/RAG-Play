"use client";
import { useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SplitStrategy,
  SplitStrategyList,
  EnhancedTextBlock,
} from "../types/text-splitting";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import Langchain from "@/components/langchain.svg";
import Image from "next/image";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SeparatorManager } from "@/app/experiment/components/separator-manager";
import {
  Separator,
  CHARACTER_SEPARATORS,
  RECURSIVE_CHARACTER_SEPARATORS,
} from "@/app/experiment/types/text-splitting";

async function splitText(
  text: string,
  strategy: SplitStrategy,
  options: {
    chunkSize: number;
    overlap: number;
    separators: Separator | Separator[];
  }
): Promise<EnhancedTextBlock[]> {
  try {
    let splitter;
    switch (strategy) {
      case "character":
        splitter = new CharacterTextSplitter({
          separator: Array.isArray(options.separators)
            ? options.separators[0].char
            : options.separators.char,
          chunkSize: options.chunkSize,
          chunkOverlap: options.overlap,
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
        throw new Error("Invalid split strategy");
    }

    const chunks = await splitter.splitText(text);
    let currentIndex = 0;
    return chunks.map((chunk) => {
      const startIndex = text.indexOf(chunk, currentIndex);
      const endIndex = startIndex + chunk.length;
      currentIndex = startIndex + 1;
      return {
        text: chunk,
        startIndex,
        endIndex,
      };
    });
  } catch (error) {
    console.error("Error splitting text:", error);
    return [];
  }
}

const COLORS = [
  "bg-red-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-pink-100",
];

export function TextSplittingTab() {
  const {
    text,
    blocks,
    strategy,
    chunkSize,
    overlap,
    setText,
    setBlocks,
    setStrategy,
    setChunkSize,
    setOverlap,
  } = useTextSplittingStore();
  const [hoveredChunkIndex, setHoveredChunkIndex] = useState<number | null>(
    null
  );
  const [separators, setSeparators] = useState<Separator[] | Separator>(
    strategy === "recursive-character"
      ? RECURSIVE_CHARACTER_SEPARATORS
      : CHARACTER_SEPARATORS
  );

  const debouncedSplitText = useDebouncedCallback(async () => {
    try {
      const newBlocks = await splitText(text, strategy, {
        chunkSize,
        overlap,
        separators,
      });
      const updatedBlocks = newBlocks.map((block, index) => {
        const overlapText = findOverlap(block, newBlocks[index - 1]);
        return { ...block, overlapText: overlapText };
      });
      console.log(updatedBlocks);
      setBlocks(updatedBlocks);
    } catch (error) {
      console.error("Error splitting text:", error);
      setBlocks([]);
    }
  }, 500);

  useEffect(() => {
    setSeparators(
      strategy === "recursive-character"
        ? RECURSIVE_CHARACTER_SEPARATORS
        : CHARACTER_SEPARATORS
    );
    debouncedSplitText();
  }, [text, strategy, chunkSize, overlap, separators, debouncedSplitText]);

  const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setChunkSize(value);
  };

  const handleOverlapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setOverlap(value);
  };

  // Modify the textarea content to show highlighted original text
  const getHighlightedText = () => {
    if (hoveredChunkIndex === null) return text;

    const block = blocks[hoveredChunkIndex];
    return (
      text.slice(0, block.startIndex) +
      `[${text.slice(block.startIndex, block.endIndex)}]` +
      text.slice(block.endIndex)
    );
  };

  // Add a ref for the textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Modify the chunk hover handler to include scrolling
  const handleChunkHover = (index: number | null) => {
    setHoveredChunkIndex(index);

    if (index !== null && textareaRef.current) {
      const block = blocks[index];
      const textarea = textareaRef.current;

      // Create a temporary div to measure text dimensions
      const measureDiv = document.createElement("div");
      measureDiv.style.cssText = window.getComputedStyle(textarea).cssText;
      measureDiv.style.height = "auto";
      measureDiv.style.width = `${textarea.clientWidth}px`;
      measureDiv.style.position = "absolute";
      measureDiv.style.visibility = "hidden";
      measureDiv.style.whiteSpace = "pre-wrap";

      // Get text before the highlighted chunk
      const textBeforeChunk = text.substring(0, block.startIndex);
      measureDiv.textContent = textBeforeChunk;

      document.body.appendChild(measureDiv);
      const textHeight = measureDiv.offsetHeight;
      document.body.removeChild(measureDiv);

      // Calculate optimal scroll position
      const scrollPosition = Math.max(
        0,
        textHeight - textarea.clientHeight / 3
      );

      // Smooth scroll to position
      textarea.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const findOverlap = (
    block: EnhancedTextBlock,
    previousBlock: EnhancedTextBlock | null
  ) => {
    if (!previousBlock) return "";

    const blockText = block.text;
    const previousBlockText = previousBlock.text;

    let overlapText = "";
    const maxLength = Math.min(
      blockText.length,
      previousBlockText.length,
      overlap
    );

    // Find the longest overlapping substring between blocks
    for (let i = maxLength; i >= 1; i--) {
      const blockStart = blockText.substring(0, i);
      const previousBlockEnd = previousBlockText.substring(
        previousBlockText.length - i
      );

      if (blockStart === previousBlockEnd) {
        overlapText = blockStart;
        break;
      }
    }
    return overlapText;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Splitting</CardTitle>
        <CardDescription>
          Visualize how documents are split into meaningful chunks while
          preserving semantic coherence
          <br />
          - Character strategy: Simple splitting with fixed chunk size. Best for
          straightforward text processing.
          <br />- Recursive character strategy: Intelligent splitting that
          preserves natural language boundaries and semantic meaning.
          Recommended for production use.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Split Strategy:</span>
          <Select
            value={strategy}
            onValueChange={(value) => setStrategy(value as SplitStrategy)}
          >
            <SelectTrigger className="w-[254px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SplitStrategyList.map((item) => {
                const [key, value] = Object.entries(item)[0];
                return (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Link
            href="https://js.langchain.com/docs/how_to#text-splitters"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Image
              src={Langchain}
              alt="Langchain"
              title="Langchain text splitters"
              className="w-8 h-8"
            />
          </Link>
        </div>

        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              Chunk Size:
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Maximum number of characters in each chunk. Larger chunks
                      preserve more context but may exceed token limits.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              type="number"
              value={chunkSize}
              onChange={handleChunkSizeChange}
              min="1"
              max={10000}
              className="w-24 ml-2"
            />
          </div>
          <div className="flex items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              Overlap Size:
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Number of characters to overlap between chunks. Helps
                      maintain context across chunk boundaries.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              type="number"
              value={overlap}
              onChange={handleOverlapChange}
              min="0"
              max={chunkSize - 1}
              className="w-24 ml-2"
            />
          </div>
        </div>

        <SeparatorManager separators={separators} />

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Source Document</label>
              <div className="text-xs text-muted-foreground">
                Sample text from{" "}
                <a
                  href="https://aws.amazon.com/what-is/retrieval-augmented-generation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary transition-colors"
                  title="AWS RAG Documentation"
                >
                  AWS Documentation
                </a>
              </div>
            </div>
            <Textarea
              ref={textareaRef}
              value={getHighlightedText()}
              onChange={(e) => setText(e.target.value)}
              className="min-h-screen resize-y border-2 border-dashed border-muted-foreground/25 focus-visible:ring-1 font-mono"
              placeholder="Enter text to split here..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Chunks</label>
              <div className="text-xs text-muted-foreground">
                Hover over chunks to highlight their position in the source
                document
              </div>
            </div>
            <div className="max-h-screen rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 p-4 overflow-y-auto">
              <div className="flex gap-4 mb-4 pb-3 border-b border-border/50">
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md">
                  <span className="text-xs font-medium text-muted-foreground">
                    Chunks:
                  </span>
                  <span className="text-sm font-semibold">{blocks.length}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md">
                  <span className="text-xs font-medium text-muted-foreground">
                    Avg. Size:
                  </span>
                  <span className="text-sm font-semibold">
                    {blocks.length > 0
                      ? Math.round(
                          blocks.reduce(
                            (acc, block) => acc + block.text.length,
                            0
                          ) / blocks.length
                        )
                      : 0}{" "}
                    chars
                  </span>
                </div>
              </div>
              <div className="text-base leading-relaxed">
                {blocks.map((block, index) => {
                  return (
                    <span
                      key={index}
                      className={`${
                        COLORS[index % COLORS.length]
                      } px-1.5 py-0.5 rounded mx-0.5 inline-block cursor-pointer 
                      transition-opacity hover:opacity-80 relative group`}
                      onMouseEnter={() => handleChunkHover(index)}
                      onMouseLeave={() => handleChunkHover(null)}
                    >
                      <span className="absolute -top-2 -right-1 bg-muted-foreground/10 text-muted-foreground text-[10px] px-1 rounded">
                        {block.text.length}
                      </span>
                      <>
                        {block.overlapText && (
                          <span className="inline-block px-1 -ml-1 border-x-2 border-dashed border-black/20 bg-black/5 rounded-l rounded-r font-medium">
                            {block.overlapText}
                          </span>
                        )}
                        {block.text.slice(block.overlapText?.length || 0)}
                      </>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
