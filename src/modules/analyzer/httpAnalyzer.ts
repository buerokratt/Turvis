import { HttpAnalyzer } from './analyzer.module';
import { Rules, Ruleset } from '../rules/http/parser';
import { resolveHttpRules } from '../rules/http/resolver';
import { ValidationInput, rules } from '../rules/rules.module';
import { createValidator, ValidationResult } from '../rules/http/validator';

const analyze = (request: ValidationInput) => {
  const analyzer = createAnalyzer();
  return analyzer.analyze(request).parse().validate().result();
};

const createAnalyzer = (): HttpAnalyzer => {
  let request: ValidationInput;
  let rulesets: Rules<Ruleset>;
  let results: ValidationResult;

  const analyze = (r: ValidationInput): HttpAnalyzer => {
    request = r;
    return api;
  };

  const parse = (): HttpAnalyzer => {
    const paths = resolveHttpRules(request.method, request.path);
    console.log('paths', paths);
    rulesets = rules.parse(paths, { method: request.method });
    return api;
  };

  const validate = (): HttpAnalyzer => {
    const validator = createValidator();
    results = validator.validate(request, rulesets);
    return api;
  };

  const result = (): ValidationResult => {
    return results;
  };

  const api: HttpAnalyzer = {
    analyze,
    parse,
    validate,
    result,
  };

  return api;
};

export const httpAnalyzer = {
  analyze,
};
