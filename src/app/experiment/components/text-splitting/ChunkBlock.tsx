import { EnhancedTextBlock } from "@/app/experiment/types/text-splitting";
import { getChunkColor } from "@/app/experiment/constants/chunk-colors";

interface ChunkBlockProps {
  block: EnhancedTextBlock;
  index: number;
  onHover: (index: number | null) => void;
}

export function ChunkBlock({ block, index, onHover }: ChunkBlockProps) {
  const color = getChunkColor(index);

  return (
    <span
      className={`${color.bg} px-1.5 py-0.5 rounded mx-0.5 inline-block cursor-pointer 
      transition-opacity hover:opacity-80 relative group`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="absolute -top-2 -right-1 bg-muted-foreground/10 text-muted-foreground text-[10px] px-1 rounded">
        {block.text.length}
      </span>
      <>
        {block.overlapText && block.overlapText.length > 0 && (
          <span
            className="inline-block px-1.5 py-0.5 -ml-1 border-2 border-dashed border-orange-400 bg-orange-100 text-orange-800 rounded font-medium text-xs mr-1"
            title={`Overlap: ${block.overlapText.length} characters`}
          >
            ↪ {block.overlapText}
          </span>
        )}
        <span
          className={
            block.overlapText && block.overlapText.length > 0
              ? "text-gray-700"
              : ""
          }
        >
          {block.text.slice(block.overlapText?.length || 0)}
        </span>
      </>
    </span>
  );
}
