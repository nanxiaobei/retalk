import isAsyncFn from '@/utils/isAsyncFn';

describe('isAsyncFn', () => {
  test('should return true if argument is an async function', () => {
    expect(isAsyncFn()).toBe(false);
    expect(isAsyncFn(function() {})).toBe(false);
    expect(isAsyncFn(() => {})).toBe(false);
    expect(isAsyncFn(async function() {})).toBe(true);
    expect(isAsyncFn(async () => {})).toBe(true);
    expect(isAsyncFn(() => new Promise(resolve => resolve(123)).then(data => data))).toBe(true);
    expect(isAsyncFn(() => fetch('https://google.com'))).toBe(true);
  });
});
