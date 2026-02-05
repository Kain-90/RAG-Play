"use client";

import LowVectorVisualization from "@/app/experiment/components/low-vector-visualization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import { useEmbeddingStore } from "@/app/stores/experiment/embedding-store";
import { useEmbeddingWorker } from "@/app/hooks/useEmbeddingWorker";
import { useEmbedding2D } from "@/app/hooks/useEmbedding2D";
import { ModelSelector } from "./embedding/ModelSelector";
import { LoadingPanel } from "./embedding/LoadingPanel";
import { EmbeddingDisplay } from "./embedding/EmbeddingDisplay";
import { SimilarityPanel } from "./embedding/SimilarityPanel";
import { EMBEDDING_CONSTANTS } from "@/app/hooks";
import { DEFAULT_QUESTION } from "@/app/experiment/constants/embedding";

export function EmbeddingTab() {
  const { blocks, strategy } = useTextSplittingStore();
  const {
    similarities,
    questionEmbedding,
    blocksEmbedding,
    model,
    setModel,
    recalculateSimilarities,
  } = useEmbeddingStore();

  const {
    loadingState,
    fileProgresses,
    embeddingProgress,
    loadingProgress,
    isLoadingExpanded,
    setIsLoadingExpanded,
    debouncedGetEmbedding,
  } = useEmbeddingWorker({ blocks, model });

  const [question, setQuestion] = useState(DEFAULT_QUESTION);

  const embedding2d = useEmbedding2D({
    questionEmbedding,
    blocksEmbedding,
    question,
  });

  const handleModelChange = (newModel: string) => {
    setModel(newModel as "Snowflake/snowflake-arctic-embed-xs");
  };

  const handleQuestionChange = useCallback((newQuestion: string) => {
    setQuestion(newQuestion);
    if (newQuestion.trim()) {
      debouncedGetEmbedding(newQuestion);
    } else {
      debouncedGetEmbedding("");
    }
  }, [debouncedGetEmbedding]);

  useEffect(() => {
    if (questionEmbedding.length > 0 && blocksEmbedding.length > 0) {
      recalculateSimilarities();
    }
  }, [questionEmbedding, blocksEmbedding, recalculateSimilarities]);

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
        <ModelSelector model={model} onModelChange={handleModelChange} />

        <LoadingPanel
          loadingState={loadingState}
          loadingProgress={loadingProgress}
          fileProgresses={fileProgresses}
          isLoadingExpanded={isLoadingExpanded}
          onToggleExpanded={() => setIsLoadingExpanded(!isLoadingExpanded)}
        />

        <EmbeddingDisplay
          question={question}
          questionEmbedding={questionEmbedding}
          onQuestionChange={handleQuestionChange}
        />

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
            <div
              className="rounded-lg border-2 border-dashed border-muted-foreground/25"
              style={{ height: EMBEDDING_CONSTANTS.CHUNK_LIST_HEIGHT }}
            >
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
                              .slice(0, EMBEDDING_CONSTANTS.EMBEDDING_PREVIEW_COUNT)
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

          <SimilarityPanel
            similarities={similarities}
            blocks={blocks}
            isLoading={loadingState.status === "embedding"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
