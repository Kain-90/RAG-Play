import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMBEDDING_MODELS,
  EmbeddingModel,
} from "@/app/experiment/types/embedding";
import { EMBEDDING_CONSTANTS } from "@/app/hooks";

interface ModelSelectorProps {
  model: EmbeddingModel;
  onModelChange: (model: EmbeddingModel) => void;
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium">Embedding Model:</span>
      <Select value={model} onValueChange={(value) => onModelChange(value as EmbeddingModel)}>
        <SelectTrigger
          className="w-[400px]"
          style={{ width: EMBEDDING_CONSTANTS.SELECTOR_WIDTH }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EMBEDDING_MODELS.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
