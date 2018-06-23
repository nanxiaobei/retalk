import { createStore, connect, withStore } from '@/index';

describe('retalk', () => {
  describe('createStore', () => {
    test('should throw error when argument is not an object', async () => {
      expect(() => {
        createStore();
      }).toThrow('Expected the `models` to be an object');
      expect(() => {
        createStore([]);
      }).toThrow('Expected the `models` to be an object');
    });
    test('should return redux store', async () => {
      const common = { state: {}, actions: {} };
      expect(
        createStore({ common }).getState(),
      ).toEqual({ common: { ...common.state, loading: {} } });
    });
  });
  describe('connect', () => {
    test('should throw error when arguments to first function are not functions', () => {
      expect(() => {
        connect()();
      }).toThrow();
      expect(() => {
        withStore(123)();
      }).toThrow();
      expect(() => {
        connect([])();
      }).toThrow();
      expect(() => {
        connect({})();
      }).toThrow();
    });
  });
  describe('withStore', () => {
    test('should throw error when arguments to first function are not strings', () => {
      expect(() => {
        withStore()();
      }).toThrow();
      expect(() => {
        withStore(123)();
      }).toThrow();
      expect(() => {
        withStore([])();
      }).toThrow();
      expect(() => {
        withStore({})();
      }).toThrow();
    });
  });
});
