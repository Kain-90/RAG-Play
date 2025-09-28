"use client";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import {
  CHARACTER_SEPARATORS,
  RECURSIVE_CHARACTER_SEPARATORS,
} from "../types/text-splitting";

export function SeparatorManager() {
  const strategy = useTextSplittingStore((state) => state.strategy);
  const separators =
    strategy === "recursive-character"
      ? RECURSIVE_CHARACTER_SEPARATORS
      : CHARACTER_SEPARATORS;
  return (
    <div className="flex items-center space-x-4 mt-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          Separators:
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Custom separators to use for text splitting.</p>
                <p className="mb-2">
                  Split paragraphs in order by using separators and merge
                  smaller chunks according to the overlap size.
                </p>
                <span className="font-mono">¶ means line break</span>
                <br />
                <span className="font-mono">␣ means space</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.isArray(separators) ? (
          separators.map((sep) => (
            <div key={sep.id} className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-mono
                ${
                  sep.style
                    ? `${sep.style.bg} ${sep.style.text}`
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {sep.display}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-mono ${
                separators.style
                  ? `${separators.style.bg} ${separators.style.text}`
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {separators.display}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
