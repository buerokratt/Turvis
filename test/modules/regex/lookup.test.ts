import * as cfg from '../../__mocks__/config';
jest.mock('src/app/config', () => ({
  config: {
    load: jest.fn(),
    get: jest.fn(() =>{ return {
      turvis: {
        DSL: {
          baseDir: 'patterns',
          regex: {
            patternsDir: 'regex'
          }
        }
      }
    }
    }),
  },
}));

import { readFileSync } from 'fs';

import { lookupRegex, PatternInfo } from 'src/modules/regex/lookup';

jest.mock('fs');

describe('lookupRegex', () => {
  const mockReadFileSync = readFileSync as jest.Mock;

  beforeEach(() => {
    mockReadFileSync.mockReset();
  });

  it('should return the pattern and path when reading the file', () => {
    const path = 'patternfile';
    const pattern = new RegExp('abc|def');
    const expectedResult: PatternInfo = {
      pattern,
      path: 'patternfile',
    };

    mockReadFileSync.mockReturnValueOnce(pattern);

    const result = lookupRegex(path);

    expect(mockReadFileSync).toHaveBeenCalledWith('patterns/regex/' + path, 'utf8');
    expect(result).toEqual(expectedResult);
  });

  it('should use parameters in regular expression and replace the placeholders', () => {
    const path = 'patternfile';
    const pattern = '^.{__minLength__,__maxLength__}$';

    const expectedResult: PatternInfo = {
      pattern: new RegExp('^.{5,10}$'),
      path: 'patternfile',
    };

    mockReadFileSync.mockReturnValueOnce(pattern);

    const result = lookupRegex(path, { minLength: 5, maxLength: 10 });

    expect(mockReadFileSync).toHaveBeenCalledWith('patterns/regex/' + path, 'utf8');
    expect(result).toEqual(expectedResult);
  });

  it('should use positional parameters in regular expression', () => {
    const path = 'patternfile';
    const pattern = new RegExp('^.(__0__|__1__|__2__)$');

    const expectedResult: PatternInfo = {
      pattern: new RegExp('^.(a|b|c)$'),
      path: 'patternfile',
    };

    mockReadFileSync.mockReturnValueOnce(pattern);

    const result = lookupRegex(path, ['a', 'b', 'c']);

    expect(mockReadFileSync).toHaveBeenCalledWith('patterns/regex/' + path, 'utf8');
    expect(result).toEqual(expectedResult);
  });
});
