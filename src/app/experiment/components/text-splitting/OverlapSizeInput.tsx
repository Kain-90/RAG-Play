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

export const OverlapSizeInput = () => {
  const { chunkSize, overlap, setOverlap, blocks, strategy } =
    useTextSplittingStore();
  // Parent-Child only overlaps within a parent, so an empty result there isn't a size problem.
  const hasNoOverlap =
    strategy !== "parent-child" &&
    overlap > 0 &&
    blocks.length > 1 &&
    blocks.every((block) => !block.overlapText);

  const handleOverlapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverlap(Number(e.target.value));
  };

  return (
    <div className="flex items-center">
      <label className="text-sm font-medium flex items-center gap-2">
        Overlap
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Characters shared by neighboring chunks, so ideas aren&apos;t
                cut in half.
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
      {hasNoOverlap && (
        <span role="status" className="ml-2 text-xs text-muted-foreground">
          No overlap: pieces are longer than Overlap. Try a smaller separator.
        </span>
      )}
    </div>
  );
};
