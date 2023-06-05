export function exists(headers: string[], requiredHeaders: string[]): boolean {
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    return false;
  }

  return true;
}
