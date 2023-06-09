export function inOrder(headers: string[], expectedOrder: string[]): boolean {
  const headerIndices = new Map<string, number>();

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    headerIndices.set(header, i);
  }

  let prevIndex = -1;

  for (const expectedHeader of expectedOrder) {
    const currentIndex = headerIndices.get(expectedHeader);

    if (currentIndex === undefined || currentIndex < prevIndex) {
      return false;
    }

    prevIndex = currentIndex;
  }

  return true;
}
