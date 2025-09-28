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
  const { chunkSize, overlap, setOverlap } = useTextSplittingStore();

  const handleOverlapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverlap(Number(e.target.value));
  };

  return (
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
                Number of characters to overlap between chunks. Helps maintain
                context across chunk boundaries.
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
  );
};
