import pino, { LoggerOptions } from 'pino';
import { config } from './config';

const shouldLogToFile = config.get().turvis.application.logToFile;
const logLevel = config.get().turvis.application.logLevel || 'info';
const logFile = config.get().turvis.application.logFileLocation || 'logs/turvis.log';

const loggerOptions: LoggerOptions = {
  name: 'turvis',
  level: logLevel,
};

const configureLogger = () => {
  return  (shouldLogToFile) ?
    pino(loggerOptions, pino.destination(logFile)) :
    pino(loggerOptions);
}
const logger = configureLogger();

export { logger };
