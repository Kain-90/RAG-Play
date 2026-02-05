import { ScrollArea } from "@/components/ui/scroll-area";
import { EnhancedTextBlock } from "@/app/experiment/types/text-splitting";
import { EMBEDDING_CONSTANTS } from "@/app/hooks";

interface SimilarityResult {
  index: number;
  similarity: number;
}

interface SimilarityPanelProps {
  similarities: SimilarityResult[];
  blocks: EnhancedTextBlock[];
  isLoading: boolean;
}

export function SimilarityPanel({
  similarities,
  blocks,
  isLoading,
}: SimilarityPanelProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Similar Chunks:</label>
      <div
        className="rounded-lg border-2 border-dashed border-muted-foreground/25"
        style={{ height: EMBEDDING_CONSTANTS.CHUNK_LIST_HEIGHT }}
      >
        <ScrollArea className="h-full p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Embedding... {/* Progress handled by parent */}
            </div>
          ) : similarities.length > 0 && blocks.length > 0 ? (
            <div className="space-y-2">
              {similarities
                .slice(0, EMBEDDING_CONSTANTS.SIMILARITY_TOP_N)
                .filter(({ index }) => index < blocks.length && blocks[index])
                .map(({ index, similarity }) => (
                  <div
                    key={index}
                    className="p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    <p className="text-sm">{blocks[index].text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chunk {index + 1} • Similarity: {similarity.toFixed(4)}
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
  );
}
