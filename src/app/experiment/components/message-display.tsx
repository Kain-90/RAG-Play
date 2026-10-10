"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { extractRedactedThinking } from "@/lib/extract-redacted-thinking";
import markdownit from "markdown-it";
import { ChevronDown, ChevronRight } from "lucide-react";

const md = markdownit();

/** Wrap markdown-it HTML so global `github-markdown-css` (scoped to `.markdown-body`) applies. */
const MARKDOWN_HTML_CLASS = cn("markdown-body max-w-none");

type MessageDisplayProps = {
  message: string;
  className?: string;
  showOriginal?: boolean;
  onEdit?: (newMessage: string) => void;
  isEditable?: boolean;
  label?: string;
  /** When true, the assistant reply is still streaming (`useChat` `isLoading`). Thinking header uses this plus parsed tags to pick labels. */
  isStreaming?: boolean;
};

export const MessageDisplay = ({
  message,
  className,
  showOriginal = false,
  onEdit,
  isEditable = false,
  label,
  isStreaming = false,
}: MessageDisplayProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedMessage, setEditedMessage] = React.useState(message);
  const [isThinkingExpanded, setIsThinkingExpanded] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const thinkingPanelId = React.useId();

  const parsedThinking = React.useMemo(() => {
    if (showOriginal || isEditing) {
      return null;
    }
    return extractRedactedThinking(message);
  }, [message, showOriginal, isEditing]);

  /** True while the stream is open and the `<think>` block has not closed yet. */
  const isThinkingBlockStreaming = React.useMemo(() => {
    if (parsedThinking?.thinkingContent == null) {
      return false;
    }
    return isStreaming && !parsedThinking.thinkingComplete;
  }, [parsedThinking, isStreaming]);

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, 100), // minimum height of 100px
        400 // maximum height of 400px
      );
      textarea.style.height = `${newHeight}px`;
    }
  }, [isEditing, editedMessage]);

  React.useEffect(() => {
    if (isEditing && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMessage(message);
  };

  const handleSave = () => {
    onEdit?.(editedMessage);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMessage(message);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleToggleThinking = () => {
    setIsThinkingExpanded((prev) => !prev);
  };

  const handleToggleThinkingKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleThinking();
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        {label && <div className="font-medium text-sm">{label}</div>}
        {isEditable && !isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            className="px-3 py-1 h-7 text-xs hover:bg-muted"
          >
            Edit
          </Button>
        )}
      </div>
      <div
        className={cn(
          "relative rounded-md border transition-colors",
          isEditing ? "border-ring" : "border-border",
          className
        )}
      >
        {isEditing ? (
          <div className="space-y-2 p-3">
            <textarea
              ref={textareaRef}
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[100px] max-h-[400px] p-2 rounded-md bg-background resize-y focus:outline-none"
              placeholder="Type a message…"
            />
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="px-3 py-1 h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="px-3 py-1 h-7 text-xs"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            {showOriginal ? (
              <div className="whitespace-pre-wrap">{message}</div>
            ) : parsedThinking?.thinkingContent != null ? (
              <div className="space-y-3">
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  onClick={handleToggleThinking}
                  onKeyDown={handleToggleThinkingKeyDown}
                  aria-expanded={isThinkingExpanded}
                  aria-controls={thinkingPanelId}
                  aria-label={
                    isThinkingBlockStreaming
                      ? "Model is thinking"
                      : isThinkingExpanded
                        ? "Hide thinking"
                        : "Show thinking"
                  }
                >
                  {isThinkingExpanded ? (
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  ) : (
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                  {isThinkingBlockStreaming ? (
                    <span>Thinking…</span>
                  ) : isThinkingExpanded ? (
                    <span>Hide thinking</span>
                  ) : (
                    <span>Show thinking</span>
                  )}
                </button>
                {isThinkingExpanded ? (
                  <div
                    id={thinkingPanelId}
                    className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap text-muted-foreground"
                  >
                    {parsedThinking.thinkingContent.length > 0 ? (
                      parsedThinking.thinkingContent
                    ) : (
                      <span className="italic">Nothing yet.</span>
                    )}
                  </div>
                ) : null}
                {parsedThinking.visibleMarkdown.trim().length > 0 ? (
                  <div
                    className={MARKDOWN_HTML_CLASS}
                    dangerouslySetInnerHTML={{
                      __html: md.render(parsedThinking.visibleMarkdown),
                    }}
                  />
                ) : null}
              </div>
            ) : (
              <div
                className={MARKDOWN_HTML_CLASS}
                dangerouslySetInnerHTML={{ __html: md.render(message) }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
