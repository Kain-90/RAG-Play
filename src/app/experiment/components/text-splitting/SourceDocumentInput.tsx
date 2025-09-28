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
        onChange={handleTextChange}
        className="min-h-screen resize-y border-2 border-dashed border-muted-foreground/25 focus-visible:ring-1 font-mono"
        placeholder="Enter text to split here..."
      />
    </div>
  );
};
