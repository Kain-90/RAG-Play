import { StrategySelector } from "@/app/experiment/components/text-splitting/StrategySelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SeparatorManager } from "@/app/experiment/components/separator-manager";
import { ChunkSizeInput } from "@/app/experiment/components/text-splitting/ChunkSizeInput";
import { OverlapSizeInput } from "@/app/experiment/components/text-splitting/OverlapSizeInput";
import { SourceDocumentInput } from "@/app/experiment/components/text-splitting/SourceDocumentInput";
import { GeneratedChunks } from "@/app/experiment/components/text-splitting/GeneratedChunks";

export function TextSplittingTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Splitting</CardTitle>
        <CardDescription>
          Visualize how documents are split into meaningful chunks while
          preserving semantic coherence
        </CardDescription>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start space-x-2">
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <div>
              <strong className="text-foreground">
                Fixed Character strategy:
              </strong>{" "}
              Simple uniform segmentation based on predetermined character
              length. Best for prototyping and resource-constrained environments
              with minimal computational overhead.
            </div>
          </li>
          <li className="flex items-start space-x-2">
            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
            <div>
              <strong className="text-foreground">
                Recursive character strategy:
              </strong>{" "}
              Multi-tier algorithm that preserves natural language boundaries
              and semantic coherence. Recommended for applications requiring
              semantic integrity.
            </div>
          </li>
          <li className="flex items-start space-x-2">
            <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
            <div>
              <strong className="text-foreground">
                Parent-Child character strategy:
              </strong>{" "}
              Dual-tier architecture using fine-grained chunks for precise
              matching while maintaining parent documents for rich contextual
              information. Optimal for complex applications requiring balanced
              accuracy and completeness.
            </div>
          </li>
        </ul>
        <blockquote className="text-xs text-muted-foreground border-l-4 border-muted-foreground/25 px-4 py-2 space-y-2">
          When merging and splitting segments, some segments themselves exceed
          the chunk size in length, or the splitting and reassembly logic causes
          the combined length to exceed the set value, resulting in over-limit
          chunks.
        </blockquote>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Split Strategy:</span>
          <StrategySelector />
        </div>
        <div className="flex items-center space-x-4">
          <ChunkSizeInput />
          <OverlapSizeInput />
        </div>

        <SeparatorManager />

        <div className="grid grid-cols-2 gap-6">
          <SourceDocumentInput />
          <GeneratedChunks />
        </div>
      </CardContent>
    </Card>
  );
}
