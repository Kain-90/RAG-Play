export type SplitStrategy =
  | "recursive-character"
  | "character"
  | "parent-child";

export interface SplitStrategyItem {
  key: SplitStrategy;
  value: string;
  disabled: boolean;
}

export const SplitStrategyList: SplitStrategyItem[] = [
  {
    key: "character",
    value: "Fixed Character",
    disabled: false,
  },
  {
    key: "recursive-character",
    value: "Recursive Character",
    disabled: false,
  },
  {
    key: "parent-child",
    value: "Parent-Child (Coming Soon)",
    disabled: true,
  },
];

export interface TextBlock {
  text: string;
}

export interface EnhancedTextBlock extends TextBlock {
  startIndex: number;
  endIndex: number;
  overlapText?: string;
}

export interface Separator {
  id: string;
  charInput: string;
  char: string;
  display: string;
  style?: {
    bg: string;
    text: string;
  };
}

export const DEFAULT_SEPARATORS: Separator[] = [
  {
    id: "double-break",
    charInput: String.raw`\n\n`,
    char: "\n\n",
    display: "¶¶",
    style: {
      bg: "bg-yellow-200",
      text: "text-yellow-700",
    },
  },
  {
    id: "single-break",
    charInput: String.raw`\n`,
    char: "\n",
    display: "¶",
    style: {
      bg: "bg-blue-200",
      text: "text-blue-700",
    },
  },
  {
    id: "space",
    charInput: " ",
    char: " ",
    display: "␣",
    style: {
      bg: "bg-green-200",
      text: "text-green-700",
    },
  },
];

export const CHARACTER_SEPARATORS: Separator = DEFAULT_SEPARATORS[0];
export const RECURSIVE_CHARACTER_SEPARATORS: Separator[] = DEFAULT_SEPARATORS;
