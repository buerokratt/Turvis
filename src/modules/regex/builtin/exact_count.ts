import { ExecutionResult } from '../regex.module';

export function exactCount(queryParams: any[], expectedCount: number): ExecutionResult {
  return {
    name: 'exactCount',
    result: queryParams.length === expectedCount,
    value: queryParams,
  };
}
