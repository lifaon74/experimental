import { mat4 } from "gl-matrix";

export type number_array = { [key: number]: number; length: number; }
export type shader_vec2 = number_array;
export type shader_vec3 = number_array;
export type shader_vec4 = number_array;

export function MatrixToString(mat: number_array, rows: number, columns: number, precision: number = 2): string {
  return PadTable(
    Array.from({ length: rows }, (v: any, row: number) => {
      return Array.from({ length: columns }, (v: any, column: number) => {
        return mat[row + column * rows].toPrecision(precision);
      });
    })
  )
    .map((row: string[]) => {
      return row.join(', ');
    })
    .join('\n');
}

export function mat4_string(mat: mat4, precision?: number): string {
  return MatrixToString(mat, 4, 4, precision);
}

export function mat4_display(name: string, mat: mat4, precision?: number): void {
  console.log(name);
  console.log(mat4_string(mat, precision));
}

export function PadTable(table: readonly (readonly string[])[], fillString: string = ' '): string[][] {
  const columns: number = table[0].length;

  const lengths: number[] = Array.from({ length: columns }, (v: any, column: number) => {
    return table.reduce((maxLength: number, row: readonly string[]) => {
      return Math.max(maxLength, row[column].length);
    }, 0);
  })

  return table.map((row: readonly string[]) => {
    return row.map((value: string, column: number) => {
      return value.padStart(lengths[column], fillString);
    });
  });
}
