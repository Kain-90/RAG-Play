"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";

export const ChunkSizeInput = () => {
  const {
    chunkSize,
    parentChunkSize,
    strategy,
    setChunkSize,
    setParentChunkSize,
  } = useTextSplittingStore();

  const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChunkSize(Number(e.target.value));
  };

  const handleParentChunkSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setParentChunkSize(Number(e.target.value));
  };

  return (
    <div className="flex items-center">
      {strategy === "parent-child" && (
        <>
          <label className="text-sm font-medium flex items-center gap-2">
            Parent Chunk Size:
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum number of characters in each parent chunk.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <Input
            type="number"
            value={parentChunkSize}
            onChange={handleParentChunkSizeChange}
            min={chunkSize}
            max={10000}
            className="w-24 ml-2 mr-4"
          />
        </>
      )}
      <label className="text-sm font-medium flex items-center gap-2">
        {strategy === "parent-child" ? "Child Chunk Size:" : "Chunk Size:"}
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
  );
};
