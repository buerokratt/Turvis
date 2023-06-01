import { PathOrFileDescriptor } from 'fs';

import { PatternInfo } from './lookup';

export type ExecutionResult = {
  value: string;
  patternFile: string;
  pattern?: string;
  result?: boolean;
  error?: string;
};

const directory: PathOrFileDescriptor = './patterns/expressions';

export function execute(content: string, pattern: PatternInfo): ExecutionResult {
  try {
    const regex = new RegExp(pattern.pattern);
    const result = regex.test(content);

    return {
      value: content,
      patternFile: pattern.path,
      pattern: pattern.pattern,
      result,
    };
  } catch (error) {
    return {
      value: content,
      patternFile: pattern.pattern,
      pattern: pattern.pattern,
      error: `Error executing pattern: ${(error as Error).message}`,
    };
  }
}
