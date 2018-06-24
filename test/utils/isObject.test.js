import isObject from '@/utils/isObject';

describe('isObject', () => {
  test('should return true if argument is an object', () => {
    expect(isObject('123')).toBe(false);
    expect(isObject()).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
    expect(isObject({ x: 1, y: 2 })).toBe(true);
  });
});
