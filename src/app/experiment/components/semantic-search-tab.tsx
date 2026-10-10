"use client";

import { useCallback } from "react";
import LowVectorVisualization from "@/app/experiment/components/low-vector-visualization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEmbedding2D } from "@/app/hooks/useEmbedding2D";
import { useChunkHighlight } from "@/app/hooks/useChunkHighlight";
import { EMBEDDING_CONSTANTS } from "@/app/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UseEmbeddingWorkerReturn } from "@/app/hooks/useEmbeddingWorker";
import { useEmbeddingStore } from "@/app/stores/experiment/embedding-store";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import { EmbeddingDisplay } from "./embedding/EmbeddingDisplay";
import { SimilarityPanel } from "./embedding/SimilarityPanel";

interface SemanticSearchTabProps {
  embeddingWorker: UseEmbeddingWorkerReturn;
}

export function SemanticSearchTab({
  embeddingWorker,
}: SemanticSearchTabProps) {
  const { blocks } = useTextSplittingStore();
  const {
    similarities,
    question,
    questionEmbedding,
    blocksEmbedding,
    setQuestion,
    clearSemanticSearch,
  } = useEmbeddingStore();
  const { loadingState, debouncedGetEmbedding } = embeddingWorker;
  const { highlightedIndex, getChunkElementId, highlightChunk } =
    useChunkHighlight("search-match");

  const embedding2d = useEmbedding2D({
    questionEmbedding,
    blocksEmbedding,
    question,
  });

  const handleQuestionChange = useCallback(
    (newQuestion: string) => {
      setQuestion(newQuestion);
      if (!newQuestion.trim()) {
        clearSemanticSearch();
        return;
      }

      debouncedGetEmbedding(newQuestion);
    },
    [clearSemanticSearch, debouncedGetEmbedding, setQuestion]
  );

  const handlePointClick = (index: number) => {
    if (highlightChunk(index)) {
      return;
    }
    toast(
      `Chunk ${index + 1} isn't in the top ${EMBEDDING_CONSTANTS.SIMILARITY_TOP_N} matches.`
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Search</CardTitle>
        <CardDescription>
          Ask a question. We turn it into a vector and find the closest chunks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EmbeddingDisplay
          question={question}
          questionEmbedding={questionEmbedding}
          onQuestionChange={handleQuestionChange}
        />

        <div
          className={cn(
            "grid grid-cols-1 items-start gap-6",
            embedding2d.length > 0 && "lg:grid-cols-2"
          )}
        >
          <SimilarityPanel
            similarities={similarities}
            blocks={blocks}
            isLoading={loadingState.status === "embedding"}
            highlightedIndex={highlightedIndex}
            getChunkElementId={getChunkElementId}
          />

          {embedding2d.length > 0 && (
            <figure className="mx-auto w-full max-w-2xl space-y-2 lg:max-w-none">
              <h3 className="text-sm font-medium">Question vs. Chunks</h3>
              <LowVectorVisualization
                data={embedding2d.slice(1)}
                query={embedding2d[0]}
                title="Question vs. Chunks"
                datasetLabel="Chunks"
                queryLabel="Question"
                className="h-[500px]"
                onPointClick={handlePointClick}
              />
              <figcaption className="pt-1 text-sm text-muted-foreground">
                Your question uses the same model as the chunks, so they can be
                compared. Chunks are embedded once ahead of time; your question is
                embedded each time you ask. Click a point to find it in Top
                Matches.
              </figcaption>
            </figure>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
