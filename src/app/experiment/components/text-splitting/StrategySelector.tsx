"use client";
import { useTextSplittingStore } from "@/app/stores/experiment/text-splitting-store";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SplitStrategyList } from "@/app/experiment/types/text-splitting";
import type { SplitStrategy, SplitStrategyItem } from "@/app/experiment/types/text-splitting";
import Link from "next/link";
import Image from "next/image";
import Langchain from "@/components/langchain.svg";

export const StrategySelector = () => {
  const { strategy, setStrategy } = useTextSplittingStore();

  const handleStrategyChange = (value: SplitStrategy) => {
    setStrategy(value);
  };

  return (
    <>
      <Select value={strategy} onValueChange={handleStrategyChange}>
        <SelectTrigger className="w-[254px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SplitStrategyList.map((item: SplitStrategyItem) => {
            const { key, value, disabled } = item;
            return (
              <SelectItem key={key} value={key} disabled={disabled}>
                {value}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Link
        href="https://js.langchain.com/docs/how_to#text-splitters"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer"
      >
        <Image
          src={Langchain}
          alt="Langchain"
          title="Langchain text splitters"
          className="w-8 h-8"
        />
      </Link>
    </>
  );
};
