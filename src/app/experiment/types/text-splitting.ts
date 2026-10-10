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
    value: "Parent-Child",
    disabled: false,
  },
];

export interface TextBlock {
  text: string;
}

export interface EnhancedTextBlock extends TextBlock {
  startIndex: number;
  endIndex: number;
  overlapText?: string;
  parentId?: number;
  isParent?: boolean;
  parentText?: string;
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

/** Empty separator: LangChain then cuts every N characters, even mid-word. */
export const EVERY_CHARACTER_SEPARATOR: Separator = {
  id: "every-character",
  charInput: "",
  char: "",
  display: "Every char",
  style: {
    bg: "bg-purple-200",
    text: "text-purple-700",
  },
};

/** Single-choice options for the Fixed Character strategy. */
export const FIXED_SEPARATOR_PRESETS: Separator[] = [
  EVERY_CHARACTER_SEPARATOR,
  ...DEFAULT_SEPARATORS,
];

export const DEFAULT_FIXED_SEPARATOR: Separator = EVERY_CHARACTER_SEPARATOR;
export const DEFAULT_RECURSIVE_SEPARATORS: Separator[] = DEFAULT_SEPARATORS;
