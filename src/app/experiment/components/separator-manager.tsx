import { Separator } from "@/app/experiment/types/text-splitting";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SeparatorManagerProps {
  separators: Separator | Separator[];
}

export function SeparatorManager({ separators }: SeparatorManagerProps) {
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
                <p>
                  Custom separators to use for text splitting.
                  <br />
                  <span className="font-mono">¶ means \n</span>
                  <br />
                  <span className="font-mono">␣ means space</span>
                </p>
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
