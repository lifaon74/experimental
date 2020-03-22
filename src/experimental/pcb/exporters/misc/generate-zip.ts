import * as JSZip from 'jszip';

export function GenerateZip(files: Iterable<[string, string]>): Promise<Uint8Array> {
  const zip = new JSZip();
  const iterator: Iterator<[string, string]> = files[Symbol.iterator]();
  let result: IteratorResult<[string, string]>;
  while (!(result = iterator.next()).done) {
    const [fileName, fileContent]: [string, string] = result.value;
    zip.file(fileName, fileContent);
  }
  return zip.generateAsync({ type: 'uint8array' });
}

