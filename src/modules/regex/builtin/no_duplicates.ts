export function noDuplicates(headers: Record<string, any>): boolean {
  const duplicateHeaders = Object.keys(headers).filter((headerName, index, self) => self.indexOf(headerName) !== index);

  return duplicateHeaders.length === 0;
}
