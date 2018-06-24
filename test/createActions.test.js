import createActions from '@/createActions';

describe('createActions', () => {
  const store = {
    theRealDispatch: () => {},
    getState: () => ({ common: {}, test: { loading: { actionB: false } } }),
  };
  const rootReducers = {};
  const rootActions = {
    common: {},
    test: {},
  };
  const modelName = 'test';

  test('should throw error if reducer is async function', () => {
    rootReducers.test = {
      async add() {},
    };
    expect(() => {
      createActions(store, rootReducers, rootActions, modelName);
    }).toThrow(
      'Reducer can not be async function! Please modify the `add()` reducer in `test` model',
    );
  });

  test('should throw error if reducer name is duplicated with model name', () => {
    rootReducers.test = {
      common() {},
    };
    expect(() => {
      createActions(store, rootReducers, rootActions, modelName);
    }).toThrow(
      'Reducer name and model name can not be duplicated! Please modify the `common()` reducer\'s name in `test` model',
    );
  });

  test('should throw error if action name is duplicated with model name', () => {
    rootReducers.test = {};
    rootActions.test = {
      common() {},
    };
    expect(() => {
      createActions(store, rootReducers, rootActions, modelName);
    }).toThrow(
      'Action name and model name can not be duplicated! Please modify the `common()` action\'s name in `test` model',
    );
  });

  test('should throw error if reducer name is duplicated with action name', () => {
    rootReducers.test = {
      add() {},
    };
    rootActions.test = {
      add() {},
    };
    expect(() => {
      createActions(store, rootReducers, rootActions, modelName);
    }).toThrow(
      'Reducer name and action name can not be duplicated! Please modify the `add()` reducer\'s name in `test` model',
    );
  });

  test('should return an object with `reducers` and `actions`', () => {
    rootReducers.test = {
      add() {},
    };
    rootActions.test = {
      actionA() {
        return this;
      },
      async actionB() {
        return this;
      },
    };

    const { reducers, actions } = createActions(store, rootReducers, rootActions, modelName);
    expect(Object.keys(reducers)).toEqual(['add']);
    expect(reducers.add()).toBe(undefined);
    Object.values(reducers).forEach(reducer => {
      expect(reducer.name).toBe('reducer');
    });

    expect(Object.keys(actions)).toEqual(['actionA', 'actionB']);
    expect(Object.keys(actions.actionA())).toEqual(['state', 'add', 'actionB', 'common']);
    Object.values(actions).forEach(action => {
      expect(action.name === 'action' || action.name === 'asyncAction').toBeTruthy();
    });
  });

  test('should have `setState` reducer in action\'s context if `reducers` does not exist', () => {
    rootReducers.test = undefined;
    rootActions.test = {
      actionA() {
        this.setState({});
        return this;
      },
      async actionB() {
        this.setState('common', {});
        return this;
      },
    };

    const { reducers, actions } = createActions(store, rootReducers, rootActions, modelName);
    expect(Object.keys(reducers)).toEqual(['setState']);
    expect(actions.actionB()).resolves.toHaveProperty('setState');
  });
});
