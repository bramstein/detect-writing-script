export interface Script {
  count: number;
  total: number;
}

function detect(codepoints: Array<number>, threshold: number): Record<string, Script>;

export default detect;
