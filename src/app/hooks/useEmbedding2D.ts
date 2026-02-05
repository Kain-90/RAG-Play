import { useMemo } from "react";
import { embedTo2D } from "@/lib/utils";
import { EMBEDDING_CONSTANTS } from "./useEmbeddingConstants";

interface UseEmbedding2DProps {
  questionEmbedding: number[][];
  blocksEmbedding: number[][][];
  question: string;
}

interface Vector2DPoint {
  x: number;
  y: number;
  title: string;
}

export function useEmbedding2D({
  questionEmbedding,
  blocksEmbedding,
  question,
}: UseEmbedding2DProps): Vector2DPoint[] {
  return useMemo(() => {
    if (
      questionEmbedding.length === 0 ||
      blocksEmbedding.length === 0
    ) {
      return [];
    }

    if (
      blocksEmbedding.length + 1 < EMBEDDING_CONSTANTS.MIN_EMBEDDING_POINTS
    ) {
      return [];
    }

    try {
      const finalEmbedding = [
        questionEmbedding[0],
        ...blocksEmbedding.map((embedding) => embedding[0]),
      ];

      const embedding2d = embedTo2D(finalEmbedding);

      return embedding2d.map((point, index) => ({
        ...point,
        title:
          index === 0
            ? question.slice(0, EMBEDDING_CONSTANTS.EMBEDDING_PREVIEW_COUNT)
            : `Chunk ${index}`,
      }));
    } catch {
      return [];
    }
  }, [questionEmbedding, blocksEmbedding, question]);
}
