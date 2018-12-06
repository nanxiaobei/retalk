import createReducer from '@/createReducer';
import error from '@/utils/error';

describe('createReducer', () => {
  const name = 'test';
  const model = {
    state: { a: 1, b: 2 },
  };

  it('should throw error if name or model is not valid', () => {
    expect(() => {
      createReducer(name);
    }).toThrow(error.NOT_OBJECT('model'));
    expect(() => {
      createReducer(name, {});
    }).toThrow(error.NO_MODEL_KEY(name, 'state'));
    expect(() => {
      createReducer(name, { state: [] });
    }).toThrow(error.NOT_OBJECT(name, 'state'));
    expect(() => {
      createReducer(name, { state: {} });
    }).toThrow(error.NO_MODEL_KEY(name, 'actions'));
    expect(() => {
      createReducer(name, { state: {}, actions: [] });
    }).toThrow(error.NOT_OBJECT(name, 'actions'));
    expect(() => {
      createReducer(name, { state: {}, reducers: [], actions: {} });
    }).toThrow(error.INVALID_REDUCERS(name));
  });

  it('should have only one action type `test/add/SET_STATE` if `reducers` does not exist', () => {
    model.reducers = undefined;
    model.actions = {
      add() {},
    };
    const reducer = createReducer(name, model);
    const partialState = reducer(model.state, {
      type: 'test/action/SET_STATE',
      partialState: { a: 10 },
    });
    expect(partialState).toEqual({ a: 10, b: 2 });
  });

  it('should have an action type `test/add` if `reducers` exists', () => {
    model.reducers = {
      add(state, num) {
        state.a = state.a + num;
        return state;
      },
    };
    model.actions = {};
    const reducer = createReducer(name, model);
    const partialState = reducer(model.state, { type: 'test/add', payload: [1] });
    expect(partialState).toEqual({ a: 2, b: 2 });
  });
});
