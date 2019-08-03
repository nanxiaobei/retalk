import createReducer from '../src/createReducer';

describe('createReducer', () => {
  it("should return model's reducer", () => {
    const testModel = {
      state: { a: 1, b: 2 },
      actions: {
        increment() {},
      },
    };
    const testReducer = createReducer('testModel', testModel.state);
    const nextState = testReducer(testModel.state, {
      type: 'testModel/increment',
      payload: { a: 10 },
    });
    expect(nextState).toEqual({ a: 10, b: 2, loading: {} });
  });
});
