"use client";

import LowVectorVisualization from "@/app/experiment/components/low-vector-visualization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import { useEmbeddingStore } from "@/app/stores/experiment/embedding-store";
import type { UseEmbeddingWorkerReturn } from "@/app/hooks/useEmbeddingWorker";
import { ModelSelector } from "./embedding/ModelSelector";
import { LoadingPanel } from "./embedding/LoadingPanel";
import { EMBEDDING_CONSTANTS } from "@/app/hooks";
import { embedTo2D } from "@/lib/utils";

interface EmbeddingTabProps {
  embeddingWorker: UseEmbeddingWorkerReturn;
}

export function EmbeddingTab({ embeddingWorker }: EmbeddingTabProps) {
  const { blocks, strategy } = useTextSplittingStore();
  const {
    blocksEmbedding,
    model,
    setModel,
  } = useEmbeddingStore();

  const {
    loadingState,
    fileProgresses,
    embeddingProgress,
    loadingProgress,
    isLoadingExpanded,
    setIsLoadingExpanded,
  } = embeddingWorker;

  const embedding2d = useMemo(() => {
    if (blocksEmbedding.length < EMBEDDING_CONSTANTS.MIN_EMBEDDING_POINTS) {
      return [];
    }

    try {
      return embedTo2D(blocksEmbedding.map((embedding) => embedding[0])).map(
        (point, index) => ({
          ...point,
          title: `Chunk ${index + 1}`,
        })
      );
    } catch {
      return [];
    }
  }, [blocksEmbedding]);

  const handleModelChange = (newModel: string) => {
    setModel(newModel as "Snowflake/snowflake-arctic-embed-xs");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vector Embedding</CardTitle>
        <CardDescription>
          See each chunk next to its vector: the numbers a model uses to capture
          meaning.
        </CardDescription>
        <blockquote className="space-y-2 border-l-4 border-muted-foreground/25 px-4 py-2 text-xs text-muted-foreground">
          <p>
            Similar meanings get nearby vectors. Famously, king − man + woman ≈
            queen.
          </p>
        </blockquote>
      </CardHeader>
      <CardContent className="space-y-4">
        <ModelSelector model={model} onModelChange={handleModelChange} />

        <LoadingPanel
          loadingState={loadingState}
          loadingProgress={loadingProgress}
          fileProgresses={fileProgresses}
          isLoadingExpanded={isLoadingExpanded}
          onToggleExpanded={() => setIsLoadingExpanded(!isLoadingExpanded)}
        />

        {embedding2d.length > 0 && (
          <div className="flex gap-4">
            <div className="w-1/2">
              <LowVectorVisualization
                data={embedding2d}
                title="Chunks in 2D"
                datasetLabel="Chunks"
                className="h-[400px]"
              />
            </div>

            <div className="w-1/2 text-sm text-muted-foreground space-y-2 rounded-lg border border-border bg-muted/50 p-4">
              <p>
                UMAP squeezes hundreds of dimensions into 2D so you can see
                them. Treat it as a rough map.
              </p>
              <p>
                <strong>Keep in mind</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Distances here are approximate, not exact similarity scores.
                </li>
                <li>The layout can shift each run. That&apos;s normal.</li>
                <li>
                  Only chunks appear here. Your question shows up in Semantic
                  Search.
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chunks</label>
            <div
              className="rounded-lg border-2 border-dashed border-muted-foreground/25"
              style={{ height: EMBEDDING_CONSTANTS.CHUNK_LIST_HEIGHT }}
            >
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
                          Chunk {index + 1} · {block.text.length} chars
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
                    No chunks yet. Add text in Text Splitting.
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Chunk Vectors
            </label>
            <div
              className="rounded-lg border-2 border-dashed border-muted-foreground/25"
              style={{ height: EMBEDDING_CONSTANTS.CHUNK_LIST_HEIGHT }}
            >
              <ScrollArea className="h-full p-4">
                {loadingState.status === "embedding" ? (
                  <div className="flex items-center justify-center h-full">
                    Embedding chunks… {embeddingProgress}%
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
                              .slice(0, EMBEDDING_CONSTANTS.EMBEDDING_PREVIEW_COUNT)
                              .map((v) => v.toFixed(4))
                              .join(", ")}
                            ...]
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Chunk {blockIndex + 1} · {blockEmbedding[0].length}{" "}
                            dimensions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {loadingState.status === "error"
                      ? `Couldn't create vectors. ${loadingState.error}`
                      : loadingState.status !== "idle"
                      ? "Waiting for the model…"
                      : "Vectors appear here."}
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
