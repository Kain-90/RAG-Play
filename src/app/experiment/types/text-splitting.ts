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

export abstract class BaseTextSplitter {
  chunkSize: number;
  overlap: number;
  separator: string;

  constructor(chunkSize: number = 1000, overlap: number = 200, separator: string = '') {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
    this.separator = separator;
  }

  abstract splitText(text: string): Promise<TextBlock[]>;
}