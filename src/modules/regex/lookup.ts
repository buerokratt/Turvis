import { readFileSync } from 'fs';
import { join } from 'path';

import { config } from '../../app/config';

const REGULAR_EXPRESSIONS_DIR = config.get().turvis.DSL.regex.patternsDir;
const BASE_DIR = config.get().turvis.DSL.baseDir;

export interface PatternInfo {
  pattern: RegExp;
  path: string;
}

export function lookupRegex(path: string, parameters?: {} | []): PatternInfo {
  const filePath = join(BASE_DIR, REGULAR_EXPRESSIONS_DIR, path);
  const fileContent = readFileSync(filePath, 'utf8');
  if (!fileContent || fileContent.length === 0) {
    throw new Error('Pattern file is empty!');
  }

  let pattern = new RegExp(fileContent);

  if (Array.isArray(parameters)) {
    pattern = withPositionalParameters(pattern, parameters);
  }

  if (typeof parameters === 'object') {
    pattern = withNamedParameters(pattern, parameters);
  }
  
  return {
    pattern,
    path,
  };
}

export function dotNotationLookup(path: string, parameters?: {} | []): PatternInfo {
  const replaced = path.replace('.', '/');
  return lookupRegex(replaced, parameters);
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
