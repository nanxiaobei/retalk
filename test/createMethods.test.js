import createMethods from '@/createMethods';
import error from '@/utils/error';

describe('createMethods', () => {
  const store = {
    dispatch: () => {},
    getState: () => ({
      common: {},
      test: { loading: { actionB: false } },
    }),
  };
  store.dispatch.common = {};
  const name = 'test';

  it('should throw error if reducer is an async function', () => {
    const model = {
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

  it('should return an object with all reducers and actions', () => {
    const model = {
      reducers: {
        add() {},
      },
      actions: {
        actionA() {
          return this;
        },
        async actionB() {
          return this;
        },
      },
    };
    const newModel = createMethods(store, name, model);
    expect(Object.keys(newModel)).toEqual(['reducers', 'actions']);
    const methods = store.dispatch[name];
    expect(Object.keys(methods)).toEqual(['add', 'actionA', 'actionB']);
    expect(methods.add()).toBeUndefined();
    const nameList = ['reducer', 'action', 'asyncAction'];
    Object.values(methods).forEach(method => {
      expect(nameList.includes(method.name)).toBeTruthy();
    });
    expect(Object.keys(methods.actionA())).toEqual(['state', 'add', 'actionB', 'common']);
  });

  it('should have `setState` reducer in action\'s context if `reducers` does not exist', () => {
    const model = {
      actions: {
        actionA() {
          this.setState({});
          return this;
        },
        async actionB() {
          this.setState('common', {});
          return this;
        },
      },
    };
    createMethods(store, name, model);
    const methods = store.dispatch[name];
    expect(methods).toHaveProperty('setState');
    expect(methods.actionB()).resolves.toHaveProperty('setState');
  });
});
