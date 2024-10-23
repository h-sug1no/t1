export function arrayBufferToDataUrl(
  arrayBuffer: ArrayBuffer,
  mimeType: string,
): string {
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const dataUrl = `data:${mimeType};base64,${btoa(binary)}`;
  return dataUrl;
}
