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

  // Minimum data points required for UMAP
  const MIN_DATA_POINTS = 3;
  
  if (embeddings.length < MIN_DATA_POINTS) {
    throw new Error(
      `Not enough data points (${embeddings.length}) for UMAP visualization. Need at least ${MIN_DATA_POINTS} points.`
    );
  }

  // Calculate optimal nNeighbors based on data size
  // UMAP requires nNeighbors < number of data points
  const optimalNeighbors = Math.min(
    15, // Default value
    Math.max(2, Math.floor(embeddings.length / 2)) // At least 2, at most half the data points
  );

  const defaultConfig: UMAPParameters = {
    nComponents: config.nComponents || 2,
    nNeighbors: config.nNeighbors || optimalNeighbors,
    minDist: 0.1,
    spread: 1.0,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Ensure nNeighbors is valid for the data size
  if (finalConfig.nNeighbors! >= embeddings.length) {
    finalConfig.nNeighbors = Math.max(2, embeddings.length - 1);
  }

  // Additional validation
  if (embeddings.length <= finalConfig.nNeighbors!) {
    throw new Error(
      `Not enough data points (${embeddings.length}) for ${finalConfig.nNeighbors} neighbors. Need at least ${finalConfig.nNeighbors! + 1} points.`
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
