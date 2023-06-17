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

export interface Configuration {
  load: (env: string) => Configuration;
  get: () => Config;
}

export const configuration = (): Configuration => {
  let config: Config | null = null;

  const load = (env: string): Configuration => {
    if (config !== null) {
      return api;
    }

    const configFilePath = path.join(process.cwd(), 'config', `application.${env}.yml`);
    const yamlConfig = fs.readFileSync(configFilePath, 'utf8');
    config = yaml.load(yamlConfig) as Config;

    if (config === null || config === undefined) {
      console.error('Application configuration not loaded!');
      process.exit(1);
    }

    return api;
  };

  const get = (): Config => {
    if (config === null) {
      throw new Error('Application configuration not loaded!');
    }
    return config;
  };

  const api: Configuration = {
    load,
    get,
  };

  return api;
}
