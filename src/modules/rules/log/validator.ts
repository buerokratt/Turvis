import { RegexExecutionResult } from 'src/modules/regex/regex.module';
import { logger } from '../../../app/logger';
import { LogValidationContext, LogValidationResult } from './LogValidationContext';
import { LogValidationRule, LogRules } from './parser';

export interface ValidationResult {
  name: string;
  type: string;
  position?: number;
  result: RegexExecutionResult;
}

function createValidator(ruleset: LogRules) {
  let rules: LogRules = ruleset;
  let validationContext: LogValidationContext;

  function validate(line: string): LogValidationResult {
    validationContext = new LogValidationContext(line, ruleset.id);
    if (!rules.delimiter) {
      logger.warn('No delimiter specified for parsing log file!');
    }

    validateLine(line);
    validatePositions(line);

    return validationContext.getResults();
  }

  function validateLine(line: string) {
    ruleset.lineValidators.forEach((validator: LogValidationRule) => {
      const result = validator.match(line);
      const { name, type } = validator;
      validationContext.pushResult({ name, type, result });
    });
  }

  function validatePositions(line: string) {
    const delimiterPattern = new RegExp(rules.delimiter!);
    const matches = line.split(delimiterPattern);

    if (!matches) {
      throw new Error('Delimiter pattern did not match any parts, validation cannot be performed');
    }

    ruleset.positionValidators.forEach((positional: any) => {
      positional.validators.forEach((validator: LogValidationRule) => {
        const result = validator.match(matches[positional.position]);
        const { name, type } = validator;
        const { position } = positional;
        validationContext.pushResult({ name, type, position, result });
      });
    });
  }

  return {
    validate,
  };
}

export const logValidator = {
  create: createValidator,
};
