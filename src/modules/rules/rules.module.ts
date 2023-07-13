import { parse, parseRules } from './http/parser';
import { resolve, resolveDefault } from './http/resolver';

export interface ValidationInput {
  path: string;
  method: string;
  headers?: any;
  query?: any;
  body?: any;
}

export const http = {
  resolve,
  resolveDefault,
  parseRules,
  parse,
};

export const rules = { resolve, resolveDefault, parse, parseRules };
