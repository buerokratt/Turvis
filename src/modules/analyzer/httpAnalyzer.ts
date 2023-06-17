
import { ValidationRequest, ValidationResult } from '../rules/rules.module';
import { resolveRules } from '../rules/resolve';

export const analyze = (request: ValidationRequest) => {
  const analyzer = createAnalyzer();
  return analyzer.analyze(request).parse().validate().result();
};

interface HttpAnalyzer {
  analyze: (r: ValidationRequest) => HttpAnalyzer;
  parse: () => HttpAnalyzer;
  validate: () => HttpAnalyzer;
  result: () => ValidationResult;
}

const createAnalyzer = (): HttpAnalyzer => {
  let request: ValidationRequest;
  let results: ValidationResult;

  const analyze = (r: ValidationRequest): HttpAnalyzer => {
    request = r;
    return api;
  };

  const parse = (): HttpAnalyzer => {
    const paths = resolveRules(request.method, request.path);
    return api;
  };

  const validate = (): HttpAnalyzer => {
    // TODO: do the actual validations
    results = { status: 'success' }
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
