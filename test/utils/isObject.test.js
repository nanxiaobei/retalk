import isObject from '@/utils/isObject';

describe('isObject', () => {
  it('should return true if argument is an object', () => {
    expect(isObject('123')).toBeFalsy();
    expect(isObject()).toBeFalsy();
    expect(isObject(null)).toBeFalsy();
    expect(isObject([1, 2, 3])).toBeFalsy();
    expect(isObject({ x: 1, y: 2 })).toBeTruthy();
  });
});
