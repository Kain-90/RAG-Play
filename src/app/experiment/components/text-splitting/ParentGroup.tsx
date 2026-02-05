import { EnhancedTextBlock } from "@/app/experiment/types/text-splitting";
import { getParentGroupColor } from "@/app/experiment/constants/chunk-colors";

interface ParentGroupProps {
  parentId: number;
  childBlocks: EnhancedTextBlock[];
  blocks: EnhancedTextBlock[];
  onChunkHover: (index: number | null) => void;
}

export function ParentGroup({
  parentId,
  childBlocks,
  blocks,
  onChunkHover,
}: ParentGroupProps) {
  const color = getParentGroupColor(parentId);
  const totalParentChars = childBlocks.reduce(
    (sum, block) => sum + block.text.length,
    0
  );

  return (
    <div className="mb-4 pb-3 border-b border-border/30 last:border-b-0">
      <div
        className={`${color.bg} px-3 py-2 rounded-md mb-2 font-semibold text-sm flex items-center justify-between`}
      >
        <span>
          Parent {parentId + 1} ({childBlocks.length}{" "}
          {childBlocks.length === 1 ? "child" : "children"})
        </span>
        <span className="text-xs font-normal text-muted-foreground">
          {totalParentChars} chars
        </span>
      </div>
      <div className="pl-4 border-l-4" style={{ borderColor: color.border }}>
        {childBlocks.map((block, childIndex) => {
          const globalIndex = blocks.indexOf(block);
          return (
            <span
              key={`child-${parentId}-${childIndex}`}
              className={`${color.bg} px-1.5 py-0.5 rounded mx-0.5 inline-block cursor-pointer 
              transition-opacity hover:opacity-80 relative group border border-current/20`}
              onMouseEnter={() => onChunkHover(globalIndex)}
              onMouseLeave={() => onChunkHover(null)}
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
        })}
      </div>
    </div>
  );
}
