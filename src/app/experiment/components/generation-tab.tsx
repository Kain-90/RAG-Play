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
import { SYSTEM_PROMPT_TEMPLATE, USER_PROMPT_TEMPLATE } from "@/app/experiment/constants/prompt-templates";
import { useChat } from "ai/react";
import { MessageDisplay } from "./message-display";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Circle, HelpCircle, ListChecks } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Viewport-aware height so prompt preview and model response need less inner scrolling. */
const GENERATION_SPLIT_HEIGHT_CLASS =
  "h-[max(38rem,min(56rem,calc(100vh-12.5rem)))]";

export function GenerationTab() {
  const { blocks, strategy } = useTextSplittingStore();
  const { similarities, question } = useEmbeddingStore();
  const { messages, append, isLoading, setMessages, error } = useChat({
    onError: (chatError) => {
      toast.error("Couldn't generate an answer", { description: chatError.message });
    },
  });
  const generationError = isLoading ? undefined : error;
  
  // For parent-child strategy, use parent chunks as context (deduplicated)
  const topSimilarBlocks = useMemo(() => {
    if (strategy === "parent-child") {
      const topSimilarities = similarities.slice(0, 3);
      const parentChunksMap = new Map<number, string>();
      
      // Collect parent chunks in order of first appearance
      topSimilarities.forEach(({ index }) => {
        const block = blocks[index];
        if (block?.parentId !== undefined && block.parentText) {
          if (!parentChunksMap.has(block.parentId)) {
            parentChunksMap.set(block.parentId, block.parentText);
          }
        }
      });
      
      return Array.from(parentChunksMap.values());
    }

    return similarities
      .slice(0, 3)
      .map(({ index }) => blocks[index]?.text)
      .filter((text): text is string => Boolean(text));
  }, [blocks, similarities, strategy]);
  
  const [systemMessage, setSystemMessage] = useState(SYSTEM_PROMPT_TEMPLATE(topSimilarBlocks.join("\n\n")));
  const [userMessage, setUserMessage] = useState(USER_PROMPT_TEMPLATE(question || ""));
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(1000);
  const hasGeneratedAnswer = messages.length > 1;
  const hasGenerationInput = topSimilarBlocks.length > 0 && Boolean(question);
  const thinkingSteps = [
    {
      label: `Got ${topSimilarBlocks.length} matching chunk${
        topSimilarBlocks.length === 1 ? "" : "s"
      }`,
      isComplete: hasGenerationInput,
    },
    {
      label: "Built the prompt",
      isComplete: hasGenerationInput,
    },
    {
      label: generationError
        ? "Couldn't get an answer"
        : hasGeneratedAnswer
          ? "Answer ready"
          : isLoading
            ? "Writing the answer…"
            : "Ready to answer",
      isComplete: hasGeneratedAnswer,
    },
  ];

  useEffect(() => {
    setSystemMessage(SYSTEM_PROMPT_TEMPLATE(topSimilarBlocks.join("\n\n")));
  }, [topSimilarBlocks]);

  useEffect(() => {
    setUserMessage(USER_PROMPT_TEMPLATE(question || ""));
  }, [question]);

  const handleGenerate = async () => {
    if (!topSimilarBlocks.length || !question) return;
    setMessages([]);
    append({
      role: "user",
      content: userMessage,
    }, {
      body: {
        system: systemMessage,
        modelConfig: {
          temperature,
          maxTokens,
        },
      }
    });
  };

  const isDisabled = !hasGenerationInput || isLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Context Generation</CardTitle>
            <CardDescription>
              See how the LLM uses the top 3 chunks as context to answer your question.
              {strategy === "parent-child" && topSimilarBlocks.length > 0 && (
                <span className="block mt-2 px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs">
                  Using parent chunks for fuller context.
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            size="default"
            disabled={isDisabled}
            onClick={handleGenerate}
            className="min-w-[140px]"
            aria-label={
              isDisabled
                ? "Ask a question in Semantic Search first"
                : "Generate answer"
            }
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                <span>Generating…</span>
              </div>
            ) : (
              "Generate Answer"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              Temperature
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Higher = more creative. Lower = more focused. Try 0.2–0.5 for facts.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              type="number"
              value={temperature}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 1) {
                  setTemperature(1);
                } else {
                  setTemperature(value);
                }
              }}
              min="0"
              max="1"
              step="0.1"
              className="w-24 ml-2"
            />
          </div>
          <div className="flex items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              Max Tokens
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Caps answer length. Higher allows longer answers but takes more time.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              type="number"
              value={maxTokens}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 4096) {
                  setMaxTokens(4096);
                } else {
                  setMaxTokens(value);
                }
              }}
              min="1"
              max="4096"
              className="w-24 ml-2"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Prompt Preview Section */}
          <section className="space-y-2" aria-label="Prompt Preview Section">
            <label className="text-sm font-medium">Prompt Preview</label>
            <div
              className={cn(
                GENERATION_SPLIT_HEIGHT_CLASS,
                "rounded-lg border-2 border-dashed border-muted-foreground/25"
              )}
            >
              <ScrollArea className="h-full p-4">
                {topSimilarBlocks.length > 0 && question ? (
                  <div className="space-y-4">
                    <MessageDisplay
                      message={systemMessage}
                      showOriginal
                      className="bg-muted"
                      isEditable
                      onEdit={(newMessage) => {
                        setSystemMessage(newMessage);
                      }}
                      label="System Message"
                    />
                    <MessageDisplay
                      message={userMessage}
                      showOriginal
                      className="bg-muted"
                      isEditable
                      onEdit={(newMessage) => {
                        setUserMessage(newMessage);
                      }}
                      label="User Message"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Ask a question in Semantic Search first.
                  </div>
                )}
              </ScrollArea>
            </div>
          </section>

          {/* Generated Answer Section */}
          <section className="space-y-2" aria-label="Generated Answer Section">
            <label className="text-sm font-medium">Model Answer</label>
            <div
              className={cn(
                GENERATION_SPLIT_HEIGHT_CLASS,
                "flex flex-col gap-4"
              )}
            >
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <ListChecks
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <span>Steps</span>
                </div>
                {hasGenerationInput ? (
                  <div className="space-y-3">
                    {thinkingSteps.map((step) => {
                      const Icon = step.isComplete ? CheckCircle2 : Circle;

                      return (
                        <div
                          key={step.label}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Icon
                            className={
                              step.isComplete
                                ? "mt-0.5 h-4 w-4 text-green-600"
                                : "mt-0.5 h-4 w-4 text-muted-foreground"
                            }
                          />
                          {isLoading && !step.isComplete ? (
                            <span className="font-medium">{step.label}</span>
                          ) : (
                            <span
                              className={
                                step.isComplete
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {step.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {isLoading && (
                      <p className="pl-6 text-xs text-muted-foreground">
                        The answer appears as it&apos;s written…
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-muted-foreground">
                    Ask a question in Semantic Search first.
                  </div>
                )}
              </div>
              <div className="min-h-0 flex-1 rounded-lg border-2 border-dashed border-muted-foreground/25">
                <ScrollArea className="p-4 h-full">
                  {messages.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {hasGeneratedAnswer && (
                        <MessageDisplay
                          key={messages[messages.length - 1].id}
                          message={messages[messages.length - 1].content}
                          isStreaming={isLoading}
                        />
                      )}
                      {generationError && (
                        <div
                          role="alert"
                          className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-red-600 dark:text-red-400"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                          <span>{generationError.message}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Click Generate Answer to see the reply.
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
