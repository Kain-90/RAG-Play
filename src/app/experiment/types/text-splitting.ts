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
