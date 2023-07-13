import * as fs from 'fs';
import * as cfg from '../../../__mocks__/config';
import { logRulesParser } from 'src/modules/rules/log/parser';

jest.mock('src/app/config', () => ({
  config: {
    load: jest.fn(),
    get: jest.fn(() => cfg._config),
  },
}));

jest.mock('fs');

describe('ruleset parsing for logs DSL', () => {
  const mockReadFileSync = fs.readFileSync as jest.Mock;
  
  beforeEach(() => {
    mockReadFileSync.mockReset();
  });

  it('should parse a yaml ruleset with only delimiter specified', () => {
    const yamlString = `ruleset:
    delimiter: " "`;
    mockReadFileSync.mockReturnValue(yamlString);
    const logRules = logRulesParser.parse('testfile');
    expect(logRules.delimiter).toEqual(' ');
  });
  
  it('should fail when positional validations are specfied but delimiter is missing', () => {
    const yamlString = `ruleset:
    positions: 
      - position: 0
        patterns:
         - name: jwt`;
    mockReadFileSync.mockReturnValue(yamlString);
    expect(() => logRulesParser.parse('test')).toThrowError('No delimiter specified for parsing log lines!');
  });

  it('should parse shorthand pattern name', () => {
    const yamlString = `ruleset:
    linePatterns:
      - isToken`;
    mockReadFileSync.mockReturnValueOnce(yamlString);
    mockReadFileSync.mockReturnValueOnce('pattern');
    const logRules = logRulesParser.parse('test');
    const isToken = logRules.lineValidators[0];
    expect(isToken.name).toEqual('isToken');
    expect(isToken.type).toEqual('lookup');
    expect(isToken.pattern).toEqual(new RegExp('pattern'));
    expect(isToken.match).toEqual(expect.any(Function));
  });

  it('should parse shorthand pattern name with parameters', () => {
    const yamlString = `ruleset:
    linePatterns:
      - isValue: [a, b, c]`;
    mockReadFileSync.mockReturnValueOnce(yamlString);
    mockReadFileSync.mockReturnValueOnce('__0__|__1__|__2__');
    const logRules = logRulesParser.parse('test');
    const isToken = logRules.lineValidators[0];
    expect(isToken.name).toEqual('isValue');
    expect(isToken.type).toEqual('lookup');
    expect(isToken.pattern).toEqual(new RegExp('a|b|c'));
    expect(isToken.match).toEqual(expect.any(Function));
  });

  it('should parse by name', () => {
    const yamlString = `ruleset:
    linePatterns:
      - name: isToken`;
    mockReadFileSync.mockReturnValueOnce(yamlString);
    mockReadFileSync.mockReturnValueOnce('pattern');
    const logRules = logRulesParser.parse('test');
    const isToken = logRules.lineValidators[0];
    expect(isToken.name).toEqual('isToken');
    expect(isToken.type).toEqual('lookup');
    expect(isToken.pattern).toEqual(new RegExp('pattern'));
    expect(isToken.match).toEqual(expect.any(Function));
  });

  it('should parse by name and with arguments', () => {
    const yamlString = `ruleset:
    linePatterns:
      - name: either
        param1: one
        param2: two`;
    mockReadFileSync.mockReturnValueOnce(yamlString);
    mockReadFileSync.mockReturnValueOnce('__param1__|__param2__');
    const logRules = logRulesParser.parse('test');
    const isToken = logRules.lineValidators[0];
    expect(isToken.name).toEqual('either');
    expect(isToken.type).toEqual('lookup');
    expect(isToken.pattern).toEqual(new RegExp('one|two'));
    expect(isToken.match).toEqual(expect.any(Function));
  });

  it('should parse by name and with inline pattern', () => {
    const yamlString = `ruleset:
    linePatterns:
      - name: either
        regex: a|b`;
    mockReadFileSync.mockReturnValueOnce(yamlString);
    mockReadFileSync.mockReturnValueOnce('__param1__|__param2__');
    const logRules = logRulesParser.parse('test');
    const isToken = logRules.lineValidators[0];
    expect(isToken.name).toEqual('either');
    expect(isToken.type).toEqual('inline');
    expect(isToken.pattern).toEqual(new RegExp('a|b'));
    expect(isToken.match).toEqual(expect.any(Function));
  });

  it('should parse patterns to be applied to specific position', () => {
    const yamlString = `ruleset:
    delimiter: ' '
    positions:
      - position: 0
        patterns:
          - name: jwt
          - name: isToken
            param1: 1
            param2: 2`;
    mockReadFileSync.mockReturnValueOnce(yamlString);
    mockReadFileSync.mockReturnValueOnce('jwt pattern');
    mockReadFileSync.mockReturnValueOnce('token pattern');
    const logRules = logRulesParser.parse('test');
    const firstPosition = logRules.positionValidators[0];
    expect(firstPosition.position).toEqual(0);
    expect(firstPosition.validators.length).toEqual(2);
    expect(firstPosition.validators[0].name).toEqual('jwt');
    expect(firstPosition.validators[0].pattern).toEqual(new RegExp('jwt pattern'));
    expect(firstPosition.validators[0].match).toEqual(expect.any(Function));
    expect(firstPosition.validators[1].name).toEqual('isToken');
    expect(firstPosition.validators[1].pattern).toEqual(new RegExp('token pattern'));
    expect(firstPosition.validators[1].match).toEqual(expect.any(Function));
  });
});
