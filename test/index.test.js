import { compose } from 'redux';
import { createStore, withStore } from '@/index';
import error from '@/utils/error';

describe('retalk', () => {
  describe('createStore', () => {
    const models = {
      test: { state: {}, reducers: {}, actions: {} },
    };
    it('should throw error if models is not an object', () => {
      expect(() => {
        createStore();
      }).toThrow(error.NOT_OBJECT('models'));
    });
    it('should throw error if options is not an object', () => {
      expect(() => {
        createStore(models, []);
      }).toThrow(error.NOT_OBJECT('options'));
    });
    it('should throw error if options.useDevTools is not a boolean', () => {
      expect(() => {
        createStore(models, { useDevTools: 1 });
      }).toThrow(error.NOT_BOOLEAN('options.useDevTools'));
    });
    it('should throw error if options.plugins is not an array', () => {
      expect(() => {
        createStore(models, { plugins: 123 });
      }).toThrow(error.NOT_ARRAY('options.plugins'));
    });
    it('should throw error if model importer is not valid', () => {
      expect(createStore({ test: () => {} })).rejects.toThrow(error.INVALID_IMPORTER('test'));
    });
    it('should return redux store', async () => {
      const store = createStore(models);
      expect(store).toHaveProperty('dispatch');
      expect(() => {
        store.dispatch();
      }).toThrow();
      expect(store.dispatch).toHaveProperty('test');
      expect(store.getState()).toEqual({ test: { loading: {} } });
      expect(store.addModel('test', {})).toBeUndefined();
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = compose;
      const storeWithDevtools = createStore(
        {
          test: { state: {}, actions: {} },
        },
        { useDevTools: true },
      );
      expect(storeWithDevtools).toHaveProperty('getState');
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
      const connect = (mapState, mapMethods) => {
        mapState({ test: {} });
        mapMethods({ test: {} });
        return {};
      };
      expect(() => {
        connect(...withStore());
      }).toThrow(error.INVALID_MODEL_NAME());
      expect(() => {
        connect(...withStore(['test']));
      }).toThrow(error.INVALID_MODEL_NAME());
      expect(() => {
        connect(...withStore('test', 123));
      }).toThrow(error.INVALID_MODEL_NAME());
      expect(Array.isArray(withStore('test'))).toBeTruthy();
      expect(withStore('test').length).toBe(2);
      expect(connect(...withStore('test'))).toEqual({});
    });
  });
});
