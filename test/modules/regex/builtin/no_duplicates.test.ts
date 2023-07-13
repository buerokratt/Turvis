import { noDuplicates } from 'src/modules/regex/builtin/no_duplicates';

describe('noDuplicates', () => {
  it('should return true when there are no duplicate headers', () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
      Accept: 'application/json',
    };

    const { result } = noDuplicates(headers);

    expect(result).toBe(true);
  });

  // this test has an issue with multiple header values, fastify is appending them under same key
  // and not sure what is the better approach: either parse or try to get the raw http request
  /*it('should return false when there are duplicate headers', () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token',
      'Accept': 'application/json',
      'Content-Type': 'text/plain',
    };

    const result = noDuplicates(headers);

    expect(result).toBe(false);
  }); */

  it('should return true when the headers object is empty', () => {
    const headers = {};
    const { result } = noDuplicates(headers);
    expect(result).toBe(true);
  });
});
