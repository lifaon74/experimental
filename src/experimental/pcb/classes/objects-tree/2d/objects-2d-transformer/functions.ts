import { mat3, vec2 } from 'gl-matrix';

export const TMP_MAT3: mat3 = mat3.create();

export function mat3_pre_translate(out: mat3, matrix: mat3, vector: vec2): mat3 {
  return mat3.multiply(out, mat3.fromTranslation(TMP_MAT3, vector), matrix);
}

export function mat3_pre_rotate(out: mat3, matrix: mat3, rad: number): mat3 {
  return mat3.multiply(out, mat3.fromRotation(TMP_MAT3, rad), matrix);
}

export function mat3_pre_scale(out: mat3, matrix: mat3, vector: vec2): mat3 {
  return mat3.multiply(out, mat3.fromScaling(TMP_MAT3, vector), matrix);
}

export function mat3_get_scaling(out: vec2, matrix: mat3): vec2 {
  const a: number = matrix[0],
        b: number = matrix[1],
        c: number = matrix[3],
        d: number = matrix[4]
  ;

  out[0] = Math.sqrt(a * a + b * b);
  out[1] = Math.sqrt(c * c + d * d);

  return out;
}

export function float_equals(a: number, b: number, epsilon: number = 0.000001): boolean {
  return Math.abs(a - b) <= (epsilon * Math.max(1.0, Math.abs(a), Math.abs(b)));
}

// export function float_round(value: number, epsilon: number): boolean {
//   return Math.round(value / epsilon) * epsilon;
// }

export function float_to_fixed(value: number, numberOfDecimal: number): string {
  return value.toFixed(numberOfDecimal).replace(/\.?0*$/g, '');
}
