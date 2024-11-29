"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEmbeddingStore } from "@/app/stores/experiment/embedding-store";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import { CONTEXT_PROMPT_TEMPLATE } from "@/app/experiment/constants/prompt-templates";
import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import markdownit from "markdown-it";

const md = markdownit();

type MessageDisplayProps = {
  message: string;
  className?: string;
  showOriginal?: boolean;
};

const MessageDisplay = ({
  message,
  className,
  showOriginal = false,
}: MessageDisplayProps) =>
  showOriginal ? (
    <div className={cn("p-3 rounded-md whitespace-pre-wrap", className)}>
      {message}
    </div>
  ) : (
    <div
      className={cn("p-3 rounded-md markdown-body", className)}
      dangerouslySetInnerHTML={{ __html: md.render(message) }}
    />
  );

export function GenerationTab() {
  const { blocks } = useTextSplittingStore();
  const { similarities, question } = useEmbeddingStore();
  const { messages, append, setInput, isLoading, setMessages } = useChat();

  const topSimilarBlocks = similarities
    .slice(0, 3)
    .map(({ index }) => blocks[index].text);

  const promptPreview = CONTEXT_PROMPT_TEMPLATE.replace(
    "{context}",
    topSimilarBlocks.join("\n\n")
  ).replace("{question}", question || "");

  const handleGenerate = async () => {
    if (!topSimilarBlocks.length || !question) return;
    setMessages([]);

    setInput(promptPreview);
    append({
      role: "user",
      content: promptPreview,
    });
  };

  const isDisabled = !topSimilarBlocks.length || !question || isLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Response Generation</CardTitle>
            <CardDescription>
              Observe how LLMs combine retrieved context with user queries to generate accurate, contextual responses
            </CardDescription>
          </div>
          <Button
            size="default"
            disabled={isDisabled}
            onClick={handleGenerate}
            className="min-w-[140px]"
            aria-label={
              isDisabled ? "Cannot generate response yet" : "Generate response"
            }
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Response"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Prompt Preview Section */}
          <section className="space-y-2" aria-label="Prompt Preview Section">
            <label className="text-sm font-medium">System Prompt:</label>
            <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25">
              <ScrollArea className="h-full p-4">
                {topSimilarBlocks.length > 0 && question ? (
                  <MessageDisplay
                    message={promptPreview}
                    showOriginal
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Start by asking a question in the Vector Embedding tab
                  </div>
                )}
              </ScrollArea>
            </div>
          </section>

          {/* Generated Answer Section */}
          <section className="space-y-2" aria-label="Generated Answer Section">
            <label className="text-sm font-medium">Model Response:</label>
            <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25">
              <ScrollArea className="h-full p-4">
                {messages.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {messages.length > 1 && (
                      <MessageDisplay
                        key={messages[messages.length - 1].id}
                        message={messages[messages.length - 1].content}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Click &quot;Generate Response&quot; to see the model&apos;s answer
                  </div>
                )}
              </ScrollArea>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
