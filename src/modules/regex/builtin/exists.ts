import { ExecutionResult } from '../regex.module';

export function exists(headers: string[], requiredHeaders: string[]): ExecutionResult {
  if (!headers || requiredHeaders.some(header => !headers.includes(header))) {
    return {
      value: headers,
      result: false,
      name: 'exists',
    };
  }

  return {
    value: headers,
    result: true,
    name: 'exists',
  };
}
