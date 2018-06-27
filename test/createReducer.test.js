import createReducer from '@/createReducer';

describe('createReducer', () => {
  const name = 'test';
  const model = {
    state: { a: 1, b: 2 },
  };

  it('should have only one action type `@test/SET_STATE` if `reducers` does not exist', () => {
    model.reducers = undefined;
    model.actions = {
      action() {},
    };
    const reducer = createReducer(name, model);
    const nextState = reducer(model.state, { type: '@test/SET_STATE', nextState: { a: 10 } });
    expect(nextState).toEqual({ a: 10, b: 2, loading: {} });
  });

  it('should have an action type `test/add` if `reducers` exists', () => {
    model.reducers = {
      add(state, num) {
        state.a = state.a + num;
        return state;
      },
    };
    model.actions = {
      action() {},
    };
    const reducer = createReducer(name, model);
    const nextState = reducer(model.state, { type: 'test/add', payload: [1] });
    expect(nextState).toEqual({ a: 2, b: 2, loading: {} });
  });

  it('should add `loading` state [object] to model state', () => {
    model.reducers = undefined;
    model.actions = {
      actionA() {},
      async actionB() {},
    };
    const reducer = createReducer(name, model);
    const nextState = reducer(model.state, { type: '@test/SET_STATE', nextState: { a: 10 } });
    expect(nextState).toEqual({ a: 10, b: 2, loading: { actionB: false } });
  });
});
