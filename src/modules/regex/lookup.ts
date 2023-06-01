import { PathLike, readFileSync } from 'fs';
import { join } from 'path';

const REGULAR_EXPRESSIONS_DIR = 'patterns/expressions';

export interface PatternInfo {
  pattern: string;
  path: string;
}

export function lookupRegex(path: string, parameters?: {} | []): PatternInfo {
  const filePath: PathLike = join(REGULAR_EXPRESSIONS_DIR, path);
  let pattern: string = readFileSync(filePath, 'utf8').trim();

  if (Array.isArray(parameters)) {
    pattern = withPositionalParameters(pattern, parameters);
  }

  if (parameters && typeof parameters === 'object') {
    pattern = withNamedParameters(pattern, parameters);
  }

  return {
    pattern,
    path,
  };
}

function withNamedParameters(pattern: string, parameters: {}): string {
  // verify if the pattern that was loaded can be used with those parameters?

  let replacedPattern = pattern;
  for (const [key, value] of Object.entries(parameters)) {
    const placeholder = `__${key}__`;
    replacedPattern = replacedPattern.split(placeholder).join(value as string);
  }

  return replacedPattern;
}

function withPositionalParameters(pattern: string, parameters: any[]): string {
  // Implementation for positional parameters
  let replacedPattern = pattern;
  for (let i = 0; i < parameters.length; i++) {
    const placeholder = new RegExp(`__${i}__`, 'g');
    replacedPattern = replacedPattern.replace(placeholder, parameters[i]);
  }

  return replacedPattern;
}