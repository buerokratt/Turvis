import { exists } from 'src/modules/regex/builtin/exists';

describe('validateHeaders', () => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token',
  };

  it('should return true if all required headers are present', () => {
    const requiredHeaders = ['Content-Type', 'Authorization'];
    const result = exists(Object.keys(headers), requiredHeaders);
    expect(result).toBe(true);
  });

  it('should return false if any required headers are missing', () => {
    const requiredHeaders = ['Content-Type', 'Authorization', 'X-Custom-Header'];
    const result = exists(Object.keys(headers), requiredHeaders);
    expect(result).toBe(false);
  });
});
