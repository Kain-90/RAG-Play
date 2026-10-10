import { useCallback, useEffect, useRef, useState } from "react";

const HIGHLIGHT_DURATION_MS = 1500;

export interface UseChunkHighlightReturn {
  highlightedIndex: number | null;
  getChunkElementId: (index: number) => string;
  /** Scrolls the chunk into view and flashes it. Returns false if it isn't rendered. */
  highlightChunk: (index: number) => boolean;
}

/**
 * Links chart points to chunk cards: each card gets a DOM id from
 * `getChunkElementId`, and `highlightChunk` scrolls to it and flashes it.
 * `idPrefix` must be unique per list because all experiment tabs stay mounted.
 */
export function useChunkHighlight(idPrefix: string): UseChunkHighlightReturn {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const getChunkElementId = useCallback(
    (index: number) => `${idPrefix}-${index}`,
    [idPrefix]
  );

  const highlightChunk = useCallback(
    (index: number) => {
      const element = document.getElementById(getChunkElementId(index));
      if (!element) {
        return false;
      }

      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setHighlightedIndex(index);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => setHighlightedIndex(null),
        HIGHLIGHT_DURATION_MS
      );
      return true;
    },
    [getChunkElementId]
  );

  return { highlightedIndex, getChunkElementId, highlightChunk };
}
