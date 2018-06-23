import createReducer from '@/createReducer';

describe('createReducer', () => {
  test('should added `loading` state to the model state', () => {
    const modelName = 'test';
    const modelState = {
      a: 1, b: 2,
    };
    const modelActions = {
      actionA: () => {},
      actionB: () => {},
    };
    const reducer = createReducer(modelName, modelState, modelActions);
    const state = reducer(modelState);
    expect(state).toEqual({ a: 1, b: 2, loading: {} });
  });
});
