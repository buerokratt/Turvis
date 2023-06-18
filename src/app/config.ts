import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface ApplicationConfig {
  finalResponseCode: {
    override: boolean;
  };
  logLevel: string;
}

interface DSLConfig {
  baseDir: string;
  regex: {
    patternsDir: string;
  };
  http: {
    httpRulesDir: string;
    failOnFirst: boolean;
    output: boolean;
  };
  logs: {
    logRulesDir: string;
    logsSource: string;
    logsDestination: string;
  };
}

export interface Config {
  application: ApplicationConfig;
  DSL: DSLConfig;
}

let _config: Config | null = null;

const load = (env: string): void => {
  if (_config !== null) {
    return;
  }

  const configFilePath = path.join(process.cwd(), 'config', `application.${env}.yml`);
  const yamlConfig = fs.readFileSync(configFilePath, 'utf8');
  _config = yaml.load(yamlConfig) as Config;

  if (_config === null || _config === undefined) {
    console.error('Load: Application configuration not loaded!');
    process.exit(1);
  }
}

const get = (): Config => {
  if (_config === null) {
    throw new Error('Application configuration not loaded!');
  }
  return _config;
};

export const config = {
  load,
  get,
}