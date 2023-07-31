import { inOrder } from 'src/modules/regex/builtin/in_order';

describe('checkHeaderOrder', () => {
  it('should return true if headers are in the expected order', () => {
    const headers = ['a', 'b', 'c', 'd', 'e'];
    const expectedOrder = ['a', 'b', 'e'];
    const { result } = inOrder(headers, expectedOrder);
    expect(result).toBe(true);
  });

  it('should return false if headers are not in the expected order', () => {
    const headers = ['a', 'c', 'b', 'e', 'd'];
    const expectedOrder = ['a', 'e', 'b'];
    const { result } = inOrder(headers, expectedOrder);
    expect(result).toBe(false);
  });

  it('should return true if headers are in the expected order with repeated headers', () => {
    const headers = ['a', 'b', 'b', 'c', 'd', 'e', 'e'];
    const expectedOrder = ['a', 'b', 'e'];
    const { result } = inOrder(headers, expectedOrder);
    expect(result).toBe(true);
  });

  it('should return true if headers are empty and expected order is empty', () => {
    const headers: string[] = [];
    const expectedOrder: string[] = [];
    const { result } = inOrder(headers, expectedOrder);
    expect(result).toBe(true);
  });

  it('should return false if headers are empty but expected order is not empty', () => {
    const headers: string[] = [];
    const expectedOrder = ['a', 'b', 'e'];
    const { result } = inOrder(headers, expectedOrder);
    expect(result).toBe(false);
  });
});
