export function sseMessageWrapper(data) {
  return `data: ${JSON.stringify(data)}\n\n`;
}