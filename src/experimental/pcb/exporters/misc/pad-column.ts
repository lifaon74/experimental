import { GenerateGerberComment } from '../gerber-and-excellon/gerber/functions';

export function PadColumn(values: string[]): string[] {
  const maxLength: number = GetMaxLengthInColumn(values);
  return values.map((value: string) => {
    return value.padEnd(maxLength, ' ');
  });
}

export function GetMaxLengthInColumn(values: string[]): number {
  return values.reduce((maxLength: number, value: string) => {
    return Math.max(maxLength, value.length);
  }, 0);
}

export function FormatSimpleHeaders(headers: Iterable<[string, string]>): string[] {
  const _headers: [string, string][] = Array.from(headers);
  const maxLength: number = _headers.reduce((maxLength: number, [key]) => {
    return Math.max(maxLength, key.length);
  }, 0);

  return _headers.map(([key, value]: [string, string]) => {
    return `${ key.padEnd(maxLength + 1, ' ') }:    ${ value }`;
  });
}
