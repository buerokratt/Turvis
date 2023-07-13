import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { PatternInfo, dotNotationLookup } from '../../regex/lookup';
import { execute } from '../../regex/execute';
import { isValue } from '../../../utils/typeUtils'
import { hasElement } from '../../../utils/objectUtils';
import { RegexExecutionResult } from '../../regex/regex.module';

export interface LogRules {
  id: string;
  delimiter?: string | RegExp;
  lineValidators: LogValidationRule[];
  positionValidators: { position: number; validators: LogValidationRule[] }[];
}

export interface LogValidationRule {
  type: 'inline' | 'lookup';
  name: string;
  pattern: RegExp;
  match: (line: string) => RegexExecutionResult;
}

export function parse(logRuleset: string): LogRules {
  let validationRules: LogRules = {
    id: logRuleset,
    delimiter: '',
    lineValidators: [],
    positionValidators: [],
  };

  const yml = yaml.load(fs.readFileSync(logRuleset, 'utf-8'));
  if (!yml) {
    throw new Error('No ruleset specified!');
  }

  const { ruleset } = yml as any;
  validationRules.delimiter = ruleset.delimiter;
  const linePatterns = ruleset?.linePatterns ?? [];
  const positions = ruleset?.positions ?? [];

  // if there are no line patterns specified, then it's ok
  if (!validationRules.delimiter && positions.length > 0) {
    throw new Error('No delimiter specified for parsing log lines!');
  }

  validationRules.lineValidators = createLineValidators(linePatterns);
  validationRules.positionValidators = createPositionValidators(positions);

  return validationRules;
}

/**
 * @param list list of validators to be applied on the full log line
 */
function createLineValidators(list: []) {
  const validators = list.map((element) => choose(element));
  return validators;
}

/**
 *
 * @param list list of validators to be applied to specific log line position
 */
function createPositionValidators(list: []): { position: number; validators: LogValidationRule[] }[] {
  return list.map(({ position, patterns }: any) => ({
    position,
    validators: patterns.map(choose),
  }));
}

const choose = (candidate: any): LogValidationRule => {
  if (hasElement(candidate, 'name')) {
    if (hasElement(candidate, 'regex')) {
      return createInlinePatternRule(candidate);
    } else {
      const { name, ...rest } = candidate;
      return createLookupPatternRule({ name: name, params: rest });
    }
  } else if (isValue(candidate)) {
    return createLookupPatternRule({ name: candidate });
  } else {
    const name = Object.keys(candidate)[0];
    const params = candidate[name];
    return createLookupPatternRule({ name, params });
  }
};

function createInlinePatternRule(element: any): LogValidationRule {
  const patternInfo = {
    pattern: element.regex,
    path: 'inline',
  };

  return {
    type: 'inline',
    name: element.name,
    pattern: new RegExp(element.regex),
    match: (content: string) : RegexExecutionResult => execute(content, patternInfo),
  };
}

function createLookupPatternRule(element: any): LogValidationRule {
  const pattern: PatternInfo = dotNotationLookup(element.name, element.params ? element.params : undefined);
  return {
    type: 'lookup',
    name: element.name,
    pattern: pattern.pattern,
    match: (content: string) : RegexExecutionResult => execute(content, pattern),
  };
}

export const logRulesParser = {
  parse,
};
