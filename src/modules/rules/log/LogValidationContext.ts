import { ValidationResult } from './validator';

export interface LogValidationResult {
  line: string;
  status: 'success' | 'failure';
  id: string;
  details: ValidationResult[];
}

export class LogValidationContext {
  private logLine: string;
  private id: string;
  private results: ValidationResult[] = [];
  private status: 'success' | 'failure' = 'success';

  constructor(line: string, id: string) {
    this.logLine = line;
    this.id = id;
  }

  pushResult(item: ValidationResult): void {
    this.results.push(item);

    if (!item.result.result) {
      this.status = 'failure';
    }
  }

  getFailedResultItems(): ValidationResult[] {
    return this.results.filter((item: ValidationResult) => !item.result.result);
  }

  getResultItems(): ValidationResult[] {
    return this.results;
  }

  getResults(): LogValidationResult {
    return {
      id: this.id,
      line: this.logLine,
      status: this.status,
      details: this.results,
    };
  }

  getStatus(): 'success' | 'failure' {
    return this.status;
  }
}
