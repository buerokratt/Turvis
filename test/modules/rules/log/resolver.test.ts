import * as cfg from '../../../__mocks__/config';
jest.mock('src/app/config', () => ({
  config: {
    load: jest.fn(),
    get: jest.fn(() => cfg._config),
  },
}));

import { logRulesResolver } from 'src/modules/rules/log/resolver';

describe('resolveLogRules', () => {

  it('should return the correct rules file path for a given log file', () => {
    const logFile = '__testData__/filedrop/incoming/client_id/ruuter/testlog.log';
    const expectedRulesFilePath = 'test/__testData__/patterns/logs/ruuter/ruuter.yml';
    const actualRulesFilePath = logRulesResolver.resolve(logFile);

    expect(actualRulesFilePath).toEqual(expectedRulesFilePath);
  });

  it('should return the correct rules file paths for a given log file', () => {
    const logFile = '__testData__/filedrop/incoming/client_id/ruuter/testlog.log';
    const expectedRulesFilePath = 'test/__testData__/patterns/logs/ruuter/ruuter.yml';
    const actualRulesFilePath = logRulesResolver.resolveAll(logFile);

    expect(actualRulesFilePath).toContain(expectedRulesFilePath);
  });
});