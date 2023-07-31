import { execute } from './execute';
import { lookupRegex } from './lookup';

export interface ExecutionResult {
  value: string | string[];
  result: boolean;
  name?: string;
  error?: string;
}

export interface RegexExecutionResult extends ExecutionResult {
  patternFile: string;
  pattern?: RegExp;
}

export const expressions = {
  execute: execute,
  lookup: lookupRegex,
};
