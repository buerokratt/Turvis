import { ExecutionResult } from '../regex.module';

export function noDuplicates(headers: Record<string, any>): ExecutionResult {
  const duplicateHeaders = Object.keys(headers).filter((headerName, index, self) => self.indexOf(headerName) !== index);

  return {
    value: headers.toString(),
    name: 'noDuplicates',
    result: duplicateHeaders.length === 0,
  };
}
