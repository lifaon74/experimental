import { vec3 } from "gl-matrix";

export function isInCube(
  origin: vec3,
  vector: vec3,
  side: number,
): boolean {
  return (
    (vector[0] >= 0)
      ? ((0 <= origin[0]) && (origin[0] < side))
      : ((0 < origin[0]) && (origin[0] <= side))
  ) && (
    (vector[1] >= 0)
      ? ((0 <= origin[1]) && (origin[1] < side))
      : ((0 < origin[1]) && (origin[1] <= side))
  ) && (
    (vector[2] >= 0)
      ? ((0 <= origin[2]) && (origin[2] < side))
      : ((0 < origin[2]) && (origin[2] <= side))
  );
}
