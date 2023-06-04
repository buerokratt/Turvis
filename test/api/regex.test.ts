import { readFileSync } from 'fs';

import { app } from 'src/main';

jest.mock('fs');

describe('Regex API test', () => {
  const mockReadFileSync = readFileSync as jest.Mock;

  beforeEach(() => {
    mockReadFileSync.mockReset();
  });

  it('should execute regex against the API', async () => {
    mockReadFileSync.mockReturnValueOnce("a|b");
    const response = await app.inject({
      method: 'POST',
      url: '/regex/email',
      headers: {
        "Content-Type": 'text/plain',
      },
      payload: 'a'
    });

    expect(response.statusCode).toBe(200);
  });

  it('should execute regex against the API and receive 400', async () => {
    // from test side: be ready to accept the call
    mockReadFileSync.mockReturnValueOnce("/^[\w\.-]+@[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/");
    const response = await app.inject({
      method: 'POST',
      url: '/regex/email',
      headers: {
        "Content-Type": 'text/plain',
      },
      payload: 'margus'
    });

    expect(response.statusCode).toBe(400);
  });

  it('should execute regex against the API with query params and see 200', async() => {
    mockReadFileSync.mockReturnValueOnce(/^.{__minWidth__,__maxWidth__}$/);

    const queryParams: any = { minWidth: "6", maxWidth: "10"};
    const response = await app.inject({
      method: 'POST',
      url: '/regex/',
      query: queryParams,
      headers: {
        "Content-Type": 'text/plain',
      },
      payload: 'margera'
    });

    expect(response.statusCode).toBe(200);
    
  })
});
