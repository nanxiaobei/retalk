import verifyParam from '@/utils/verifyParam';

describe('verifyParam', () => {
  test('should throw error if arguments are not valid', () => {
    expect(() => {
      verifyParam();
    }).toThrow('Expected the `modelName` to be a string');
    expect(() => {
      verifyParam({});
    }).toThrow('Expected the `modelName` to be a string');
    expect(() => {
      verifyParam('test');
    }).toThrow('Expected the `test` model to be an object');
    expect(() => {
      verifyParam('test', []);
    }).toThrow('Expected the `test` model to be an object');
    expect(() => {
      verifyParam('test', {});
    }).toThrow('Expected to have `state` key in the `test` model');
    expect(() => {
      verifyParam('test', { state: [] });
    }).toThrow('Expected `state` in in the `test` model to be an object');
    expect(() => {
      verifyParam('test', { state: {} });
    }).toThrow('Expected to have `actions` key in the `test` model');
    expect(() => {
      verifyParam('test', { state: {}, actions: [] });
    }).toThrow('Expected `actions` in in the `test` model to be an object');
    expect(() => {
      verifyParam('test', { state: {}, actions: {} });
    }).not.toThrow();
  });
});
