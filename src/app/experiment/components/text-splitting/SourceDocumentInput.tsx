"use client";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";

export const SourceDocumentInput = () => {
  const { text, blocks, hoveredChunkIndex, setText, setTextareaRef } =
    useTextSplittingStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  useEffect(() => {
    // 将本地 ref 同步到 store 中，以便其他组件可以访问
    setTextareaRef(textareaRef);
  }, [setTextareaRef, textareaRef]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Your Text</label>
        <div className="text-xs text-muted-foreground">
          Sample from{" "}
          <a
            href="https://aws.amazon.com/what-is/retrieval-augmented-generation/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
            title="Open AWS article"
          >
            AWS docs
          </a>
        </div>
      </div>
      {/* Padding lives on the frame, not the textarea, so text never touches the border mid-scroll. */}
      <div className="flex min-h-screen flex-col rounded-lg border-2 border-dashed border-muted-foreground/25 py-3 focus-within:ring-1 focus-within:ring-ring">
        <Textarea
          ref={textareaRef}
          value={getHighlightedText()}
          onChange={handleTextChange}
          className="min-h-0 flex-auto resize-y rounded-none border-0 py-0 font-mono shadow-none focus-visible:ring-0"
          placeholder="Paste or type text to split…"
        />
      </div>
    </div>
  );
};
