import * as fs from 'fs';
import path from 'path';

import * as yaml from 'js-yaml';

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

let configuration: Config | null = null;

const get = (env: string): Config | null => {
  if (configuration === null) {
    const configFilePath = path.join(process.cwd(), 'config', `application.${env}.yml`);
    const yamlConfig = fs.readFileSync(configFilePath, 'utf8');
    configuration = yaml.load(yamlConfig) as Config;
  }
  if (config === null || config === undefined) {
    console.error('Application configuration not loaded!');
    process.exit(1);
  }
  return configuration;
};

export const config = {
  get,
};
