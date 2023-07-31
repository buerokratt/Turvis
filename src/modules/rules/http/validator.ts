import { Rules, Ruleset, ValidationRule } from './parser';
import { ExecutionResult, RegexExecutionResult } from '../../regex/regex.module';
import { HttpValidationContext } from './HttpValidationContext';
import { ValidationInput } from '../rules.module';
import { config } from '../../../app/config';
import { logger } from '../../../app/logger';

export interface ValidationResult {
  status: 'success' | 'failure';
  details?: ValidationItem[];
}

export interface ValidationItem {
  scope: string;
  validatorName: string;
  validatorType: 'builtin' | 'regex';
  validate: string;
  ruleset: string;
  params: any;
  result: boolean;
}

export interface Validator {
  validate: (request: ValidationInput, rules: Rules<Ruleset>) => ValidationResult;
}

export function createValidator(): Validator {
  let validatableData: ValidationInput;

  function validate(req: ValidationInput, rules: Rules<Ruleset>): ValidationResult {
    validatableData = req;

    const failOnFirst = config.get().turvis.DSL.http.failOnFirst;
    const executionContext = new HttpValidationContext(failOnFirst);
    if (!rules.documents) {
      return { status: 'success' };
    }

    try {
      rules.documents.forEach((ruleset) => processDocument(ruleset, executionContext));
    } catch (error) {
      logger.error('request validation failed', error);
      return { status: 'failure' };
    }
    return executionContext.getResults();
  }

  function processDocument(ruleset: Ruleset, executionContext: HttpValidationContext) {
    try {
      ruleset.headers?.forEach((validator) => {
        processValidation(validator, ruleset.id, validatableData.headers, executionContext);
      });

      ruleset.query?.forEach((validator) => {
        processValidation(validator, ruleset.id, validatableData.query, executionContext);
      });

      ruleset.body?.forEach((validator) => {
        processValidation(validator, ruleset.id, validatableData.body, executionContext);
      });
    } catch (error) {}
  }

  function processValidation(
    validation: ValidationRule,
    ruleset: string,
    data: any,
    validationContext: HttpValidationContext,
  ): ValidationItem {
    const params = extractParams(data, validation);
    const executionResult: ExecutionResult | RegexExecutionResult = validation.match(params);

    const validationResult: ValidationItem = {
      scope: validation.scope,
      validatorName: validation.name,
      validatorType: validation.builtin ? 'builtin' : 'regex',
      validate: validation.select,
      params: data,
      ruleset: ruleset,
      result: executionResult.result,
    };

    validationContext.pushResult(validationResult);
    return validationResult;
  }

  function extractParams(data: any, validation: any) {
    if (validation.scope === 'body') {
      return data;
    }
    return validation.select === 'all' ? Object.keys(data) : data[validation.select];
  }

  return {
    validate,
  };
}
