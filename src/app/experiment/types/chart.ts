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
  /** Called with the index into `data` when a data point (not the query) is clicked. */
  onPointClick?: (index: number) => void;
}

export interface NearestNeighborsPluginOptions {
  enabled: boolean;
}

export type ExtendedChartOptions = ChartOptions<"scatter"> & {
  plugins: {
    nearestNeighbors: NearestNeighborsPluginOptions;
  };
};
