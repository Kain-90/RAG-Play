import { FC, useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Plugin,
  TooltipItem,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { cn } from "@/lib/utils";
import {
  Vector,
  LowVectorVisualizationProps,
  ExtendedChartOptions,
  QueryLinksPluginOptions,
} from "@/app/experiment/types/chart";

// UMAP distorts distances, so the caller supplies the true top matches to link.
const queryLinksPlugin: Plugin<"scatter"> = {
  id: "queryLinks",
  afterDraw: (chart, _args, options: QueryLinksPluginOptions) => {
    const { ctx, scales } = chart;
    const queryDataset = chart.data.datasets[1];
    const vectorsDataset = chart.data.datasets[0];

    if (!queryDataset?.data[0]) {
      return;
    }

    const query = queryDataset.data[0] as Vector;
    const vectors = vectorsDataset.data as Vector[];
    const linkedPoints = options.indices
      .map((index) => vectors[index])
      .filter((point): point is Vector => Boolean(point));

    const startX = scales.x.getPixelForValue(query.x);
    const startY = scales.y.getPixelForValue(query.y);

    // Draw dashed lines with more visible style
    ctx.save();
    ctx.strokeStyle = "rgba(128, 128, 128, 0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    linkedPoints.forEach((point) => {
      ctx.moveTo(startX, startY);
      ctx.lineTo(
        scales.x.getPixelForValue(point.x),
        scales.y.getPixelForValue(point.y)
      );
    });

    ctx.stroke();
    ctx.restore();
  },
};

// Register the plugin
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  queryLinksPlugin
);

const LowVectorVisualization: FC<LowVectorVisualizationProps> = ({
  data,
  query,
  title = "Vector Map",
  datasetLabel = "Vectors",
  queryLabel = "Query",
  className,
  onPointClick,
  linkedIndices = [],
}) => {
  const chartData = useMemo(() => {
    const datasets = [
      {
        label: datasetLabel,
        data: data.map((point) => ({
          x: point.x,
          y: point.y,
          title: point.title,
          details: point.details,
        })),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ];

    if (query) {
      datasets.push({
        label: queryLabel,
        data: [
          {
            x: query.x,
            y: query.y,
            title: query.title,
            details: query.details,
          },
        ],
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        pointRadius: 8,
        pointHoverRadius: 10,
      });
    }

    return { datasets };
  }, [data, query, datasetLabel, queryLabel]);

  const options: ExtendedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event, elements) => {
      const dataPoint = elements.find((element) => element.datasetIndex === 0);
      if (!dataPoint || !onPointClick) {
        return;
      }
      onPointClick(dataPoint.index);
    },
    onHover: (event, elements) => {
      const canvas = event.native?.target;
      if (!(canvas instanceof HTMLElement)) {
        return;
      }
      const isOverDataPoint =
        Boolean(onPointClick) &&
        elements.some((element) => element.datasetIndex === 0);
      canvas.style.cursor = isOverDataPoint ? "pointer" : "default";
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      // Title renders outside the canvas so it aligns with sibling headings.
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"scatter">) => {
            const point = context.raw as Vector;
            const lines: string[] = [];

            if (point.title) {
              lines.push(point.title);
            }

            lines.push(`(x: ${context.parsed.x}, y: ${context.parsed.y})`);

            if (point.details?.length) {
              lines.push(...point.details);
            }

            return lines;
          },
        },
      },
      queryLinks: {
        indices: linkedIndices,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        title: {
          display: true,
          text: "X Axis",
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        title: {
          display: true,
          text: "Y Axis",
        },
      },
    },
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
        className
      )}
      role="region"
      aria-label={`${title} scatter plot`}
    >
      <Scatter options={options} data={chartData} />
    </div>
  );
};

export default LowVectorVisualization;
