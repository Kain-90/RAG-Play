import { pipeline, PipelineType, Tensor } from "@huggingface/transformers";
import { EmbeddingModel, EmbeddingTaskMessage } from "../types/embedding";
import { FeatureExtractionPipeline } from "@huggingface/transformers";
import {
  EmbeddingProgressMessage,
  LangchainProgress,
} from "../types/embedding";

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static task: PipelineType = "feature-extraction";
  static model: EmbeddingModel = "Snowflake/snowflake-arctic-embed-xs";
  static instance: FeatureExtractionPipeline | null = null;

  static async getInstance(
    progress_callback: (x: EmbeddingProgressMessage) => void
  ) {
    if (!this.instance) {
      let message: EmbeddingProgressMessage = {
        status: "loading",
        message: "Model loading started",
      };
      progress_callback(message);

      this.instance = (await pipeline(this.task, this.model, {
        progress_callback: (progress: LangchainProgress) => {
          message = {
            status: "loading",
            progress: progress,
            message: "Model loading in progress",
          };
          progress_callback(message);
        },
      })) as FeatureExtractionPipeline;

      message = { status: "ready", message: "Model ready" };
      progress_callback(message);
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event: MessageEvent<EmbeddingTaskMessage>) => {
  console.log("Worker received message:", event.data);
  
  try {
    if (!event.data.task) {
      throw new Error("No task specified");
    }

    if (event.data.task === "feature-extraction") {
      console.log("Starting feature extraction...");
      
      const task = await PipelineSingleton.getInstance(
        (x: EmbeddingProgressMessage) => {
          console.log("Pipeline progress:", x);
          self.postMessage(x);
        }
      );

      if (!task) {
        throw new Error("Failed to initialize pipeline");
      }

      let output: Tensor | Tensor[];
      if (!event.data.text || event.data.text.length === 0) {
        output = [];
      } else if (Array.isArray(event.data.text)) {
        console.log("Processing text blocks:", event.data.text.length);
        
        // 添加批处理进度报告
        const totalBlocks = event.data.text.length;
        output = [];
        
        // 每个文本块单独处理，这样可以报告进度
        for (let i = 0; i < totalBlocks; i++) {
          const result = await task(event.data.text[i], {
            normalize: true,
            pooling: "cls"
          });
          output.push(result);

          // 报告进度
          const progressMessage: EmbeddingProgressMessage = {
            status: "embedding",
            progress: {
              name: "text-blocks",
              status: "loading",
              progress: Math.round(((i + 1) / totalBlocks) * 100)
            },
            message: `Processing block ${i + 1}/${totalBlocks}`
          };
          self.postMessage(progressMessage);
        }
      } else {
        output = await task(event.data.text, {
          normalize: true,
          pooling: "cls",
        });
      }

      console.log("Feature extraction completed");
      
      const message: EmbeddingProgressMessage = {
        status: "complete",
        type: event.data.type,
        output: Array.isArray(output)
          ? output.map((o) => o.tolist())
          : [output.tolist()],
      };
      self.postMessage(message);
    } else {
      throw new Error(`Invalid task: ${event.data.task}`);
    }
  } catch (error) {
    console.error("Worker error:", error);
    const message: EmbeddingProgressMessage = {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(message);
  }
});
