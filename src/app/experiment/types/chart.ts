import { ChartOptions } from "chart.js";

export interface Vector {
  x: number;
  y: number;
  title?: string;
  details?: string[];
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
  /** Indices into `data` to link to the query with dashed lines. */
  linkedIndices?: number[];
}

export interface QueryLinksPluginOptions {
  /** Indices into the data dataset to link to the query point. */
  indices: number[];
}

export type ExtendedChartOptions = ChartOptions<"scatter"> & {
  plugins: {
    queryLinks: QueryLinksPluginOptions;
  };
};
