import { existsSync, readdirSync } from 'fs';
import path, { join } from 'path';
import { config } from '../../../app/config';
import { logger } from '../../../app/logger';

const logRulesBasePath = join(config.get().turvis.DSL.baseDir, config.get().turvis.DSL.logs.logRulesDir);
const filedropBasePath = join(config.get().turvis.DSL.logs.logsSourceDir);

/**
 *
 * by contract, the rules base dir contains generic rules that will
 * will be applied to all rule files
 *
 * @returns all generic rules from log rules base dir
 */
function resolveGenericRules() {
  const files = listFilesWithExtension(logRulesBasePath, '.yml');
  return files;
}

/**
 *
 * there two separate kind of rules: client specific and component specific
 * these are in:
 *  patters/<logrulesdir>/ruuter/*.yml
 * or
 *  patterns/<logrulesdir>/client_id/ruuuter/*.yml
 *
 * @param logFile file that has been sent for analysis
 *
 */
function resolve(logFile: string) {
  // grab everything relative to incoming basedir
  const relative = path.relative(filedropBasePath, logFile);

  // split it into parts. we assume two level deep structure
  const parts = relative.split(path.sep);

  // the last part should be file name
  const filename = parts.pop();

  if (parts.length < 2) {
    throw new Error('Invalid file path, cannot resolve rules');
  }

  // it can be eiter client/component or component/client
  const secondSegment = parts.pop();
  const firstSegment = parts.pop();

  const generic = resolveGenericRules();
  const firstPath = path.join(logRulesBasePath, firstSegment!, secondSegment!);
  const secondPath = path.join(logRulesBasePath, secondSegment!, firstSegment!);

  const result = [
    ...generic,
    ...listFilesWithExtension(firstPath, '.yml'),
    ...listFilesWithExtension(secondPath, '.yml'),
  ];

  logger.debug("looking up: ", path.join(logRulesBasePath, `${firstSegment}.yml`));
  if(existsSync(path.join(logRulesBasePath, `${firstSegment}.yml`))) {
    result.push(path.join(logRulesBasePath, `${firstSegment}.yml`));
  }

  logger.debug("looking up: ", path.join(logRulesBasePath, `${secondSegment}.yml`));
  if(existsSync(path.join(logRulesBasePath, `${secondSegment}.yml`))) {
    result.push(path.join(logRulesBasePath, `${secondSegment}.yml`));
  }

  return removeDuplicatePaths(result);
}

function listFilesWithExtension(directoryPath: string, extension: string): string[] {

  if(existsSync(directoryPath) === false) {
    logger.warn(`Directory ${directoryPath} does not exist, skipping rules lookup`);
    return [];
  }
  const files = readdirSync(directoryPath);
  const filteredFiles = files.filter((file) => file.endsWith(extension)).map((file) => join(directoryPath, file));
  return filteredFiles;
}

function removeDuplicatePaths(paths: string[]): string[] {
  const uniquePaths: string[] = [];
  for (const path of paths) {
    if (!uniquePaths.includes(path)) {
      uniquePaths.push(path);
    }
  }
  return uniquePaths;
}

export const logRulesResolver = {
  resolve,
};
