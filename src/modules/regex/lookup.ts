import { PathLike, readFileSync } from 'fs';
import { join } from 'path';

const REGULAR_EXPRESSIONS_DIR = 'patterns/expressions';

export interface PatternInfo {
  pattern: string;
  path: string;
}

export function lookupRegex(path: string, parameters?: {} | []): PatternInfo {
  const filePath: PathLike = join(REGULAR_EXPRESSIONS_DIR, path);
  const pattern: string = readFileSync(filePath, 'utf8').trim();

  if (Array.isArray(parameters)) {
    return withPositionalParameters(path, parameters);
  }

  if (parameters && typeof parameters === 'object') {
    return withNamedParameters(pattern, parameters);
  }

  return {
    pattern,
    path,
  };
}

function withNamedParameters(pattern: string, parameters: {}): PatternInfo {
  // verify if the pattern that was loaded can be used with those parameters

  // Implementation for named parameters
  // Replace or modify the pattern based on the provided parameters
  return {
    pattern,
    path: '',
  };
}

function withPositionalParameters(path: string, parameters: any[]): PatternInfo {
  // Implementation for positional parameters
  // Replace or modify the pattern based on the provided parameters
  return {
    pattern: '',
    path,
  };
}
