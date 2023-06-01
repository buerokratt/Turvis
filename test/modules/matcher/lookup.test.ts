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
    const pattern = 'abc|def';
    const expectedResult: PatternInfo = {
      pattern,
      path: 'patternfile',
    };

    mockReadFileSync.mockReturnValueOnce(pattern);

    const result = lookupRegex(path);

    expect(mockReadFileSync).toHaveBeenCalledWith('patterns/expressions/' + path, 'utf8');
    expect(result).toEqual(expectedResult);
  });
});
