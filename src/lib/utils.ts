import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UMAP, UMAPParameters } from "umap-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uMapEmbed(embeddings: number[][], config: UMAPParameters = {}) {
  if (!embeddings.length) {
    throw new Error("Empty embeddings array provided");
  }

  const defaultConfig: UMAPParameters = {
    nComponents: config.nComponents || 2,
    nNeighbors: Math.max(15, Math.floor(embeddings.length / 2)), // Adjust neighbors based on data size
    minDist: 0.1,
    spread: 1.0,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Additional validation
  if (embeddings.length < finalConfig.nNeighbors!) {
    throw new Error(
      `Not enough data points (${embeddings.length}) for ${finalConfig.nNeighbors} neighbors. Add more data points or reduce nNeighbors.`
    );
  }

  const umap = new UMAP(finalConfig);
  return umap.fit(embeddings);
}

export function embedTo2D(embeddings: number[][], config: UMAPParameters = {}) {
  const embedding = uMapEmbed(embeddings, config);
  return embedding.map((coords) => ({
    x: coords[0],
    y: coords[1],
  }));
}
