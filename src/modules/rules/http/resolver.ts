import { existsSync } from 'fs';
import { join } from 'path';
import { config } from '../../../app/config';

const httpRulesBasePath = join(config.get().turvis.DSL.baseDir, config.get().turvis.DSL.http.httpRulesDir);
const { defaultRuleset } = config.get().turvis.DSL.http;

export function resolveHttpRules(httpMethod: string, requestPath: string): { default: string; request: string } {
  let defaultRules = undefined;
  let pathRules = undefined;

  console.log("default ruelset:", defaultRuleset);


  if (defaultRuleset.enabled && defaultRuleset.methods.includes(httpMethod)) {
    console.log("load default rules: ", defaultRuleset.filename);
    defaultRules = resolveDefault(httpMethod, defaultRuleset.filename || 'default.yml');
  }

  try {
    pathRules = resolve(httpMethod, requestPath);
  } catch (e) {
    // Suppress error as path-based rule file might not always exist
  }

  return { default: defaultRules!, request: pathRules! };
}

export function resolve(httpMethod: string, requestPath: string) {
  const filePath = resolveFilePath(httpMethod, requestPath);

  if (!existsSync(filePath)) {
    throw new Error(`Rules file ${filePath} does not exist`);
  }

  return filePath;
}

export function resolveDefault(httpMethod: string, filename: string) {
  const filePath = join(httpRulesBasePath, 'general', httpMethod, filename || 'default.yml');
  if (!existsSync(filePath)) {
    throw new Error(`Rules file ${filePath} does not exist`);
  }
  return filePath;
}

export function resolveReference(httpMethod: string, path: string) {
  const filePath = join(httpRulesBasePath, 'general', httpMethod, `${path}.yml`);

  if (!existsSync(filePath)) {
    throw new Error(`Rules file ${filePath} does not exist`);
  }
  return filePath;
}

function resolveFilePath(httpMethod: string, requestPath: string) {
  const pathWithoutQuery = removeQueryFromPath(requestPath);
  const fileName = mapPathToFileName(pathWithoutQuery);
  return join(httpRulesBasePath, httpMethod, pathWithoutQuery, fileName);
}

function removeQueryFromPath(path: string): string {
  const queryStringIndex: number = path.indexOf('?');
  return queryStringIndex >= 0 ? path.slice(0, queryStringIndex) : path;
}

function mapPathToFileName(path: string) {
  const pathWithoutQuery: string = removeQueryFromPath(path);
  const parts: string[] = pathWithoutQuery.split('/').filter(Boolean);
  const value: string = parts[parts.length - 1];
  return `${value}.yml`;
}
