export function formatSize(
  size: number,
): string {
  const power: number = Math.floor(Math.log(size) / Math.log(1024));
  const prefix: string = ['', 'K', 'M', 'G', 'T'][power];
  const _size: number = Math.round(size / Math.pow(1024, power));
  return `${ _size }${prefix}B`
}

