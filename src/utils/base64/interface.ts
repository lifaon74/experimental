
export interface IBase64 {
  atob(encodedString: string): string; // base64 to bytes
  btoa(rawString: string): string; // bytes to base64
}

