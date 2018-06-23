import createReducer from '@/createReducer';

describe('createReducer', () => {
  const modelName = 'test';
  const modelState = { a: 1, b: 2 };
  test('should return reducer function', () => {
    const modelActions = {
      actionA() {},
      actionB() {},
    };
    const reducer = createReducer(modelName, modelState, modelActions);
    const newState = reducer(modelState, { type: 'test', nextState: { a: 2 } });
    expect(newState).toEqual({ a: 2, b: 2, loading: {} });
  });
  test('should added `loading` state to the model state', () => {
    const modelActions = {
      actionA() {},
      async actionB() {},
    };
    const reducer = createReducer(modelName, modelState, modelActions);
    const defaultState = reducer(modelState);
    expect(defaultState).toEqual({ a: 1, b: 2, loading: { actionB: false } });
  });
});
