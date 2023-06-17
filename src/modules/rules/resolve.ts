import { existsSync } from 'fs';
import { join } from 'path';

import { configuration } from '../../app/config';

const basePath = configuration().get().DSL.baseDir;

export function resolveRules(httpMethod: string, requestPath: string) {
  // parse default and path specific rules. path specific might not exist
  let defaultPath;
  let requestRulesPath;

  defaultPath = resolveDefault(httpMethod);
  try {
    requestRulesPath = resolve(httpMethod, requestPath);
  } catch (e) {
    // supress error as there might not always be path-based rule file
  }

  return { default: defaultPath, request: requestRulesPath };
}

export function resolve(httpMethod: string, requestPath: string) {
  const filePath = join(basePath, httpMethod, requestPath, mapPathToFileName(requestPath));

  if (!existsSync(filePath)) {
    throw new Error(`Rules file ${filePath} does not exist`);
  }

  return filePath;
}

export function resolveDefault(httpMethod: string) {
  const filePath = join(basePath, 'general', httpMethod, 'default.yml');
  if (!existsSync(filePath)) {
    throw new Error(`Rules file ${filePath} does not exist`);
  }
  return filePath;
}

export function resolveReference(httpMethod: string, path: string) {
  const filePath = join(basePath, 'general', httpMethod, `${path}.yml`);

  if (!existsSync(filePath)) {
    throw new Error(`Rules file ${filePath} does not exist`);
  }
  return filePath;
}

function mapPathToFileName(path: string) {
  const parts = path.split('/');
  let value = parts[parts.length - 1];

  if (value === '') {
    value = parts[parts.length - 2];
  }
  return `${value}.yml`;
}
