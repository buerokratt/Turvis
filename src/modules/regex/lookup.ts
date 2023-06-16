import { PathLike, readFileSync } from 'fs';
import { join } from 'path';

const REGULAR_EXPRESSIONS_DIR = 'patterns/expressions';

export interface PatternInfo {
  pattern: RegExp;
  path: string;
}
export function lookupRegex(path: string, parameters?: {} | []): PatternInfo {
  const filePath: PathLike = join(REGULAR_EXPRESSIONS_DIR, path);
  let pattern = new RegExp(readFileSync(filePath, 'utf8'));

  if (parameters && Array.isArray(parameters)) {
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

function withNamedParameters(pattern: RegExp, parameters: {}): RegExp {
  let replacedPattern = pattern.toString();
  for (const [key, value] of Object.entries(parameters)) {
    const placeholder = `__${key}__`;
    replacedPattern = replacedPattern.split(placeholder).join(value as string);
  }
  return new RegExp(replacedPattern.slice(1, -1));
}

function withPositionalParameters(pattern: RegExp, parameters: any[]): RegExp {
  let replacedPattern = pattern.toString();
  for (let i = 0; i < parameters.length; i++) {
    const placeholder = new RegExp(`__${i}__`, 'g');
    replacedPattern = replacedPattern.replace(placeholder.toString(), parameters[i]);
  }

  return new RegExp(replacedPattern.slice(1, -1));
}
