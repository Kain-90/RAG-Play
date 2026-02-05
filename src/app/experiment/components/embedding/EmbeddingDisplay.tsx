import { Textarea } from "@/components/ui/textarea";
import { EMBEDDING_CONSTANTS } from "@/app/hooks";

interface EmbeddingDisplayProps {
  question: string;
  questionEmbedding: number[][];
  onQuestionChange: (question: string) => void;
}

export function EmbeddingDisplay({
  question,
  questionEmbedding,
  onQuestionChange,
}: EmbeddingDisplayProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Ask a question to find similar content:
      </label>
      <Textarea
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        className="min-h-[80px]"
        style={{ minHeight: EMBEDDING_CONSTANTS.MIN_INPUT_HEIGHT }}
        placeholder="Enter your question here..."
      />
      {questionEmbedding.length > 0 && (
        <div className="mt-4 p-3 rounded-md bg-muted/50">
          <div className="text-xs space-y-1">
            <p className="text-sm">
              [
              {questionEmbedding[0]
                .slice(0, EMBEDDING_CONSTANTS.EMBEDDING_PREVIEW_COUNT)
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
  );
}
