import createMethods from '@/createMethods';
import error from '@/utils/error';

describe('createMethods', () => {
  const store = {
    dispatch: () => {},
    getState: () => ({
      common: {},
      test: { loading: { asyncAdd: false } },
    }),
  };
  store.dispatch.common = {};
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
    }).toThrow(
      error.ASYNC_REDUCER(name, 'add'),
    );
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
    }).toThrow(
      error.METHODS_CONFLICT(name, 'add'),
    );
  });

  it('should have `setState` reducer in action\'s context if `reducers` does not exist', () => {
    const model = {
      state: {},
      actions: {
        add() {
          this.setState({});
          return this;
        },
        async asyncAdd() {
          this.setState({});
          return this;
        },
      },
    };
    createMethods(store, name, model);
    const methods = store.dispatch[name];
    expect(methods).toHaveProperty('setState');
    expect(methods.asyncAdd()).resolves.toHaveProperty('setState');
  });

  it('should have `add` reducer in action\'s context if `reducers` exists', () => {
    const model = {
      state: {},
      reducers: {
        add() {},
      },
      actions: {},
    };
    createMethods(store, name, model);
    const methods = store.dispatch[name];
    expect(methods).toHaveProperty('add');
    expect(methods.add()).toBeUndefined();
  });
});
