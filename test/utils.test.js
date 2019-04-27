import { ERR, isObject, isAsyncFn, checkModel } from '../src/utils';

describe('isObject', () => {
  it('should return true if argument is an object', () => {
    expect(isObject('123')).toBeFalsy();
    expect(isObject()).toBeFalsy();
    expect(isObject(null)).toBeFalsy();
    expect(isObject([1, 2, 3])).toBeFalsy();
    expect(isObject({ x: 1, y: 2 })).toBeTruthy();
  });
});

describe('isAsyncFn', () => {
  it('should return true if argument is an async function', () => {
    expect(isAsyncFn()).toBeFalsy();
    expect(isAsyncFn(function() {})).toBeFalsy();
    expect(isAsyncFn(() => {})).toBeFalsy();
    expect(isAsyncFn(async function() {})).toBeTruthy();
    expect(isAsyncFn(async () => {})).toBeTruthy();
  });
});

describe('checkModel', () => {
  it('should throw error if model is illegal', () => {
    expect(() => {
      checkModel({});
    }).toThrow(ERR.NOT_STRING('name'));
    expect(() => {
      checkModel('testModel');
    }).toThrow(ERR.NOT_OBJECT('model'));
    expect(() => {
      checkModel('testModel', {});
    }).toThrow(ERR.MODEL('testModel'));
    expect(() => {
      checkModel('testModel', { state: [] });
    }).toThrow(ERR.MODEL('testModel'));
    expect(() => {
      checkModel('testModel', { state: {} });
    }).toThrow(ERR.MODEL('testModel'));
    expect(() => {
      checkModel('testModel', { state: {}, actions: [] });
    }).toThrow(ERR.MODEL('testModel'));
  });

  it("should show 'reducers' deprecation warning", () => {
    const testModel = {
      state: { a: 1, b: 2 },
      reducers: {},
      actions: {},
    };
    expect(() => {
      checkModel('testModel', testModel);
    }).toThrow(ERR.DEPRECATED());
  });
});
