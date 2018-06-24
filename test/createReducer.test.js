import createReducer from '@/createReducer';

describe('createReducer', () => {
  const modelName = 'test';
  const modelState = { a: 1, b: 2 };

  test('should have action type `@test/SET_STATE` if `reducers` key does not exist', () => {
    const modelReducers = undefined;
    const modelActions = {
      action() {},
    };
    const reducer = createReducer(modelName, modelState, modelReducers, modelActions);
    const nextState = reducer(modelState, { type: '@test/SET_STATE', nextState: { a: 10 } });
    expect(nextState).toEqual({ a: 10, b: 2, loading: {} });
  });

  test('should have action type `test/add` if `reducers` key exists', () => {
    const modelReducers = {
      add(state, num) {
        state.a = state.a + num;
        return state;
      },
    };
    const modelActions = {
      action() {},
    };
    const reducer = createReducer(modelName, modelState, modelReducers, modelActions);
    const nextState = reducer(modelState, { type: 'test/add', payload: [1] });
    expect(nextState).toEqual({ a: 2, b: 2, loading: {} });
  });

  test('should add `loading` state to the model state', () => {
    const modelReducers = undefined;
    const modelActions = {
      actionA() {},
      async actionB() {},
    };
    const reducer = createReducer(modelName, modelState, modelReducers, modelActions);
    const nextState = reducer(modelState, { type: '@test/SET_STATE', nextState: { a: 20 } });
    expect(nextState).toEqual({ a: 20, b: 2, loading: { actionB: false } });
  });
});
