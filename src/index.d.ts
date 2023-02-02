export Script {
  count: number;
  total: number;
}

export function detect(codepoints: Array<number>, threshold: number): Record<string, Script>;
