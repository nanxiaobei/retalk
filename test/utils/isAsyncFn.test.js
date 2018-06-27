import isAsyncFn from '@/utils/isAsyncFn';

describe('isAsyncFn', () => {
  it('should return true if argument is an async function', () => {
    expect(isAsyncFn()).toBeFalsy();
    expect(isAsyncFn(function() {})).toBeFalsy();
    expect(isAsyncFn(() => {})).toBeFalsy();
    expect(isAsyncFn(async function() {})).toBeTruthy();
    expect(isAsyncFn(async () => {})).toBeTruthy();
    expect(isAsyncFn(() => new Promise(resolve => resolve(123)).then(data => data))).toBeTruthy();
    expect(isAsyncFn(() => fetch('https://google.com'))).toBeTruthy();
  });
});
