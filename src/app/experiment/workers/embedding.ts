import { pipeline, PipelineType, Tensor } from "@huggingface/transformers";
import { EmbeddingModel, EmbeddingTaskMessage } from "../types/embedding";
import {
  FeatureExtractionPipeline,
  ProgressInfo,
} from "@huggingface/transformers";
import { EmbeddingProgressMessage } from "../types/embedding";

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static task: PipelineType = "feature-extraction";
  static model: EmbeddingModel = "Snowflake/snowflake-arctic-embed-xs";
  static instance: FeatureExtractionPipeline | null = null;

  static async getInstance(
    progress_callback_fn: (x: EmbeddingProgressMessage) => void
  ) {
    if (!this.instance) {
      let message: EmbeddingProgressMessage = {
        status: "loading",
        message: "Model loading started",
      };
      progress_callback_fn(message);

      this.instance = (await pipeline(this.task, this.model, {
        progress_callback: (progress: ProgressInfo) => {
          if (progress.status === "progress") {
            message = {
              status: "loading",
              progress: progress,
              message: "Model loading in progress",
            };
            progress_callback_fn(message);
          }
        },
      })) as FeatureExtractionPipeline;

      message = { status: "ready", message: "Model ready" };
      progress_callback_fn(message);
    }
    return this.instance;
  }
}

// Add new helper function for batch processing
async function processBatchEmbeddings(
  task: FeatureExtractionPipeline,
  texts: string[]
): Promise<Tensor[]> {
  const totalBlocks = texts.length;
  const output: Tensor[] = [];

  for (let i = 0; i < totalBlocks; i++) {
    const result = await task(texts[i], {
      normalize: true,
      pooling: "cls",
    });
    output.push(result);

    self.postMessage({
      status: "embedding",
      progress: {
        name: "text-blocks",
        status: "loading",
        progress: Math.round(((i + 1) / totalBlocks) * 100),
      },
      message: `Processing block ${i + 1}/${totalBlocks}`,
    } as EmbeddingProgressMessage);
  }

  return output;
}

// Main message handler
self.addEventListener(
  "message",
  async (event: MessageEvent<EmbeddingTaskMessage>) => {
    console.log("Worker received message:", event.data);

    try {
      if (!event.data.task) {
        throw new Error("No task specified");
      }

      if (event.data.task !== "feature-extraction") {
        throw new Error(`Invalid task: ${event.data.task}`);
      }

      // Early return for empty input
      if (!event.data.text || event.data.text.length === 0) {
        self.postMessage({
          status: "complete",
          type: event.data.type,
          output: [],
        } as EmbeddingProgressMessage);
        return;
      }

      const task = await PipelineSingleton.getInstance(
        (x: EmbeddingProgressMessage) => {
          console.log("Pipeline progress:", x);
          self.postMessage(x);
        }
      );

      if (!task) {
        throw new Error("Failed to initialize pipeline");
      }

      const output: Tensor | Tensor[] = Array.isArray(event.data.text)
        ? await processBatchEmbeddings(task, event.data.text)
        : await task(event.data.text, { normalize: true, pooling: "cls" });

      console.log("Feature extraction completed");

      self.postMessage({
        status: "complete",
        type: event.data.type,
        output: Array.isArray(output)
          ? output.map((o) => o.tolist())
          : [output.tolist()],
      } as EmbeddingProgressMessage);
    } catch (error) {
      console.error("Worker error:", error);
      self.postMessage({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      } as EmbeddingProgressMessage);
    }
  }
);
