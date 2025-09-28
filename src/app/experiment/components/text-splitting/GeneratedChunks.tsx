"use client";
import { useMemo } from "react";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import { useDebouncedCallback } from "use-debounce";
import {
  CHARACTER_SEPARATORS,
  EnhancedTextBlock,
  RECURSIVE_CHARACTER_SEPARATORS,
} from "@/app/experiment/types/text-splitting";
import { splitText } from "@/app/utils/split-text";
import { toast } from "sonner";
import { useEffect } from "react";

const COLORS = [
  "bg-red-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-pink-100",
];

export const GeneratedChunks = () => {
  const {
    text,
    textareaRef,
    blocks,
    strategy,
    chunkSize,
    overlap,
    setBlocks,
    setHoveredChunkIndex,
  } = useTextSplittingStore();
  const separators =
    strategy === "recursive-character"
      ? RECURSIVE_CHARACTER_SEPARATORS
      : CHARACTER_SEPARATORS;

  // Modify the chunk hover handler to include scrolling
  const handleChunkHover = (index: number | null) => {
    setHoveredChunkIndex(index);

    if (index !== null && textareaRef?.current) {
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

  const debouncedSplitText = useDebouncedCallback(async () => {
    try {
      const { blocks: newBlocks, error } = await splitText(text, strategy, {
        chunkSize,
        overlap,
        separators,
      });
      if (error) {
        throw error;
      }
      const updatedBlocks = newBlocks.map((block, index) => {
        const overlapText = findOverlap(block, newBlocks[index - 1]);
        return { ...block, overlapText: overlapText };
      });
      setBlocks(updatedBlocks);
    } catch (error) {
      toast.error("Error splitting text");
      console.error("Error splitting text:", error);
      setBlocks([]);
    }
  }, 500);

  useEffect(() => {
    debouncedSplitText();
  }, [debouncedSplitText, text, strategy, chunkSize, overlap]);

  const overlapStats = useMemo(() => {
    return {
      total: blocks.filter(
        (block) => block.overlapText && block.overlapText.length > 0
      ).length,
      average: (() => {
        const overlappingBlocks = blocks.filter(
          (block) => block.overlapText && block.overlapText.length > 0
        );
        return overlappingBlocks.length > 0
          ? Math.round(
              overlappingBlocks.reduce(
                (acc, block) => acc + (block.overlapText?.length || 0),
                0
              ) / overlappingBlocks.length
            )
          : 0;
      })(),
    };
  }, [blocks]);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Generated Chunks</label>
        <div className="text-xs text-muted-foreground">
          Hover over chunks to highlight their position in the source document
        </div>
      </div>
      <div className="max-h-screen rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/5 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
            <span className="text-xs font-medium text-muted-foreground">
              Chunks:
            </span>
            <span className="text-sm font-semibold">{blocks.length}</span>
          </div>
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
            <span className="text-xs font-medium text-muted-foreground">
              Avg. Size:
            </span>
            <span className="text-sm font-semibold">
              {blocks.length > 0
                ? Math.round(
                    blocks.reduce((acc, block) => acc + block.text.length, 0) /
                      blocks.length
                  )
                : 0}{" "}
              chars
            </span>
          </div>
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
            <span className="text-xs font-medium">With Overlap:</span>
            <span className="text-sm font-semibold">{overlapStats.total}</span>
          </div>
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
            <span className="text-xs font-medium">Avg. Overlap:</span>
            <span className="text-sm font-semibold">
              {overlapStats.average} chars
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
                  {block.overlapText && block.overlapText.length > 0 && (
                    <span
                      className="inline-block px-1.5 py-0.5 -ml-1 border-2 border-dashed border-orange-400 bg-orange-100 text-orange-800 rounded font-medium text-xs mr-1"
                      title={`Overlap: ${block.overlapText.length} characters`}
                    >
                      ↪ {block.overlapText}
                    </span>
                  )}
                  <span
                    className={
                      block.overlapText && block.overlapText.length > 0
                        ? "text-gray-700"
                        : ""
                    }
                  >
                    {block.text.slice(block.overlapText?.length || 0)}
                  </span>
                </>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
