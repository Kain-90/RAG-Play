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
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

export function GenerationTab() {
  const { blocks, strategy } = useTextSplittingStore();
  const { similarities, question } = useEmbeddingStore();
  const { messages, append, isLoading, setMessages} = useChat();
  
  // For parent-child strategy, use parent chunks as context (deduplicated)
  const topSimilarBlocks = (() => {
    if (strategy === "parent-child") {
      const topSimilarities = similarities.slice(0, 3);
      const parentChunksMap = new Map<number, string>();
      
      // Collect parent chunks in order of first appearance
      topSimilarities.forEach(({ index }) => {
        const block = blocks[index];
        if (block.parentId !== undefined && block.parentText) {
          if (!parentChunksMap.has(block.parentId)) {
            parentChunksMap.set(block.parentId, block.parentText);
          }
        }
      });
      
      return Array.from(parentChunksMap.values());
    } else {
      return similarities
        .slice(0, 3)
        .map(({ index }) => blocks[index].text);
    }
  })();
  
  const [systemMessage, setSystemMessage] = useState(SYSTEM_PROMPT_TEMPLATE(topSimilarBlocks.join("\n\n")));
  const [userMessage, setUserMessage] = useState(USER_PROMPT_TEMPLATE(question || ""));
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(1000);

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

  const isDisabled = !topSimilarBlocks.length || !question || isLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Response Generation</CardTitle>
            <CardDescription>
              Observe how LLMs combine retrieved context with user queries to generate accurate, contextual responses
              {strategy === "parent-child" && topSimilarBlocks.length > 0 && (
                <span className="block mt-2 px-2 py-1 rounded bg-purple-50 text-purple-700 text-xs">
                  Using parent chunks as context for richer information retrieval
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              Temperature:
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Controls randomness in the output. Higher values (0.8-1.0) make the output more creative but less focused,
                      lower values (0.2-0.5) make it more deterministic and focused.
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
              Max Tokens:
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Maximum number of tokens to generate in the response. Higher values allow for longer responses
                      but may increase processing time and costs.
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
        
        <div className="grid grid-cols-2 gap-4">
          {/* Prompt Preview Section */}
          <section className="space-y-2" aria-label="Prompt Preview Section">
            <label className="text-sm font-medium">Prompt Preview:</label>
            <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25">
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
              <ScrollArea className="p-4 h-full">
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
                  <div className="flex items-center justify-center text-muted-foreground">
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
