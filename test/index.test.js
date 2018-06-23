import { createStore, connect, withStore } from '@/index';

describe('retalk', () => {
  describe('createStore', () => {
    test('should throw error if argument is not an object', () => {
      expect(() => {
        createStore();
      }).toThrow('Expected the `models` to be an object');
    });
    test('should throw error if model does not have state or actions key', () => {
      expect(() => {
        createStore({ test: {} });
      }).toThrow('Expected to have `state` key in the `test` model');
      expect(() => {
        createStore({ test: { state: {} } });
      }).toThrow('Expected to have `actions` key in the `test` model');
    });
    test('should throw error if models are not correct types', () => {
      expect(() => {
        createStore({ common: { state: {}, actions: {} }, test: () => {} });
      }).toThrow('Expected the `test` model to be an object');
      expect(() => {
        createStore({ common: () => {}, test: {} });
      }).toThrow('If async import model, expected the `test` model to be an import function, but got `object`');
      expect(
        createStore({ test: () => {} }),
      ).rejects.toThrow('If async import model, expected the `test` model to be an import function');
    });
    test('should return redux store', async () => {
      const store = createStore({ test: { state: {}, actions: {} } });
      expect(store).toHaveProperty('theRealDispatch');
      expect(() => {
        store.theRealDispatch();
      }).toThrow();
      expect(store.dispatch()).toHaveProperty('test');
      expect(store.getState()).toEqual({ test: { loading: {} } });
      const asyncStore = await createStore({ test: () => ({ default: { state: {}, actions: {} } }) });
      expect(asyncStore).toHaveProperty('addModule');
      expect(asyncStore.addModule('test', {}, {})).toBe();
    });
  });
  describe('connect', () => {
    test('should throw error if arguments are not valid', () => {
      expect(() => {
        connect()();
      }).toThrow();
      expect(() => {
        connect()(() => null);
      }).not.toThrow();
      expect(() => {
        connect(rootState => rootState, rootActions => rootActions)(() => null);
      }).not.toThrow();
    });
  });
  describe('withStore', () => {
    test('should throw error if arguments are not valid', () => {
      expect(() => {
        withStore()();
      }).toThrow();
      expect(() => {
        withStore()(() => null);
      }).not.toThrow();
      expect(() => {
        withStore('test')(() => null);
      }).not.toThrow();
    });
  });
});
