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
import { ParentGroup } from "./ParentGroup";
import { ChunkBlock } from "./ChunkBlock";

export const GeneratedChunks = () => {
  const {
    text,
    textareaRef,
    blocks,
    strategy,
    chunkSize,
    overlap,
    parentChunkSize,
    setBlocks,
    setHoveredChunkIndex,
  } = useTextSplittingStore();
  const separators =
    strategy === "recursive-character" || strategy === "parent-child"
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
        parentChunkSize,
      });
      if (error) {
        throw error;
      }
      const updatedBlocks = newBlocks.map((block, index) => {
        // For parent-child strategy, only calculate overlap within same parent
        if (strategy === "parent-child") {
          const previousBlock = newBlocks[index - 1];
          if (previousBlock && block.parentId === previousBlock.parentId) {
            const overlapText = findOverlap(block, previousBlock);
            return { ...block, overlapText };
          }
          return block;
        }
        const overlapText = findOverlap(block, newBlocks[index - 1]);
        return { ...block, overlapText: overlapText };
      });
      setBlocks(updatedBlocks);
    } catch (error) {
      toast.error("Error splitting text: " + error);
      console.error("Error splitting text:", error);
      setBlocks([]);
    }
  }, 500);

  useEffect(() => {
    debouncedSplitText();
  }, [debouncedSplitText, text, strategy, chunkSize, overlap, parentChunkSize]);

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

  const parentChildStats = useMemo(() => {
    if (strategy !== "parent-child") return null;

    const parentCount =
      blocks.length > 0
        ? Math.max(...blocks.map((b) => b.parentId ?? 0)) + 1
        : 0;
    const childCount = blocks.length;
    const avgChildrenPerParent =
      parentCount > 0 ? Math.round((childCount / parentCount) * 10) / 10 : 0;

    return {
      parentCount,
      childCount,
      avgChildrenPerParent,
    };
  }, [blocks, strategy]);
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
          {strategy === "parent-child" && parentChildStats ? (
            <>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                <span className="text-xs font-medium text-muted-foreground">
                  Parents:
                </span>
                <span className="text-sm font-semibold">
                  {parentChildStats.parentCount}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                <span className="text-xs font-medium text-muted-foreground">
                  Children:
                </span>
                <span className="text-sm font-semibold">
                  {parentChildStats.childCount}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                <span className="text-xs font-medium">Avg. Children:</span>
                <span className="text-sm font-semibold">
                  {parentChildStats.avgChildrenPerParent}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                <span className="text-xs font-medium">Avg. Overlap:</span>
                <span className="text-sm font-semibold">
                  {overlapStats.average} chars
                </span>
              </div>
            </>
          ) : (
            <>
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
                        blocks.reduce(
                          (acc, block) => acc + block.text.length,
                          0
                        ) / blocks.length
                      )
                    : 0}{" "}
                  chars
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                <span className="text-xs font-medium">With Overlap:</span>
                <span className="text-sm font-semibold">
                  {overlapStats.total}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                <span className="text-xs font-medium">Avg. Overlap:</span>
                <span className="text-sm font-semibold">
                  {overlapStats.average} chars
                </span>
              </div>
            </>
          )}
        </div>
        <div className="text-base leading-relaxed">
          {strategy === "parent-child"
            ? (() => {
                const parentGroups: { [key: number]: EnhancedTextBlock[] } = {};
                blocks.forEach((block) => {
                  const parentId = block.parentId ?? 0;
                  if (!parentGroups[parentId]) {
                    parentGroups[parentId] = [];
                  }
                  parentGroups[parentId].push(block);
                });

                return Object.entries(parentGroups).map(
                  ([parentId, childBlocks]) => (
                    <ParentGroup
                      key={`parent-${parentId}`}
                      parentId={parseInt(parentId)}
                      childBlocks={childBlocks}
                      blocks={blocks}
                      onChunkHover={handleChunkHover}
                    />
                  )
                );
              })()
            : blocks.map((block, index) => (
                <ChunkBlock
                  key={index}
                  block={block}
                  index={index}
                  onHover={handleChunkHover}
                />
              ))}
        </div>
      </div>
    </div>
  );
};
