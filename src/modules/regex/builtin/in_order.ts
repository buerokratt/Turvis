import { ExecutionResult } from '../regex.module';

export function inOrder(headers: string[], expectedOrder: string[]): ExecutionResult {
  if (!headers) {
    return {
      value: headers,
      name: 'inOrder',
      result: false,
    };
  }

  let prevIndex = -1;

  for (const expectedHeader of expectedOrder) {
    const currentIndex = headers.indexOf(expectedHeader);

    if (currentIndex === -1 || currentIndex < prevIndex) {
      return {
        value: headers,
        name: 'inOrder',
        result: false,
      };
    }

    prevIndex = currentIndex;
  }

  return {
    value: headers,
    name: 'inOrder',
    result: true,
  };
}
