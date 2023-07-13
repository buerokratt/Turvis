import { ValidationItem, ValidationResult } from './validator';

export class HttpValidationContext {
  private results: ValidationItem[] = [];
  private failOnFirst: boolean;
  private includeDetails = true;
  private status: 'success' | 'failure' = 'success';

  constructor(failOnFirst: boolean) {
    this.failOnFirst = failOnFirst;
  }

  pushResult(result: ValidationItem): void {
    this.results.push(result);
    if (result.result === false) {
      this.status = 'failure';
    }
    if (this.failOnFirst && !result.result) {
      throw new Error('Execution failed due to failOnFirst = true');
    }
  }

  getResultItems(): ValidationItem[] {
    return this.results;
  }

  getResults(): ValidationResult {
    return {
      status: this.status,
      details: this.includeDetails ? this.results : undefined,
    };
  }
}
