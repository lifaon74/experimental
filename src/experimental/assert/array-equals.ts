
export function arrayEquals(arrayA: ArrayLike<any>, arrayB: ArrayLike<any>): boolean {
  const length: number = arrayA.length;
  if (length === arrayB.length) {
    for (let i: number = 0; i < length; i++) {
      if (arrayA[i] !== arrayB[i]) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}
