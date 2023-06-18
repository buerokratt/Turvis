import { PathLike, readFileSync } from 'fs';

import * as yaml from 'js-yaml';

import { extractOneKeyValuePair } from '../../../utils/extractOneKeyValuePair';
import { hasOneKeyValuePair } from '../../../utils/hasOneKeyValuePair';
import { isArray } from '../../../utils/isArray';
import { isObject } from '../../../utils/isObject';
import { isValue } from '../../../utils/isValue';
import { resolveReference } from '../resolve';
import { exists } from '../../regex/builtin/exists';
import { inOrder } from '../../regex/builtin/in_order';
import { execute } from '../../regex/execute';
import { dotNotationLookup } from '../../regex/lookup';
import { RegexExecutionResult } from '../../regex/regex.module';

export interface ValidationRule {
  name: string;
  scope: string;
  builtin: boolean;
  select: string;
  match: Function;
}

export interface ParserInput {
  default: string;
  request?: string;
}

export interface Rules<Ruleset> {
  documents: Array<Ruleset>;
}

export interface Ruleset {
  id: string;
  headers?: Array<ValidationRule>;
  query?: Array<ValidationRule>;
  body?: any;
}

export interface ParseConfig {
  method: string;
};

export function parse(rules: ParserInput, config: ParseConfig): Rules<Ruleset> {
  const defaultDocument: Array<Ruleset> = parseRules(rules.default!, { method: config.method });
  let requestDocument: Array<Ruleset> = [];

  if (rules.request) {
    requestDocument = parseRules(rules.request!, { method: config.method });
  }

  return {
    documents: [...defaultDocument, ...requestDocument],
  };
}

export function parseRules(rulesFile: string, resolver: { method: string }): Array<Ruleset> {
  let document: Ruleset[] = [];
  try {
    const yml = yaml.load(readFileSync(rulesFile, 'utf8'));

    const referencedDocuments: Ruleset[] = extractReferencesRecursive(yml, resolver.method);
    const headers = extractHeaderValidations(yml);
    const query = extractQueryValidations(yml);
    const body = extractBodyValidations(yml);

    const execution: Ruleset = {
      id: rulesFile,
      headers: [...headers],
      query: [...query],
      body: [], // body: [...body],
    };

    document = [...referencedDocuments, execution];

    return document;
  } catch (e: any) {
    throw new Error(`Ruleset file not loaded: ${rulesFile} Error: ${e.message}. stacktrace: ${e.stack}`);
  }
}

function extractReferencesRecursive(document: any, httpMethod: string): Array<any> {
  const rulesetArray: Array<string> = document.ruleset?.use || [];
  const rulesetRefs: Array<Ruleset> = [];

  for (const reference of rulesetArray) {
    const resolvedPath: PathLike = resolveReference(httpMethod, reference);
    const parsedRefRule: Ruleset[] = parseRules(resolvedPath, { method: httpMethod });
    rulesetRefs.push(...parsedRefRule);
  }

  return rulesetRefs;
}

function extractHeaderValidations(document: any): Array<ValidationRule> {
  const headers = document.ruleset?.headers;

  if (!headers) {
    return [];
  }
  const { validate = {}, ...rest } = headers;

  const validations: Array<any> = Object.entries(validate).map(([key, value]) => mapValidations(key, value, 'header'));

  const builtins: Array<any> = Object.entries(rest).map(([key, value]) => mapBuiltin(key, value, 'header'));
  const merge = [...builtins, ...validations];
  const flattened = merge.reduce((accumulator: [], current: []) => {
    return accumulator.concat(current);
  }, []);
  return flattened;
}

function extractQueryValidations(document: any): Array<ValidationRule> {
  const query = document.ruleset?.query;

  if (!query) {
    return [];
  }
  const { validate = {}, ...rest } = query;
  const validations: Array<any> = Object.entries(validate).map(([key, value]) => mapValidations(key, value, 'query'));
  const builtins: Array<any> = Object.entries(rest).map(([key, value]) => mapBuiltin(key, value, 'query'));
  const merge = [...builtins, ...validations];
  const flattened = merge.reduce((accumulator: [], current: []) => {
    return accumulator.concat(current);
  }, []);
  return flattened;
}

function extractBodyValidations(document: any) {
  const body = document.ruleset?.body;
  return body;
}

function mapBuiltin(key: string, value: any, scope: string): ValidationRule {
  const validation: ValidationRule = {
    name: key, // validator name
    scope: scope,
    select: 'all',
    builtin: true,
    match: (list: []) => false,
  };
  switch (key) {
    case 'inOrder':
      validation.match = (list: []) => inOrder(list, value);
      break;
    case 'exists':
      validation.match = (list: []) => exists(list, value);
      break;
    default:
      validation.match = (list: []) => {
        // maybe its better to fail here?
        console.warn(`returned default builtin validator for "${key}" that evaluates to false!!`);
        return false;
      };
  }
  return validation;
}

function mapValidations(fieldKey: string, valueOrList: any, scope: string): Array<ValidationRule> {
  if (valueOrList === null) {
    throw new Error(`key "${fieldKey}" must have a value or not specified at all!`);
  }

  if (isValue(valueOrList)) {
    const validation: ValidationRule = {
      select: fieldKey,
      name: valueOrList,
      scope: scope,
      builtin: false,
      match: createSingleValueValidator(valueOrList),
    };
    return [validation];
  }
  if (isArray(valueOrList)) {
    const validations = valueOrList.map((item: any) => {
      const validation: ValidationRule = {
        select: fieldKey,
        name: isObject(item) ? extractName(item) : item,
        scope: scope,
        builtin: false,
        match: mapRuleToFunction(item),
      };
      return validation;
    });

    return validations;
  }

  throw new Error(`Could not detect allowed matcher type for ${fieldKey}`);
}

/**
 *
 * @param item single rule
 * @returns name of the rule: e.g. isJwt, exists etc
 */
function extractName(item: any) {
  if (isObject(item)) {
    if (item.rule !== undefined) return item.rule;
    else return Object.keys(item)[0];
  }
}

/**
 *
 * @param ruleArguments arguments for rule: either value, object or list to use in pattern
 * @returns function that receives value and executes given regular expression
 */
function mapRuleToFunction(rule: any) {
  if (isValue(rule)) {
    return createSingleValueValidator(rule);
  }
  if (isObject(rule)) {
    if (hasObjectKeyNamedRule(rule)) {
      const { rule: ruleName, ...rest } = rule;
      return createWithNamedArgumentsValidator(ruleName, rest);
    }
    if (hasOneKeyValuePair(rule)) {
      const pair = extractOneKeyValuePair(rule);
      return createWithPositonArgumentsValidator(pair!.key, pair?.value);
    }
    throw new Error('Expected not to reach here');
  } else {
    throw new Error('Error in parsing rules! Maybe using an array as the validator type?');
  }
}

/**
 *
 * @param matcherName name of the matcher to execute: e.g. jwt
 * @param value the value being matched
 * @param matcherFn function that takes in the value and matches with materName based regex
 * @returns ExecutionResult
 */
function wrapMatcher(matcherName: string, value: any, matcherFn: Function) {
  try {
    return matcherFn();
  } catch (error) {
    return {
      value: value,
      result: false,
      error: (error as any).message,
      name: matcherName,
    };
  }
}

function createSingleValueValidator(validatorFriendlyName: any): Function {
  return (validatableValue: any): RegexExecutionResult =>
    wrapMatcher(validatorFriendlyName, validatableValue, () =>
      execute(validatableValue, dotNotationLookup(validatorFriendlyName)),
    );
}

function createWithNamedArgumentsValidator(validatorFriendlyName: string, parameters: any): Function {
  return (validatabaleValue: any): RegexExecutionResult =>
    wrapMatcher(validatorFriendlyName, validatabaleValue, () =>
      execute(validatabaleValue, dotNotationLookup(validatorFriendlyName, parameters)),
    );
}

function createWithPositonArgumentsValidator(validatorFriendlyName: string, parameters: any): Function {
  return (validatableValue: any): RegexExecutionResult =>
    wrapMatcher(validatorFriendlyName, validatableValue, () =>
      execute(validatableValue, dotNotationLookup(validatorFriendlyName, parameters)),
    );
}

function hasObjectKeyNamedRule(obj: any): boolean {
  return obj.hasOwnProperty('rule') && typeof obj.rule !== 'object';
}
