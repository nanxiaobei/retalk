import createActions from '@/createActions';

describe('createActions', () => {
  const store = {
    theRealDispatch: () => {},
    getState: () => ({ common: {}, test: { loading: { actionB: false } } }),
  };
  const rootActions = {
    common: {},
  };
  const modelName = 'test';
  test('should throw error if action name is renamed with model name', () => {
    const modelActions = {
      common: () => {},
    };
    expect(() => {
      createActions(store, rootActions, modelName, modelActions);
    }).toThrow(
      'Action name and model name must not be renamed! Please modify the name of `common()` action in `test` model',
    );
  });
  test('should return an object with formatted actions', () => {
    const modelActions = {
      actionA() {
        this.setState({});
        return this;
      },
      async actionB() {
        this.setState('test', {});
        return this;
      },
    };
    rootActions.test = modelActions;
    const formattedActions = createActions(store, rootActions, modelName, modelActions);
    Object.values(formattedActions).forEach(action => {
      expect(action.name).toBe('actionWithContext');
    });
    expect(Object.keys(formattedActions)).toEqual(['actionA', 'actionB']);
    expect(Object.keys(formattedActions.actionA())).toEqual(['setState', 'state', 'actionB', 'common']);
    expect(formattedActions.actionB()).resolves.toHaveProperty('setState');
  });
});
