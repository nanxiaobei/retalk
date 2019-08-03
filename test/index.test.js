import { compose } from 'redux';
import { createStore, withStore } from '../src/index';
import { ERR } from '../src/utils';

beforeEach(() => {
  jest.resetModules();
});
afterEach(() => {
  process.env.NODE_ENV = 'test';
});

describe('createStore', () => {
  it('should throw error if models or options is illegal', () => {
    const models = {
      testModel: { state: {}, actions: {} },
    };

    process.env.NODE_ENV = 'development';
    expect(() => {
      createStore();
    }).toThrow(ERR.NOT_OBJECT('models'));
    expect(() => {
      createStore(models, []);
    }).toThrow(ERR.NOT_OBJECT('options'));
    expect(() => {
      createStore(models, { useDevTools: 1 });
    }).toThrow(ERR.NOT_BOOLEAN('options.useDevTools'));
    expect(() => {
      createStore(models, { plugins: 123 });
    }).toThrow(ERR.NOT_ARRAY('options.plugins'));
  });

  it('should throw error if model name is duplicate with action names', () => {
    const models = {
      testModel: { state: {}, actions: { increment() {} } },
      increment: { state: {}, actions: {} },
    };

    process.env.NODE_ENV = 'development';
    expect(() => {
      createStore(models);
    }).toThrow(ERR.MODEL_NAME('increment'));
  });

  it('should return Redux store with addModel method', async () => {
    const models = {
      testModel: { state: {}, actions: { increment() {} } },
    };

    const runSharedTests = () => {
      const store = createStore(models);
      expect(store).toHaveProperty('getState');
      expect(() => {
        store.dispatch();
      }).toThrow(ERR.DISPATCH());
      // Add an existing model
      expect(store.addModel('testModel')).toBeUndefined();

      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = compose;
      const devStore = createStore(models, { useDevTools: true });
      devStore.addModel('testModel2', { state: {}, actions: {} });
      expect(devStore.dispatch).toHaveProperty('testModel2');
    };

    process.env.NODE_ENV = 'development';
    const store = createStore(models);
    // Add a new model (Duplicate with action's name)
    expect(() => {
      store.addModel('increment', { state: {}, actions: {} });
    }).toThrow(ERR.MODEL_NAME('increment'));
    runSharedTests();

    process.env.NODE_ENV = 'production';
    runSharedTests();
  });
});

describe('withStore', () => {
  it('should throw error if model name is not valid', () => {
    const connect = (mapState, mapActions) => {
      mapState({ testModel: {} });
      mapActions({ testModel: {} });
      return {};
    };

    const runSharedTests = () => {
      expect(Array.isArray(withStore('testModel'))).toBeTruthy();
      expect(withStore('testModel').length).toBe(2);
      expect(connect(...withStore('testModel'))).toEqual({});
    };

    process.env.NODE_ENV = 'development';
    expect(() => {
      connect(...withStore());
    }).toThrow(ERR.EMPTY_PARAM());
    expect(() => {
      connect(...withStore(['testModel']));
    }).toThrow(ERR.PARAM());
    expect(() => {
      connect(...withStore('testModel', 123));
    }).toThrow(ERR.PARAM());
    runSharedTests();

    process.env.NODE_ENV = 'production';
    runSharedTests();
  });

  it('should throw error if state or actions are duplicated when merge', () => {
    const increment = () => {};
    const state = { testModel: { value: 1 }, testModel2: { value: 1 }, testModel3: {} };
    const dispatch = { testModel: {}, testModel2: { increment }, testModel3: { increment } };
    const connect = (mapState, mapActions) => {
      mapState(state);
      mapActions(dispatch);
      return {};
    };

    const runSharedTests = () => {
      const [mapState, mapActions] = withStore('testModel', 'testModel3');
      expect(
        connect(
          mapState,
          mapActions,
        ),
      ).toEqual({});
      expect(mapState(state)).toEqual({ loading: {}, value: 1 });
      expect(mapActions(dispatch)).toEqual({ increment });
    };

    process.env.NODE_ENV = 'development';
    expect(() => {
      connect(...withStore('testModel', 'testModel2'));
    }).toThrow(ERR.DUPLICATE('testModel2', 'state', 'value'));
    expect(() => {
      connect(...withStore('testModel2', 'testModel3'));
    }).toThrow(ERR.DUPLICATE('testModel3', 'action', 'increment'));
    runSharedTests();

    process.env.NODE_ENV = 'production';
    runSharedTests();
  });
});
