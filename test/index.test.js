import { createStore, withStore } from '@/index';
import error from '@/utils/error';

describe('retalk', () => {
  describe('createStore', () => {
    it('should throw error if models is not an object', () => {
      expect(() => {
        createStore();
      }).toThrow(
        error.NOT_OBJECT('models'),
      );
    });
    it('should throw error if model importer is not valid', () => {
      expect(
        createStore({ test: () => {} }),
      ).rejects.toThrow(
        error.INVALID_IMPORTER('test'),
      );
    });
    it('should return redux store', async () => {
      const store = createStore({
        test: { state: {}, reducers: {}, actions: {} },
      });
      expect(store).toHaveProperty('dispatch');
      expect(() => {
        store.dispatch();
      }).toThrow();
      expect(store.dispatch).toHaveProperty('test');
      expect(store.getState()).toEqual({ test: { loading: {} } });
      expect(store.addModel('test', {})).toBeUndefined();
      const asyncStore = await createStore({
        async: () => ({ default: { state: {}, actions: {} } }),
        direct: { state: {}, reducers: {}, actions: {} },
      });
      expect(() => {
        asyncStore.addModel();
      }).toThrow();
      expect(asyncStore.addModel('add', { state: {}, actions: {} })).toBeUndefined();
    });
  });

  describe('withStore', () => {
    it('should throw error if model name is not valid', () => {
      expect(() => {
        withStore();
      }).toThrow(
        error.INVALID_MODEL_NAME(),
      );
      expect(() => {
        withStore(['test'])[0]();
      }).toThrow(
        error.INVALID_MODEL_NAME(),
      );
      expect(() => {
        withStore('test', 123)[0]();
      }).toThrow(
        error.INVALID_MODEL_NAME(),
      );
      expect(Array.isArray(withStore('test'))).toBeTruthy();
      expect(withStore('test').length).toBe(2);
      const connect = (mapState, mapMethods) => {
        mapState({ test: { a: 1 } });
        mapMethods({ test: { add: () => {} } });
      };
      expect(connect(...withStore('test'))).toBeUndefined();
    });
  });
});
