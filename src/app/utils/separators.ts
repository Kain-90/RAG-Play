import { Separator } from "@/app/experiment/types/text-splitting";

const ESCAPE_SEQUENCES: Record<string, string> = {
  n: "\n",
  t: "\t",
  "\\": "\\",
};

/** Turns typed escapes like `\n` into the real characters. */
export const parseSeparatorInput = (input: string): string =>
  input.replace(/\\([nt\\])/g, (_, char: string) => ESCAPE_SEQUENCES[char]);

/** Makes whitespace visible: ¶ for line breaks, ⇥ for tabs, ␣ for spaces. */
export const formatSeparator = (char: string): string => {
  if (char === "") {
    return "Every char";
  }
  return char.replace(/\n/g, "¶").replace(/\t/g, "⇥").replace(/ /g, "␣");
};

export const createCustomSeparator = (input: string): Separator => {
  const char = parseSeparatorInput(input);
  return {
    id: `custom-${char}`,
    charInput: input,
    char,
    display: formatSeparator(char),
  };
};
