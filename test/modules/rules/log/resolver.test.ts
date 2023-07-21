import { join } from 'path';
import * as cfg from '../../../__mocks__/config';
jest.mock('src/app/config', () => ({
  config: {
    load: jest.fn(),
    get: jest.fn(() => cfg._config),
  },
}));

import { logRulesResolver } from 'src/modules/rules/log/resolver';

describe('resolve Log Rules', () => {
  it('should return the correct rules file paths for a given log file', () => {
    const logFile = join(cfg._config.turvis.DSL.baseDir, cfg._config.turvis.DSL.logs.logRulesDir, '/client_id/ruuter/testlog.log');

    console.log("looking up logfile: " + logFile);
    const expectedRulesFilePath = 'test/__testData__/patterns/logs/ruuter.yml';
    const actualRulesFilePath = logRulesResolver.resolve(logFile);

    expect(actualRulesFilePath).toContain(expectedRulesFilePath);
  });
});
