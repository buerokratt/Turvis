import * as cfg from '../../../__mocks__/config';
jest.mock('src/app/config', () => ({
    config: {
      load: jest.fn(),
      get: jest.fn(() => cfg._config),
    },
  }));

import { config } from 'src/app/config';
import { rules } from 'src/modules/rules/rules.module';

function getTestFile(filename: string) {
  const patternsRootDir = config.get().turvis.DSL.baseDir;
  const rulesetsDir = config.get().turvis.DSL.http.httpRulesDir;
  return `${patternsRootDir}/${rulesetsDir}/tests/${filename}`;
}

describe('parsing regex jwt rule from yaml ruleset', () => {
  it('should find a simple (no-args) regular expression matcher for header key to validate jwt', async () => {
    const docList = rules.parseRules(getTestFile('regex_types/simple_type.yml'), { method: 'GET' });
    const jwt = docList[0].headers!.find((item: any) => item.name === 'jwt');
    expect(jwt).toBeDefined();
    expect(
      jwt!.match(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      ).result,
    ).toBeTruthy();
    expect(jwt!.match(123).result).toBeFalsy();
  });

  it('should find two simple value (no-args) matchers for header', async () => {
    const docList = rules.parseRules(getTestFile('regex_types/list_of_simple_type.yml'), { method: 'GET' });
    expect(docList.length).toBe(1);
    const functions = docList[0].headers;
    const jwt = functions!.find((item: any) => item.name === 'jwt');
    expect(jwt).toBeDefined();
    expect(jwt!.match('abc').result).toBeFalsy();
    expect(jwt!.match(1).result).toBeFalsy();
  });

  it('should find the parameterized rule', async () => {
    const docList = rules.parseRules(getTestFile('regex_types/regex_with_params.yml'), { method: 'GET' });
    expect(docList.length).toBe(1);
    const functions = docList[0].headers;
    const between = functions!.find((item: any) => item.name === 'between');
    expect(between).toBeDefined();
    expect(between!.match('abc').result).toBeTruthy();
    expect(between!.match('ab').result).toBeFalsy();
    expect(between!.match('abcdefghi').result).toBeFalsy();
  });

  it('should find the positional rule', async () => {
    const docList = rules.parseRules(getTestFile('regex_types/regex_with_positions.yml'), { method: 'GET' });
    expect(docList.length).toBe(1);
    const functions = docList[0].headers;
    const oneof = functions!.find((item: any) => item.name === 'oneof');
    expect(oneof).toBeDefined();
    expect(oneof!.match('a').result).toBeTruthy();
    expect(oneof!.match('abcdefghi').result).toBeFalsy();
  });
});
