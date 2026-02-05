import { useEffect, useRef, useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  EmbeddingModel,
  EmbeddingProgressMessage,
  EmbeddingTaskMessage,
  UILoadingState,
  UIFileProgress,
} from "@/app/experiment/types/embedding";
import { useEmbeddingStore } from "@/app/stores/experiment/embedding-store";
import { EMBEDDING_CONSTANTS } from "./useEmbeddingConstants";
import { DEFAULT_QUESTION } from "@/app/experiment/constants/embedding";

interface UseEmbeddingWorkerProps {
  blocks: { text: string }[];
  model: EmbeddingModel;
}

interface UseEmbeddingWorkerReturn {
  loadingState: UILoadingState;
  fileProgresses: Map<string, UIFileProgress>;
  embeddingProgress: number;
  loadingProgress: number;
  isLoadingExpanded: boolean;
  setIsLoadingExpanded: (expanded: boolean) => void;
  question: string;
  setQuestion: (question: string) => void;
  debouncedGetEmbedding: (question?: string) => void;
}

export function useEmbeddingWorker({
  blocks,
  model,
}: UseEmbeddingWorkerProps): UseEmbeddingWorkerReturn {
  const { setQuestionEmbedding, setBlocksEmbedding, setWorker } =
    useEmbeddingStore();

  const [loadingState, setLoadingState] = useState<UILoadingState>({
    status: "initiate",
  });
  const [fileProgresses, setFileProgresses] = useState<
    Map<string, UIFileProgress>
  >(new Map());
  const [embeddingProgress, setEmbeddingProgress] = useState<number>(0);
  const [isLoadingExpanded, setIsLoadingExpanded] = useState(true);
  const [question, setQuestion] = useState("");

  const workerRef = useRef<Worker | null>(null);
  const autoComputeRef = useRef<{ enabled: boolean; blocksDone: boolean }>({
    enabled: false,
    blocksDone: false,
  });

  const calculateOverallProgress = useCallback(() => {
    if (fileProgresses.size === 0) return 0;

    let total = 0;
    fileProgresses.forEach((file) => {
      total += file.status === "done" ? 100 : file.progress;
    });

    return Math.round(total / fileProgresses.size);
  }, [fileProgresses]); // Used by parent component

  const handleWorkerMessage = useCallback(
    (event: MessageEvent<EmbeddingProgressMessage>) => {
      const { status, progress, message, output, type } = event.data;

      if (status === "loading" && progress?.file) {
        setLoadingState({
          status: "loading-model",
          progress,
        });

          const filename = progress.file;
          setFileProgresses((prev) => {
            const newFileProgresses = new Map(prev);
            if (progress?.status === "done") {
              newFileProgresses.set(filename, {
                filename,
                progress: 100,
                status: "done",
              });
            } else {
              newFileProgresses.set(filename, {
                filename,
                progress: progress?.progress || 0,
                status: "loading",
              });
            }
            return newFileProgresses;
          });
      } else if (status === "embedding") {
        setLoadingState({ status: "embedding" });
        setEmbeddingProgress(progress?.progress || 0);
      } else if (status === "ready") {
        setLoadingState({ status: "loading-model-complete" });

        // Auto-compute embeddings for existing blocks when model is ready
        if (!autoComputeRef.current.enabled && blocks.length > 0 && workerRef.current) {
          autoComputeRef.current.enabled = true;
          const textBlocks = blocks
            .map((block) => block.text)
            .filter((block) => block.length > 0);

          if (textBlocks.length > 0) {
            const message: EmbeddingTaskMessage = {
              task: "feature-extraction",
              model,
              text: textBlocks,
              type: "blocks",
            };
            workerRef.current.postMessage(message);
            setLoadingState({ status: "embedding" });
          }
        }
      } else if (status === "complete" && output) {
        if (type === "question") {
          setQuestionEmbedding(output[0]);
        } else {
          setBlocksEmbedding(output);

          // Auto-compute question embedding after blocks are done (for similarity calculation)
          if (autoComputeRef.current.enabled && !autoComputeRef.current.blocksDone && workerRef.current) {
            autoComputeRef.current.blocksDone = true;
            const questionMessage: EmbeddingTaskMessage = {
              task: "feature-extraction",
              model,
              text: DEFAULT_QUESTION,
              type: "question",
            };
            workerRef.current.postMessage(questionMessage);
            setLoadingState({ status: "embedding" });
          }
        }
        setLoadingState({ status: "idle" });
      } else if (status === "error") {
        setBlocksEmbedding([]);
        setLoadingState({
          status: "error",
          error: message,
        });
      }
    },
    [setQuestionEmbedding, setBlocksEmbedding, blocks, model]
  );

  const debouncedGetEmbedding = useDebouncedCallback(
    (questionText: string = "") => {
      if (!workerRef.current) {
        return;
      }

      setLoadingState({ status: "embedding" });

      const textBlocks =
        questionText.length > 0
          ? [questionText]
          : blocks
              .map((block) => block.text)
              .filter((block) => block.length > 0);

      if (textBlocks.length === 0) {
        setBlocksEmbedding([]);
        setLoadingState({ status: "idle" });
        return;
      }

      const message: EmbeddingTaskMessage = {
        task: "feature-extraction",
        model,
        text: textBlocks,
        type: questionText.length > 0 ? "question" : "blocks",
      };

      workerRef.current.postMessage(message);
    },
    EMBEDDING_CONSTANTS.DEBOUNCE_MS
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!workerRef.current) {
      const newWorker = new Worker(
        new URL("../experiment/workers/embedding.ts", import.meta.url),
        { type: "module" }
      );

      newWorker.onmessage = handleWorkerMessage;

      newWorker.onerror = () => {
        setLoadingState({
          status: "error",
          error: "Worker initialization failed",
        });
      };

      workerRef.current = newWorker;
      setWorker(newWorker);

      // Trigger model loading immediately after worker creation
      const loadModelMessage: EmbeddingTaskMessage = {
        task: "feature-extraction",
        model,
        text: [],
        type: "blocks",
      };
      newWorker.postMessage(loadModelMessage);

      // Reset auto-compute flag for new worker
      autoComputeRef.current = { enabled: false, blocksDone: false };
    }

    return () => {
      workerRef.current = null;
    };
  }, [model, handleWorkerMessage, setWorker, blocks, debouncedGetEmbedding]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        setWorker(null);
      }
    };
  }, [setWorker]);

  return {
    loadingState,
    fileProgresses,
    embeddingProgress,
    loadingProgress: calculateOverallProgress(),
    isLoadingExpanded,
    setIsLoadingExpanded,
    question,
    setQuestion,
    debouncedGetEmbedding,
  };
}
