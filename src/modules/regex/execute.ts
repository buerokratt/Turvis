import { isJSON } from '../../utils/objectUtils';
import { logger } from '../../app/logger';
import { PatternInfo } from './lookup';
import { RegexExecutionResult } from './regex.module';
import { isObject } from 'class-validator';

export function execute(content: any, patternInfo: PatternInfo): RegexExecutionResult {
  let regex!: RegExp;
  let result: boolean;

  try {
    regex = patternInfo.pattern instanceof RegExp ? patternInfo.pattern : new RegExp(patternInfo.pattern);
    logger.debug('Executing pattern ' +  regex + " against content: " +  content);

    if (typeof content === 'string') {
      result = regex.test(content);
    } else if (isJSON(content) || isObject(content)) {
      result = regex.test(JSON.stringify(content));
    } else {
      result = regex.test(content.toString());
    }

    if (!result) {
      const message = `Unable to match pattern ${regex.toString()} against content: ${content.toString()}`;
      logger.debug(message);
      throw new Error(message);
    }

    return {
      value: content,
      patternFile: patternInfo.path,
      pattern: regex,
      result,
    };
  } catch (error) {
    return {
      value: content,
      patternFile: patternInfo.path,
      pattern: regex ? regex : patternInfo.pattern,
      error: `Error executing pattern: ${(error as Error).message}`,
      result: false,
    };
  }
}
