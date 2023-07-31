import { ValidationResult } from '../rules/http/validator';
import { ValidationInput } from '../rules/rules.module';
import { httpAnalyzer } from './httpAnalyzer';

export interface HttpAnalyzer {
  analyze: (r: ValidationInput) => HttpAnalyzer;
  parse: () => HttpAnalyzer;
  validate: () => HttpAnalyzer;
  result: () => ValidationResult;
}

export interface LogAnalyzer {
  withFile(filePath: string): LogAnalyzer;
  process(): void;
}

export { httpAnalyzer };
