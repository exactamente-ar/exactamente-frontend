export function extractDriveFileId(url: string): string | null {
  const patterns = [/\/file\/d\/([a-zA-Z0-9-_]+)/, /id=([a-zA-Z0-9-_]+)/, /\/d\/([a-zA-Z0-9-_]+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
