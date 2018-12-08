import createMethods from '@/createMethods';
import error from '@/utils/error';

describe('createMethods', () => {
  const store = {
    dispatch: () => {},
    getState: () => ({
      basic: {},
      test: { loading: { addAsync: false } },
    }),
  };
  store.dispatch.basic = {};
  const name = 'test';

  it('should throw error if reducer is an async function', () => {
    const model = {
      state: {},
      reducers: {
        async add() {},
      },
    };
    expect(() => {
      createMethods(store, name, model);
    }).toThrow(error.ASYNC_REDUCER(name, 'add'));
  });

  it('should throw error if reducer name is duplicated with action name', () => {
    const model = {
      state: {},
      reducers: {
        add() {},
      },
      actions: {
        add() {},
      },
    };
    expect(() => {
      createMethods(store, name, model);
    }).toThrow(error.METHODS_CONFLICT(name, 'add'));
  });

  it('should have `setState` in context if `reducers` does not exist', () => {
    const model = {
      state: {},
      actions: {
        add() {
          return this;
        },
        sum() {
          return this;
        },
      },
    };
    createMethods(store, name, model);
    const actions = store.dispatch[name];
    expect(actions.add()).toHaveProperty('setState');
    expect(actions.sum()).toHaveProperty('add');
  });

  it('should have `[reducer]` in context if `reducers` exists', () => {
    const model = {
      state: {},
      reducers: {
        add() {},
      },
      actions: {
        async addAsync() {
          this.add();
          return this;
        },
      },
    };
    createMethods(store, name, model);
    const actions = store.dispatch[name];
    expect(actions.addAsync()).resolves.toHaveProperty('add');
  });
});
