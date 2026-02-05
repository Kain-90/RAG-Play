import { ChartOptions } from "chart.js";

export interface Vector {
  x: number;
  y: number;
  title?: string;
  details?: string[];
  distance?: number;
}

export interface LowVectorVisualizationProps {
  data: Vector[];
  query?: Vector;
  title?: string;
  datasetLabel?: string;
  queryLabel?: string;
  className?: string;
}

export interface NearestNeighborsPluginOptions {
  enabled: boolean;
}

export type ExtendedChartOptions = ChartOptions<"scatter"> & {
  plugins: {
    nearestNeighbors: NearestNeighborsPluginOptions;
  };
};
