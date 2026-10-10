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
          See how a document is cut into chunks that still make sense.
        </CardDescription>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start space-x-2">
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
            <div>
              <strong className="text-foreground">Fixed Character:</strong>{" "}
              Cuts only at the first separator, then fills each chunk up to the
              size limit.
            </div>
          </li>
          <li className="flex items-start space-x-2">
            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
            <div>
              <strong className="text-foreground">Recursive Character:</strong>{" "}
              Tries each separator in order, so chunks break at natural spots.
              Best default.
            </div>
          </li>
          <li className="flex items-start space-x-2">
            <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
            <div>
              <strong className="text-foreground">Parent-Child:</strong>{" "}
              Searches small chunks for precision, then answers with their
              larger parent for context.
            </div>
          </li>
        </ul>
        <blockquote className="text-xs text-muted-foreground border-l-4 border-muted-foreground/25 px-4 py-2 space-y-2">
          Some chunks may go over the size limit when text can&apos;t be cut
          cleanly.
        </blockquote>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Strategy</span>
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
