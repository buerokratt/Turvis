export function exists(headers: string[], requiredHeaders: string[]): boolean {
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    console.error('Missing headers:', missingHeaders);
    return false;
  }

  return true;
}
