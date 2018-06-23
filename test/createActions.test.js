import createActions from '@/createActions';

describe('createActions', () => {
  test('should return an object with formatted actions', () => {
    const store = {
      theRealDispatch: () => {},
      getState: () => ({ test: { loading: {} } }),
    };
    const rootActions = {
      common: {},
    };
    const modelName = 'test';
    const modelActions = {
      actionA: () => {},
      actionB: () => {},
    };
    const formattedActions = createActions(store, rootActions, modelName, modelActions);
    expect(Object.keys(formattedActions)).toEqual(['actionA', 'actionB']);
    Object.values(formattedActions).forEach(action => {
      expect(action.name).toBe('actionWithContext');
    });
  });
});
