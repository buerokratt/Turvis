import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString, ValidateNested, isString, validateSync } from 'class-validator';
import { isArray } from '../utils/typeUtils';
import { logger } from './logger';

class ResponseCode {
  @IsNotEmpty()
  public override: number | boolean = false;
}

class DefaultRuleset {

  @IsBoolean()
  @IsNotEmpty()
  public enabled: boolean = false;

  @IsString()
  public filename?: string = 'default.yml'
  
  @IsArray()
  public methods: Array<string> = []
}

class ApplicationConfig {
  @IsNumber()
  @IsNotEmpty()
  port: number = 8060;

  @IsString()
  host: string = '::';

  @ValidateNested()
  finalResponseCode: ResponseCode = new ResponseCode();

  @IsString()
  @IsNotEmpty()
  public logLevel: string = 'INFO';

  @IsBoolean()
  public logToFile: boolean = false;

  @IsString()
  public logFileLocation: string = 'logs/turvis.log';
}

class RegexConfig {
  @IsString()
  @IsNotEmpty()
  public patternsDir: string = 'regex';

  @IsString()
  @IsNotEmpty()
  public endpoint: string = '/regex';
}

class HttpConfig {

  @IsString()
  @IsNotEmpty()
  public endpoint: string = '/ruuter-incoming';

  @IsString()
  @IsNotEmpty()
  public httpRulesDir: string = 'rules';

  @IsBoolean()
  @IsNotEmpty()
  public failOnFirst: boolean = false;

  @IsBoolean()
  public output: boolean = false;

  @ValidateNested()
  public defaultRuleset: DefaultRuleset = new DefaultRuleset();
}

class LogsConfig {
  @IsString()
  @IsNotEmpty()
  public logRulesDir: string = 'logs';

  @IsString()
  @IsNotEmpty()
  public logsSourceDir: string = 'filedrop/incoming';

  @IsString()
  @IsNotEmpty()
  public logsDestinationDir: string = 'filedrop/processed';

  @IsString()
  @IsNotEmpty()
  public LogsFailedDestinationDir: string = 'filedrop/failed';

  @IsNumber()
  @IsNotEmpty()
  public maxRetries: number = 3;

  @IsNumber()
  @IsNotEmpty()
  public retryDelay: number = 1000;

  @IsNumber()
  @IsNotEmpty()
  public maxConcurrency: number = 2;
}

class DSLConfig {
  @IsString()
  public baseDir: string = 'patterns';

  @ValidateNested()
  public regex: RegexConfig = new RegexConfig();

  @ValidateNested()
  public http: HttpConfig = new HttpConfig();

  @ValidateNested()
  public logs: LogsConfig = new LogsConfig();
}

class TurvisConfig {
  @ValidateNested()
  public application: ApplicationConfig = new ApplicationConfig();

  @ValidateNested()
  public DSL: DSLConfig = new DSLConfig();
}

class Config {
  @ValidateNested()
  public turvis: TurvisConfig = new TurvisConfig();
}

let _config: Config | null = null;

const load = (env: string): void => {
  if (_config !== null) {
    return;
  }

  const configFilePath = path.join(process.cwd(), 'config', `application.${env}.yml`);
  const yamlConfig = fs.readFileSync(configFilePath, 'utf8');
  const yamlData = yaml.load(yamlConfig);

  if (yamlData === null || yamlData === undefined) {
    logger.error('Load: Application configuration not loaded!');
    process.exit(1);
  }

  _config = new Config();
  deepObjectMapping(_config, yamlData);
  const validationErrors = validateSync(_config, { forbidUnknownValues: true, validationError: { target: true } });

  if (validationErrors.length > 0) {
    logger.error('Configuration validation failed:', validationErrors);
    process.exit(1);
  }
};

const deepObjectMapping = (target: any, source: any): void => {
  for (const key in source) {
    if (source.hasOwnProperty(key) && target.hasOwnProperty(key)) {
      if(isArray(source[key]) && isArray(target[key])) {
        target[key] = source[key];
      }
      else if (typeof target[key] === 'object' && typeof source[key] === 'object') {
        deepObjectMapping(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
};

const get = (): Config => {
  if (_config === null) {
    throw new Error('Application configuration not loaded!');
  }
  return _config;
};

export const config = {
  load,
  get,
};
