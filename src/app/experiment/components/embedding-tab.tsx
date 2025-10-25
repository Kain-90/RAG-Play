"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import LowVectorVisualization from "@/app/experiment/components/low-vector-visualization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EMBEDDING_MODELS,
  EmbeddingModel,
  EmbeddingProgressMessage,
  EmbeddingTaskMessage,
  UILoadingState,
  UIFileProgress,
} from "../types/embedding";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import { useEmbeddingStore } from "@/app/stores/experiment/embedding-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { embedTo2D } from "@/lib/utils";

export function EmbeddingTab() {
  const { blocks, strategy } = useTextSplittingStore();
  const {
    similarities,
    questionEmbedding,
    blocksEmbedding,
    question,
    model,
    worker,
    setQuestionEmbedding,
    setBlocksEmbedding,
    setQuestion,
    setModel,
    setWorker,
  } = useEmbeddingStore();
  const [loadingState, setLoadingState] = useState<UILoadingState>({
    status: "initiate",
  });
  const [fileProgresses, setFileProgresses] = useState<
    Map<string, UIFileProgress>
  >(new Map());
  const [embeddingProgress, setEmbeddingProgress] = useState<number>(0);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(true);

  const calculateOverallProgress = () => {
    if (fileProgresses.size === 0) return 0;

    let total = 0;
    fileProgresses.forEach((file) => {
      total += file.status === "done" ? 100 : file.progress;
    });

    return Math.round(total / fileProgresses.size);
  };

  const loadingProgress = calculateOverallProgress();

  const workerRef = useRef<Worker | null>(null);

  const debouncedGetEmbedding = useDebouncedCallback(
    (question: string = "") => {
      if (!workerRef.current) {
        console.error("Worker not initialized");
        return;
      }

      try {
        setLoadingState({ status: "embedding" });
        let textBlocks: string[] = [];
        if (question.length > 0) {
          textBlocks = [question];
        } else {
          textBlocks = blocks
            .map((block) => block.text)
            .filter((block) => block.length > 0);
        }

        // Validate if there's enough data
        if (textBlocks.length === 0) {
          console.log("No text blocks to embed");
          setBlocksEmbedding([]);
          setLoadingState({ status: "idle" });
          return;
        }

        const message: EmbeddingTaskMessage = {
          task: "feature-extraction",
          model,
          text: textBlocks,
          type: question.length > 0 ? "question" : "blocks",
        };
        workerRef.current.postMessage(message);
      } catch (error) {
        console.error("Error sending message to worker:", error);
        setBlocksEmbedding([]);
        setLoadingState({
          status: "error",
          error: String(error),
        });
      }
    },
    500
  );

  const embedding2d = useMemo(() => {
    if (blocksEmbedding.length > 0 && questionEmbedding.length > 0) {
      try {
        const finalEmbedding = [
          questionEmbedding[0],
          ...blocksEmbedding.map((embedding) => embedding[0]),
        ];

        // Check if there's enough data for UMAP (minimum 3 points for nNeighbors=15)
        if (finalEmbedding.length < 3) {
          console.log(
            `Not enough data points for UMAP visualization (${finalEmbedding.length} points). Need at least 3 points.`
          );
          return [];
        }

        const embedding2d = embedTo2D(finalEmbedding);
        return embedding2d.map((point, index) => ({
          ...point,
          title: index === 0 ? question.slice(0, 30) : `Chunk ${index}`,
          // details: index === 0 ? [] : []
        }));
      } catch (error) {
        console.error("Error creating 2D embeddings:", error);
        return [];
      }
    }
    return [];
  }, [question, questionEmbedding, blocksEmbedding]);

  useEffect(() => {
    if (question.trim()) {
      debouncedGetEmbedding(question);
    } else {
      console.log("Resetting similarity and question embedding");
      setQuestionEmbedding([]);
    }
  }, [question, model, debouncedGetEmbedding, setQuestionEmbedding]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Only initialize worker if it doesn't exist in store
      if (!worker) {
        console.log("Initializing worker");
        const newWorker = new Worker(
          new URL("../workers/embedding.ts", import.meta.url),
          { type: "module" }
        );

        newWorker.onmessage = (
          event: MessageEvent<EmbeddingProgressMessage>
        ) => {
          const { status, progress, message, output, type } = event.data;
          console.log("Worker message received:", {
            status,
            progress,
            message,
            output,
            type,
          });

          if (status === "loading" && progress?.file) {
            setLoadingState({
              status: "loading-model",
              progress,
            });

            const filename = progress.file;
            setFileProgresses((prev) => {
              const newFileProgresses = new Map(prev);
              if (progress?.status === "done") {
                newFileProgresses.set(filename, {
                  filename,
                  progress: 100,
                  status: "done",
                });
              } else if (progress?.status === "ready") {
              } else if (progress?.status === "progress") {
                newFileProgresses.set(filename, {
                  filename,
                  progress: progress?.progress || 0,
                  status: "loading",
                });
              } else {
                newFileProgresses.set(filename, {
                  filename,
                  progress: progress?.progress || 0,
                  status: progress?.status || "loading",
                });
              }
              return newFileProgresses;
            });
          } else if (status === "embedding") {
            setLoadingState({ status: "embedding" });
            setEmbeddingProgress(progress?.progress || 0);
          } else if (status === "ready") {
            setLoadingState({ status: "loading-model-complete" });
            debouncedGetEmbedding();
          } else if (status === "complete" && output) {
            if (type === "question") {
              setQuestionEmbedding(output[0]);
            } else {
              setBlocksEmbedding(output);
            }
            setLoadingState({ status: "idle" });
          } else if (status === "error") {
            console.error("Error generating embedding:", message);
            setBlocksEmbedding([]);
            setLoadingState({
              status: "error",
              error: message,
            });
          }
        };

        newWorker.onerror = (error) => {
          console.error("Worker error:", error);
          setLoadingState({
            status: "error",
            error: "Worker initialization failed",
          });
        };

        // Store worker in global state
        setWorker(newWorker);
      }

      // Use store's worker for local reference
      workerRef.current = worker;
    } catch (error) {
      console.error("Error initializing worker:", error);
      setLoadingState({
        status: "error",
        error: "Failed to initialize worker",
      });
    }

    return () => {
      workerRef.current = null;
    };
  }, [
    model,
    worker,
    setWorker,
    debouncedGetEmbedding,
    setBlocksEmbedding,
    setQuestionEmbedding,
  ]);

  // Cleanup when app unmounts
  useEffect(() => {
    return () => {
      if (worker) {
        worker.terminate();
        setWorker(null);
      }
    };
  }, [worker, setWorker]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vector Embedding & Similarity</CardTitle>
        <CardDescription>
          View chunks and their vector embeddings side by side. Ask questions to
          find similar content through semantic search.
          <br />
          <br />
          <blockquote className="text-xs text-muted-foreground border-l-4 border-muted-foreground/25 px-4 py-2 space-y-2">
            <p>
              Words that are semantically similar are often represented by
              vectors that are close to each other in this vector space. This
              allows for mathematical operations like addition and subtraction
              to carry semantic meaning.
            </p>

            <p>
              For example, the vector representation of &quot;king&quot; minus
              &quot;man&quot; plus &quot;woman&quot; should be close to the
              vector representation of &quot;queen.&quot; In other words, vector
              embeddings are a numerical representation of a particular data
              object.
            </p>
          </blockquote>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Embedding Model:</span>
          <Select
            value={model}
            onValueChange={(value) => setModel(value as EmbeddingModel)}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMBEDDING_MODELS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loadingState.status !== "initiate" && (
          <div className="flex flex-col space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {loadingState.status === "loading-model" &&
                    "Loading model..."}
                  {["idle", "embedding", "loading-model-complete"].includes(
                    loadingState.status
                  ) && "Model loaded"}
                  {loadingState.status === "error" && "Error"}
                </span>
                {["idle", "embedding", "loading-model-complete"].includes(
                  loadingState.status
                ) && <Check className="h-4 w-4 text-green-500" />}
              </div>
              {loadingProgress > 0 && loadingProgress < 100 && (
                <span className="text-sm font-medium">{loadingProgress}%</span>
              )}
            </div>

            {loadingState.status === "loading-model" && (
              <Progress value={loadingProgress} className="w-full" />
            )}

            {fileProgresses.size > 0 && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>Files</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => setIsLoadingExpanded(!isLoadingExpanded)}
                  >
                    {isLoadingExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isLoadingExpanded &&
                  Array.from(fileProgresses.values()).map((file) => (
                    <div key={file.filename} className="flex justify-between">
                      <span>{file.filename}</span>
                      <div className="flex items-center gap-2">
                        {file.status === "done" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <span>{`${file.progress}%`}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Ask a question to find similar content:
          </label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[80px]"
            placeholder="Enter your question here..."
          />
          {questionEmbedding.length > 0 && (
            <div className="mt-4 p-3 rounded-md bg-muted/50">
              <div className="text-xs space-y-1">
                <p className="text-sm">
                  [
                  {questionEmbedding[0]
                    .slice(0, 8)
                    .map((v) => v.toFixed(4))
                    .join(", ")}
                  ...]
                </p>
                <p className="text-xs text-muted-foreground">
                  Question embedding • {questionEmbedding[0].length} dimensions
                </p>
              </div>
            </div>
          )}
        </div>

        {embedding2d.length > 0 && (
          <div className="flex gap-4">
            <div className="w-1/2">
              <LowVectorVisualization
                data={embedding2d.slice(1)}
                query={embedding2d[0]}
                title="Embedding Similarity"
                datasetLabel="Chunks"
                queryLabel="Question"
                className="h-[400px]"
              />
            </div>

            <div className="w-1/2 text-sm text-muted-foreground space-y-2 rounded-lg border border-border bg-muted/50 p-4">
              <p>
                This visualization uses UMAP (Uniform Manifold Approximation and
                Projection) to reduce the high-dimensional embedding vectors
                (typically 384 or 768 dimensions) into 2D space for
                visualization purposes.
              </p>
              <p>
                <strong>Important notes:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  The visualization is approximate - distances between points in
                  2D may not exactly match the actual cosine similarities
                  between the original high-dimensional vectors.
                </li>
                <li>
                  UMAP results can vary between runs due to its stochastic
                  nature. The same embeddings may appear in different
                  arrangements each time the visualization is generated.
                </li>
                <li>
                  Dashed lines connect the query point to its 5 nearest
                  neighbors in the 2D projection space.
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chunks:</label>
            <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25">
              <ScrollArea className="h-full p-4">
                {blocks.length > 0 ? (
                  <div className="space-y-4">
                    {blocks.map((block, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                      >
                        <p className="text-sm">{block.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Chunk {index + 1} • {block.text.length} characters
                          {strategy === "parent-child" &&
                            block.parentId !== undefined && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">
                                Child of Parent {block.parentId + 1}
                              </span>
                            )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Add text in the Text Splitting tab first.
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Chunks Embedding Vectors:
            </label>
            <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25">
              <ScrollArea className="h-full p-4">
                {loadingState.status === "embedding" ? (
                  <div className="flex items-center justify-center h-full">
                    Embedding... {embeddingProgress}%
                  </div>
                ) : blocksEmbedding.length > 0 ? (
                  <div className="space-y-4">
                    {blocksEmbedding.map((blockEmbedding, blockIndex) => (
                      <div
                        key={blockIndex}
                        className="p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                      >
                        <div className="text-xs space-y-1">
                          <p className="text-sm">
                            [
                            {blockEmbedding[0]
                              .slice(0, 8)
                              .map((v) => v.toFixed(4))
                              .join(", ")}
                            ...]
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Chunk {blockIndex + 1} • {blockEmbedding[0].length}{" "}
                            dimensions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {loadingState.status === "error"
                      ? `Error: ${loadingState.error}`
                      : loadingState.status !== "idle"
                      ? "Waiting for model to load..."
                      : "No chunks to embed"}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Similar Chunks:</label>
            <div className="h-[600px] rounded-lg border-2 border-dashed border-muted-foreground/25">
              <ScrollArea className="h-full p-4">
                {similarities.length > 0 && blocks.length > 0 ? (
                  <div className="space-y-2">
                    {similarities
                      .slice(0, 10)
                      .filter(({ index }) => index < blocks.length && blocks[index])
                      .map(({ index, similarity }) => (
                        <div
                          key={index}
                          className="p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                        >
                          <p className="text-sm">{blocks[index].text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Chunk {index + 1} • Similarity:{" "}
                            {similarity.toFixed(4)}
                            {strategy === "parent-child" &&
                              blocks[index].parentId !== undefined && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">
                                  Child of Parent {blocks[index].parentId + 1}
                                </span>
                              )}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {blocks.length === 0
                      ? "No chunks available."
                      : "Ask a question to see similar chunks"}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
