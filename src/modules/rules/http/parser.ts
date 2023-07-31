import { PathLike, readFileSync } from 'fs';

import * as yaml from 'js-yaml';

import { hasElement, mapToKeyValue } from '../../../utils/objectUtils';
import { hasSingleKey } from '../../../utils/objectUtils';
import { isArray } from '../../../utils/typeUtils';
import { isObject } from '../../../utils/typeUtils';
import { isValue } from '../../../utils/typeUtils';
import { resolveReference } from './resolver';
import { exists } from '../../regex/builtin/exists';
import { inOrder } from '../../regex/builtin/in_order';
import { execute } from '../../regex/execute';
import { dotNotationLookup } from '../../regex/lookup';
import { ExecutionResult, RegexExecutionResult } from '../../regex/regex.module';
import { exactCount } from '../../regex/builtin/exact_count';
import { noDuplicates } from '../../regex/builtin/no_duplicates';
import { logger } from '../../../app/logger';
import { wrap } from 'module';

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
  body?: Array<ValidationRule>;
}

export interface ParseConfig {
  method: string;
}

export function parse(rules: ParserInput, config: ParseConfig): Rules<Ruleset> {
  let ruleDocuments: Array<Ruleset> = [];

  if (rules.default) {
    const defaultDocument: Array<Ruleset> = parseRules(rules.default!, { method: config.method });
    ruleDocuments = [...defaultDocument];
  }

  if (rules.request) {
    let requestPathDocument: Array<Ruleset> = [];
    requestPathDocument = parseRules(rules.request!, { method: config.method });
    ruleDocuments = [...requestPathDocument];
  }

  return {
    documents: ruleDocuments,
  };
}

export function parseRules(rulesFile: string, resolver: { method: string }): Array<Ruleset> {
  try {
    const yml = yaml.load(readFileSync(rulesFile, 'utf8'));
    const referencedDocuments = extractReferencesRecursive(yml, resolver.method);
    const headers = extractHeaderValidations(yml);
    const query = extractQueryValidations(yml);
    const body = extractBodyValidations(yml);

    const execution: Ruleset = {
      id: rulesFile,
      headers: [...headers],
      query: [...query],
      body: [...body],
    };

    return [...referencedDocuments, execution];
  } catch (e: any) {
    throw new Error(`Failed to load ruleset file: ${rulesFile}\nError: ${e.message}\nStacktrace: ${e.stack}`);
  }
}

/**
 *
 * @param document yaml input
 * @param httpMethod is it for get or post
 * @returns a new ruleset
 */
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

/**
 *
 * @param document yaml document
 * @returns list of header validations to apply
 */
function extractHeaderValidations(document: any): Array<ValidationRule> {
  const { headers } = document.ruleset || {};

  if (!headers) {
    return [];
  }

  const { validate = {}, ...rest } = headers;

  const validationRules: Array<any> = Object.entries(validate).map(([key, value]) =>
    mapValidations(key, value, 'header'),
  );

  const builtins: Array<any> = Object.entries(rest).map(([key, value]) => mapBuiltin(key, value, 'header'));
  const mergedValidations = [...builtins, ...validationRules];

  return mergedValidations.flat();
}

/**
 *
 * @param document yaml document
 * @returns list of query validations to apply
 *
 */
function extractQueryValidations(document: any): Array<ValidationRule> {
  const { query } = document.ruleset || {};

  if (!query) {
    return [];
  }

  const { validate = {}, ...rest } = query;

  const validationRules: Array<any> = Object.entries(validate).map(([key, value]) =>
    mapValidations(key, value, 'query'),
  );

  const builtins: Array<any> = Object.entries(rest).map(([key, value]) => mapBuiltin(key, value, 'query'));
  const mergedValidations = [...builtins, ...validationRules];

  return mergedValidations.flat();
}

function extractBodyValidations(document: any) {
  const { body } = document.ruleset || {};

  if (!body) {
    return [];
  }

  const validations: Array<ValidationRule> = body.map((item: any) => {
    if(hasElement(item, 'selector')) {
      return mapValidations(item.selector, item.validate, 'body');
    } else {
      const name = isObject(item) ? extractName(item) : item;
      const match = mapToValidatorFunction(item);

      const validation: ValidationRule = {
        select: 'all',
        name,
        scope: 'body',
        builtin: false,
        match,
      };

      return validation;
    }
  });
  return validations.flat();
}

function mapBuiltin(key: string, value: any, scope: string): ValidationRule {
  const matchFunctions: { [key: string]: (list: []) => ExecutionResult } = {
    inOrder: (list: []) => inOrder(list, value),
    exists: (list: []) => exists(list, value),
    exactCount: (list: []) => exactCount(list, value),
    noDuplicates: (list: []) => noDuplicates(list),
  };

  const validation: ValidationRule = {
    name: key,
    scope,
    select: 'all',
    builtin: true,
    match:
      matchFunctions[key] ||
      ((list: []) => {
        logger.warn(`returned default builtin validator for "${key}" that evaluates to false!`);
        return false;
      }),
  };

  return validation;
}

/**
 *
 * @param fieldKey a key to used for selecting value from map for validation
 * @param valueOrList possible validations on specific element
 * @param scope
 * @returns
 */
function mapValidations(fieldKey: string, valueOrList: any, scope: string): Array<ValidationRule> {
  if (valueOrList === null) {
    throw new Error(`Key "${fieldKey}" must have a value or not be specified at all!`);
  }

  if (isValue(valueOrList)) {
    const validation: ValidationRule = {
      select: fieldKey,
      name: valueOrList,
      scope,
      builtin: false,
      match: createSingleValueValidator(valueOrList),
    };
    return [validation];
  }

  if (isArray(valueOrList)) {
    const validations: Array<ValidationRule> = valueOrList.map((item: any) => {
      const name = isObject(item) ? extractName(item) : item;
      const match = mapToValidatorFunction(item);

      const validation: ValidationRule = {
        select: fieldKey,
        name,
        scope,
        builtin: false,
        match,
      };

      return validation;
    });

    return validations;
  }

  throw new Error(`Could not detect the allowed matcher type for ${fieldKey}`);
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
function mapToValidatorFunction(rule: any) {
  if (isValue(rule)) {
    return createSingleValueValidator(rule);
  }
  if (isObject(rule)) {
    if (hasObjectKeyNamedRule(rule)) {
      const { rule: ruleName, ...rest } = rule;
      return createWithNamedArgumentsValidator(ruleName, rest);
    }
    if (hasSingleKey(rule)) {
      const pair = mapToKeyValue(rule);
      return createWithPositonArgumentsValidator(pair!.key, pair?.value);
    }
    if(hasElement(rule, 'name')) {
      return createInlinePatternRule(rule);
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
    logger.debug(`Executing matcher ${matcherName} with value ${value}`);
    return matcherFn();
  } catch (error) {
    logger.error((error as any).message);
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

function createInlinePatternRule(element: any): any /*ValidationRule */ {
  const patternInfo = {
    pattern: element.pattern,
    path: 'inline',
  };

  return (validatableValue: any): RegexExecutionResult =>
    wrapMatcher(element.name, validatableValue, () => execute(validatableValue, patternInfo));
}

function hasObjectKeyNamedRule(obj: any): boolean {
  return obj.hasOwnProperty('rule') && typeof obj.rule !== 'object';
}
