import fs from 'fs';
import { LogRules, logRulesParser } from '../rules/log/parser';
import { logValidator } from '../rules/log/validator';
import { logRulesResolver } from '../rules/log/resolver';
import { config } from '../../app/config';
import path from 'path';
import readline from 'readline';
import { logger } from '../../app/logger';
import { LogAnalyzer } from './analyzer.module';
import { LogValidationResult } from '../rules/log/LogValidationContext';
import { hasElement } from '../../utils/objectUtils';

export const logAnalyzer = {
  create(): LogAnalyzer {
    let filePath: string;

    const withFile = (file: string): LogAnalyzer => {
      filePath = file;
      return api;
    };

    const openFile = (inputFile: string): readline.Interface => {
      if (!inputFile) {
        throw new Error('No file specified! did you forget to call withFile()?');
      }
      if (!fs.existsSync(inputFile)) {
        throw new Error(`File ${inputFile} does not exist!`);
      }

      const readableStream = fs.createReadStream(inputFile, { encoding: 'utf8' });
      const lineReader = readline.createInterface({ input: readableStream });
      return lineReader;
    };

    const createValidators = (inputFile: string) => {
      const ruleFiles: string[] = logRulesResolver.resolve(inputFile);
      const rules = ruleFiles
        .map((filePath: string) => {
          return logRulesParser.parse(filePath);
        })
        .map((rules: LogRules) => logValidator.create(rules));

      return rules;
    };

    const process = (): void => {
      const lineReader = openFile(filePath);
      const validators = createValidators(filePath);
      const outputFileStream = createOutputStream(filePath);

      let lineNumber = 1;

      try {
        lineReader.on('line', (line: string) => {
          try {
            const validationResults = validators.map((validator) => validator.validate(line));
            if (validationResults.some((result) => result.status === 'failure')) {
              createErrorEntry(validationResults, line, lineNumber, outputFileStream);
            }
          } catch (e) {
            logger.warn('Error validating line:', e);
            outputFileStream.write(`failed to validate line: ${lineNumber}) ${line}` + '\n');
          }
          lineNumber++;
        });
        lineReader.on('close', () => handleFileClose(filePath, outputFileStream));
      } catch (error) {
        logger.warn(`Failed to process file ${filePath}`, (error as any).message, error);
        moveToFailedDirectory(filePath);
      }
    };

    function handleFileClose(filepath: string, outputFileStream: fs.WriteStream) {
      logger.info(`Finished processing file ${filepath}`);
      // delete the processed file and close output stream
      fs.unlinkSync(filepath);
      outputFileStream.end();
    }

    function createErrorEntry(
      validationResults: LogValidationResult[],
      line: string,
      lineNumber: number,
      outputFileStream: fs.WriteStream,
    ) {
      const failedLogEntry = `failed line: ${lineNumber}: ${line}`;
      outputFileStream.write(failedLogEntry + '\n');
      validationResults
        .filter((result) => result.status === 'failure')
        .forEach((validationResult) => {
          outputFileStream.write(`\t${validationResult.id}:\n`);
          createFailedLogEntry(validationResult, outputFileStream);
        });
    }

    function createFailedLogEntry(validationResult: LogValidationResult, outputFileStream: fs.WriteStream) {
      validationResult.details
        .filter((failure) => failure.result.result === false)
        .map((failure) => {
          if (hasElement(failure, 'position')) {
            return `\tfailed at position: ${failure.position} (${failure.result.value}) \n\t\t pattern: ${failure.result.pattern} (${failure.name})`;
          } else {
            return `\tfailed line pattern: ${failure.result.pattern} (${failure.name})`;
          }
        })
        .forEach((failure) => {
          outputFileStream.write('\t' + failure + '\n');
        });
    }

    function moveToFailedDirectory(filePath: string) {
      const failedDir = config.get().turvis.DSL.logs.LogsFailedDestinationDir;
      const relativeFilePath = filePath.replace(config.get().turvis.DSL.logs.logsSourceDir, '').replace(/^\//, '');
      const newFilePath = path.join(failedDir, relativeFilePath);

      const newFileDir = path.dirname(newFilePath);
      if (!fs.existsSync(newFileDir)) {
        fs.mkdirSync(newFileDir, { recursive: true });
      }

      fs.renameSync(filePath, newFilePath);
    }

    function createOutputStream(inputFilePath: string) {
      const incomingDir = config.get().turvis.DSL.logs.logsSourceDir;
      const processedDir = config.get().turvis.DSL.logs.logsDestinationDir;

      const relativeFilePath = inputFilePath.replace(incomingDir, '').replace(/^\//, '');
      const newFilePath = path.join(processedDir, relativeFilePath);

      // Create the directory structure if it doesn't exist
      const newFileDir = path.dirname(newFilePath);
      if (!fs.existsSync(newFileDir)) {
        fs.mkdirSync(newFileDir, { recursive: true });
      }

      return fs.createWriteStream(newFilePath, { encoding: 'utf8' });
    }

    const api: LogAnalyzer = {
      withFile,
      process,
    };

    return api;
  },
};
