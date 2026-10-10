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
import { useChunkHighlight } from "@/app/hooks/useChunkHighlight";
import { cn, embedTo2D } from "@/lib/utils";

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

  const { highlightedIndex, getChunkElementId, highlightChunk } =
    useChunkHighlight("embedding-chunk");

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

  // Hide vectors while re-embedding so stale vectors never sit next to new text.
  const hasCurrentVectors =
    loadingState.status !== "embedding" &&
    blocksEmbedding.length === blocks.length;

  const getVectorStatus = (): string | null => {
    if (loadingState.status === "embedding") {
      return `Embedding chunks… ${embeddingProgress}%`;
    }
    if (loadingState.status === "error") {
      return `Couldn't create vectors. ${loadingState.error}`;
    }
    if (hasCurrentVectors || loadingState.status === "idle") {
      return null;
    }
    return "Waiting for the model…";
  };

  const vectorStatus = blocks.length > 0 ? getVectorStatus() : null;

  const handleModelChange = (newModel: string) => {
    setModel(newModel as "Snowflake/snowflake-arctic-embed-xs");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vector Embedding</CardTitle>
        <CardDescription>
          See each chunk next to its vector: the numbers a model uses to
          capture meaning.
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

        <div
          className={cn(
            "grid grid-cols-1 items-start gap-6",
            embedding2d.length > 0 && "lg:grid-cols-2"
          )}
        >
          <section className="space-y-2" aria-label="Chunks and vectors">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium">Chunks &amp; Vectors</h3>
              {vectorStatus && (
                <span className="text-xs text-muted-foreground">
                  {vectorStatus}
                </span>
              )}
            </div>
            <div
              className="rounded-lg border-2 border-dashed border-muted-foreground/25"
              style={{ height: EMBEDDING_CONSTANTS.CHUNK_LIST_HEIGHT }}
            >
              <ScrollArea className="h-full p-4">
                {blocks.length > 0 ? (
                  <div className="space-y-4">
                    {blocks.map((block, index) => {
                      const vector = hasCurrentVectors
                        ? blocksEmbedding[index]?.[0]
                        : undefined;

                      return (
                        <div
                          key={index}
                          id={getChunkElementId(index)}
                          className={cn(
                            "space-y-2 rounded-md bg-muted/50 p-3 transition hover:bg-muted/80",
                            highlightedIndex === index && "ring-2 ring-inset ring-primary/60"
                          )}
                        >
                          <p className="text-sm">{block.text}</p>
                          <p className="break-all font-mono text-xs text-muted-foreground">
                            {vector
                              ? `[${vector
                                  .slice(0, EMBEDDING_CONSTANTS.EMBEDDING_PREVIEW_COUNT)
                                  .map((v) => v.toFixed(4))
                                  .join(", ")}, …]`
                              : loadingState.status === "error"
                              ? "No vector"
                              : "Vector pending…"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Chunk {index + 1} · {block.text.length} chars
                            {vector && ` · ${vector.length} dimensions`}
                            {strategy === "parent-child" &&
                              block.parentId !== undefined && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">
                                  Child of Parent {block.parentId + 1}
                                </span>
                              )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No chunks yet. Add text in Text Splitting.
                  </div>
                )}
              </ScrollArea>
            </div>
          </section>

          {embedding2d.length > 0 && (
            <figure className="mx-auto w-full max-w-2xl space-y-2 lg:max-w-none">
              <h3 className="text-sm font-medium">Chunks in 2D</h3>
              <LowVectorVisualization
                data={embedding2d}
                title="Chunks in 2D"
                datasetLabel="Chunks"
                className="h-[500px]"
                onPointClick={highlightChunk}
              />
              <figcaption className="pt-1 space-y-1 text-sm text-muted-foreground">
                <p>
                  UMAP squeezes hundreds of dimensions into 2D so you can see
                  them. Treat it as a rough map. Click a point to find its
                  chunk.
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Distances here are approximate, not exact similarity scores.</li>
                  <li>The layout can shift each run. That&apos;s normal.</li>
                  <li>
                    Only chunks appear here. Your question shows up in Semantic
                    Search.
                  </li>
                </ul>
              </figcaption>
            </figure>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
