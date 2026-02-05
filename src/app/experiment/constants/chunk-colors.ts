export const CHUNK_COLORS = [
  { bg: "bg-red-100", border: "#fecaca" },
  { bg: "bg-blue-100", border: "#bfdbfe" },
  { bg: "bg-green-100", border: "#bbf7d0" },
  { bg: "bg-yellow-100", border: "#fef08a" },
  { bg: "bg-purple-100", border: "#e9d5ff" },
  { bg: "bg-pink-100", border: "#fbcfe8" },
] as const;

export type ChunkColorKey = number;

export function getChunkColor(index: number): (typeof CHUNK_COLORS)[number] {
  return CHUNK_COLORS[index % CHUNK_COLORS.length];
}

export function getParentGroupColor(parentIndex: number): {
  bg: string;
  border: string;
} {
  return getChunkColor(parentIndex);
}
