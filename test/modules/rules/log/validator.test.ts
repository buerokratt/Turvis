import { logValidator } from 'src/modules/rules/log/validator';
import { logger } from 'src/app/logger';
import { LogValidationRule, LogRules } from 'src/modules/rules/log/parser';
import { execute } from 'src/modules/regex/execute';

// Mock logger.warn function
jest.mock('src/app/logger', () => ({
  logger: {
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Log validator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show warning that the delimiter is not specified', () => {
    const ruleset = {
      id: 'filename',
      delimiter: undefined, // No delimiter specified
      lineValidators: [],
      positionValidators: [],
    };

    const validator = logValidator.create(ruleset);
    validator.validate('log line');
    expect(logger.warn).toHaveBeenCalledWith('No delimiter specified for parsing log file!');
  });

  it('should validate line using lineValidators', () => {
    const line = '[2023-07-03T10:15:30Z] [requestId: abc123] sample log message.';
    const lineValidator1: LogValidationRule = {
      type: 'lookup',
      pattern: new RegExp(/\[requestId: [a-zA-Z0-9]+\]/),
      name: 'requestId',
      match: jest.fn((content) => execute(content, { pattern: lineValidator1.pattern, path: 'lookup' })),
    };

    const lineValidator2: LogValidationRule = {
      type: 'inline',
      pattern: new RegExp(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\]/),
      name: 'containsdate',
      match: jest.fn((content: string) => execute(content, { pattern: lineValidator2.pattern, path: 'inline' })),
    };

    const ruleset: LogRules = {
      id: 'filename',
      lineValidators: [lineValidator1, lineValidator2],
      positionValidators: [],
    };

    const validator = logValidator.create(ruleset);
    const result = validator.validate(line);

    expect(lineValidator1.match).toHaveBeenCalledWith(line);
    expect(lineValidator2.match).toHaveBeenCalledWith(line);

    const results = result.details.map((detail) => detail.result.result);
    expect(results).toEqual([true, true]);
  });

  it('should split the line and apply positional validators', () => {
    const logLine =
      '192.168.0.1 - john [03/Jul/2023:10:15:30 +0000] "GET /example \
      HTTP/1.1" 200 1234 "http://www.example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)\
      AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"';

    const logPattern = /^(\S+) (\S+) (\S+) \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)" "(.*?)"/;

    const matchIp: LogValidationRule = {
      type: 'inline',
      pattern: new RegExp(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/),
      name: 'ip',
      match: jest.fn((content: string) => execute(content, { pattern: matchIp.pattern, path: 'inline' })),
    };

    const matchResponseCode: LogValidationRule = {
      type: 'inline',
      pattern: new RegExp(/\d{3}/),
      name: 'responseCode',
      match: jest.fn((content: string) => execute(content, { pattern: matchResponseCode.pattern, path: 'inline' })),
    };

    const responseCodeValidations: { position: number; validators: LogValidationRule[] } = {
      position: 6,
      validators: [matchResponseCode],
    };

    const ipValidations = { position: 1, validators: [matchIp] };

    const ruleset: LogRules = {
      id: 'filename',
      delimiter: logPattern,
      lineValidators: [],
      positionValidators: [responseCodeValidations, ipValidations],
    };

    const validator = logValidator.create(ruleset);
    const logLineResult = validator.validate(logLine);

    const ipValidation = logLineResult.details.find((d) => d.name === 'ip');
    const responseValidation = logLineResult.details.find((d) => d.name === 'responseCode');

    expect(ipValidation!.result.result).toBe(true);
    expect(ipValidation!.name).toBe('ip');
    expect(ipValidation!.position).toBe(1);

    expect(responseValidation!.result.result).toBe(true);
    expect(responseValidation!.name).toBe('responseCode');
    expect(responseValidation!.position).toBe(6);
  });

  it('should split ruuter log line into parts', () => {
    const line = `2022-06-21 12:29:17.742+03:00  INFO [9ec5153c8585c6df,9ec5153c8585c6df] --- [nio-8080-exec-1] \
    e.b.ruuter.domain.ConfigurationInstance  : [ incoming.request] - - - - - \
    Request received for configuration: get-message`;
    const delimiter =
      /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2})\s+(\w+)\s+\[([^\]]+)\]\s+---\s+\[([^\]]+)\]\s+(\S+)\s+:\s+(.*)$/;

    const dateValidator: LogValidationRule = {
      type: 'inline',
      pattern: new RegExp(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}/),
      name: 'date',
      match: jest.fn((content: string) => execute(content, { pattern: dateValidator.pattern, path: 'inline' })),
    };

    const positionValidators = { position: 1, validators: [dateValidator] };

    const ruleset: LogRules = {
      id: 'filename',
      delimiter,
      lineValidators: [],
      positionValidators: [positionValidators]
    };

    const validator = logValidator.create(ruleset);
    const validationResult = validator.validate(line);

    expect(validationResult.status).toBe('success');
  });
});
