import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UILoadingState, UIFileProgress } from "@/app/experiment/types/embedding";

interface LoadingPanelProps {
  loadingState: UILoadingState;
  loadingProgress: number;
  fileProgresses: Map<string, UIFileProgress>;
  isLoadingExpanded: boolean;
  onToggleExpanded: () => void;
}

export function LoadingPanel({
  loadingState,
  loadingProgress,
  fileProgresses,
  isLoadingExpanded,
  onToggleExpanded,
}: LoadingPanelProps) {
  if (loadingState.status === "initiate") {
    return null;
  }

  return (
    <div className="flex flex-col space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {loadingState.status === "loading-model" && "Loading model..."}
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
              onClick={onToggleExpanded}
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
  );
}
