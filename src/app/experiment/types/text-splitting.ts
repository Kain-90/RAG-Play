export type SplitStrategy = 'recursive-character' | 'character'

export const SplitStrategyList = [
  {'character': 'Fixed Character'},
  {'recursive-character': 'Recursive Character'},
]

export interface TextBlock {
  text: string;
  startIndex: number;
  endIndex: number;
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
    id: 'double-break',
    charInput: '\\n\\n',
    char: '\n\n',
    display: '¶¶',
    style: {
      bg: 'bg-yellow-200',
      text: 'text-yellow-700'
    }
  },
  {
    id: 'single-break',
    charInput: '\\n',
    char: '\n',
    display: '¶',
    style: {
      bg: 'bg-blue-200',
      text: 'text-blue-700'
    }
  },
  {
    id: 'space',
    charInput: ' ',
    char: ' ',
    display: '␣',
    style: {
      bg: 'bg-green-200',
      text: 'text-green-700'
    }
  }
]; 

export const CHARACTER_SEPARATORS: Separator = DEFAULT_SEPARATORS[0]
export const RECURSIVE_CHARACTER_SEPARATORS: Separator[] = DEFAULT_SEPARATORS