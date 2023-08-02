import { readdirSync } from 'fs';
import path, { join } from 'path';
import { config } from '../../../app/config';

const logRulesBasePath = join(config.get().turvis.DSL.baseDir, config.get().turvis.DSL.logs.logRulesDir);
const fileDropBaseDir = join(config.get().turvis.DSL.logs.logsSourceDir);

function resolve(logFile: string) {
  const relativePath = path.relative(fileDropBaseDir, logFile);
  const componentSegment = relativePath.split('/')[1];
  const componentRulesDir = resolveRulesDir(logFile);
  return join(componentRulesDir, `${componentSegment}.yml`);
}

function resolveRulesDir(logFile: string) {
  const relativePath = path.relative(fileDropBaseDir, logFile);
  const componentSegment = relativePath.split('/')[1];
  return join(logRulesBasePath, componentSegment);
}

function listFilesWithExtension(directoryPath: string, extension: string): string[] {
  const files = readdirSync(directoryPath);
  const filteredFiles = files.filter(file => file.endsWith(extension)).map(file => join(directoryPath, file));
  return filteredFiles;
}

function resolveAll(logFile: string) {
  const componentRulesDir = resolveRulesDir(logFile);
  const files = listFilesWithExtension(componentRulesDir, '.yml');
  return files;
}

export const logRulesResolver = {
  resolve,
  resolveAll,
};