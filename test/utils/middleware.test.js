import middleware from '@/utils/middleware';
import error from '@/utils/error';

describe('middleware', () => {
  it('should throw error if action type is not valid', () => {
    const models = {
      test: {
        reducers: {
          add() {},
        },
        actions: {
          async addAsync() {},
        },
      },
    };
    const dispatch = middleware(models)()(() => {});

    expect(() => {
      dispatch('abc');
    }).toThrow(
      error.INVALID_ACTION(),
    );
    expect(() => {
      dispatch({ type: 123 });
    }).toThrow(
      error.INVALID_ACTION(),
    );
    expect(() => {
      dispatch({ type: 'abc' });
    }).toThrow(
      error.INVALID_ACTION(),
    );

    expect(() => {
      dispatch({ type: '@abc/SET_STATE' });
    }).toThrow(
      error.INVALID_ACTION('@abc/SET_STATE', 'abc'),
    );
    expect(() => {
      dispatch({ type: '@test/SET_STATE', nextState: [] });
    }).toThrow(
      error.INVALID_ACTION(),
    );
    expect(() => {
      dispatch({ type: '@test/SET_STATE', nextState: {} });
    }).not.toThrow();

    expect(() => {
      dispatch({ type: 'abc/add' });
    }).toThrow(
      error.INVALID_ACTION(),
    );
    expect(() => {
      dispatch({ type: 'test/addAsync' });
    }).toThrow(
      error.INVALID_ACTION(),
    );
    expect(() => {
      dispatch({ type: 'test/add', payload: {} });
    }).toThrow(
      error.INVALID_ACTION(),
    );
    expect(() => {
      dispatch({ type: 'test/add', payload: [] });
    }).not.toThrow();
  });
});
