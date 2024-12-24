"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import markdownit from "markdown-it";

const md = markdownit();

type MessageDisplayProps = {
  message: string;
  className?: string;
  showOriginal?: boolean;
  onEdit?: (newMessage: string) => void;
  isEditable?: boolean;
  label?: string;
};

export const MessageDisplay = ({
  message,
  className,
  showOriginal = false,
  onEdit,
  isEditable = false,
  label,
}: MessageDisplayProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedMessage, setEditedMessage] = React.useState(message);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
            Edit Message
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
              placeholder="Edit message..."
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
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            {showOriginal ? (
              <div className="whitespace-pre-wrap">{message}</div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: md.render(message) }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
