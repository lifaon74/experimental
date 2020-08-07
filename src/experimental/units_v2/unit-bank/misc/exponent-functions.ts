export const DIGITS_TO_SUPER_SCRIPT = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export type TExponentNotation = 'sup' | '^' | '';

export function NumberToSuperScript(value: number): string {
  return Array.from(value.toString(10), (char: string) => {
    switch (char) {
      case '0':
        return '⁰';
      case '1':
        return '¹';
      case '2':
        return '²';
      case '3':
        return '³';
      case '4':
        return '⁴';
      case '5':
        return '⁵';
      case '6':
        return '⁶';
      case '7':
        return '⁷';
      case '8':
        return '⁸';
      case '9':
        return '⁹';
      case '-':
        return '⁻';
      case '.':
        return '\u22C5';
      default:
        throw new Error(`Unsupported conversion from char '${ char }' to superscript char`);
    }
  }).join('');
}

export function NumberToExponent(value: number, exponentNotation: TExponentNotation = 'sup'): string {
  switch (exponentNotation) {
    case 'sup':
      return NumberToSuperScript(value);
    case '^':
      return `^${ value.toString(10) }`;
    case '':
      return value.toString(10);
    default:
      throw new TypeError(`Invalid exponentNotation`);
  }
}
