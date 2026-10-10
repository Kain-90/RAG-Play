"use client";
import { useState } from "react";
import { HelpCircle, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import {
  FIXED_SEPARATOR_PRESETS,
  Separator,
} from "../types/text-splitting";
import { createCustomSeparator } from "@/app/utils/separators";
import { cn } from "@/lib/utils";

const CUSTOM_CHIP_CLASS = "bg-gray-200 text-gray-700";

const getChipClassName = (separator: Separator) =>
  separator.style
    ? `${separator.style.bg} ${separator.style.text}`
    : CUSTOM_CHIP_CLASS;

export function SeparatorManager() {
  const {
    strategy,
    fixedSeparator,
    recursiveSeparators,
    setFixedSeparator,
    addRecursiveSeparator,
    removeRecursiveSeparator,
    resetFixedSeparator,
    resetRecursiveSeparators,
  } = useTextSplittingStore();
  const [customInput, setCustomInput] = useState("");
  const isFixed = strategy === "character";

  // A custom pick for Fixed Character shows up as an extra option.
  const fixedOptions = FIXED_SEPARATOR_PRESETS.some(
    ({ char }) => char === fixedSeparator.char
  )
    ? FIXED_SEPARATOR_PRESETS
    : [...FIXED_SEPARATOR_PRESETS, fixedSeparator];

  const handleAddCustom = () => {
    if (!customInput) {
      return;
    }

    const separator = createCustomSeparator(customInput);
    if (isFixed) {
      setFixedSeparator(separator);
    } else {
      addRecursiveSeparator(separator);
    }
    setCustomInput("");
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter that confirms an IME candidate (e.g. typing 。) must not submit.
    // Safari reports isComposing as false here, hence the keyCode 229 check.
    if (
      e.key !== "Enter" ||
      e.nativeEvent.isComposing ||
      e.keyCode === 229
    ) {
      return;
    }
    e.preventDefault();
    handleAddCustom();
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        {isFixed ? "Separator" : "Separators"}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="mb-2">
                {isFixed
                  ? "Text is cut only here. Pick one."
                  : "Where text can be cut, tried in order. New ones go last."}
              </p>
              <span className="font-mono">¶ = line break</span>
              <br />
              <span className="font-mono">␣ = space</span>
              <br />
              <span className="font-mono">Type \n for a line break</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </label>

      {isFixed ? (
        <div
          role="radiogroup"
          aria-label="Separator"
          className="flex flex-wrap items-center gap-2"
        >
          {fixedOptions.map((separator) => {
            const isSelected = separator.char === fixedSeparator.char;

            return (
              <button
                key={separator.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Cut at ${separator.display}`}
                onClick={() => setFixedSeparator(separator)}
                className={cn(
                  "rounded px-2 py-1 font-mono text-xs transition",
                  getChipClassName(separator),
                  isSelected
                    ? "ring-2 ring-primary/60 ring-offset-1"
                    : "opacity-50 hover:opacity-100"
                )}
              >
                {separator.display}
              </button>
            );
          })}
        </div>
      ) : (
        <ul
          aria-label="Separators"
          className="flex flex-wrap items-center gap-2"
        >
          {recursiveSeparators.map((separator) => (
            <li
              key={separator.id}
              className={cn(
                "inline-flex items-center gap-1 rounded py-1 pl-2 pr-1 font-mono text-xs",
                getChipClassName(separator)
              )}
            >
              {separator.display}
              <button
                type="button"
                onClick={() => removeRecursiveSeparator(separator.char)}
                disabled={recursiveSeparators.length <= 1}
                aria-label={`Remove ${separator.display} separator`}
                className="rounded p-0.5 hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          placeholder="e.g. 。 or \n"
          aria-label={isFixed ? "Custom separator" : "New separator"}
          className="h-8 w-32 font-mono text-xs"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={handleAddCustom}
          disabled={!customInput}
        >
          {isFixed ? (
            "Use"
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-muted-foreground"
          onClick={isFixed ? resetFixedSeparator : resetRecursiveSeparators}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
