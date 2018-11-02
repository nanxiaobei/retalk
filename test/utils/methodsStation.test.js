import methodsStation from '@/utils/methodsStation';
import error from '@/utils/error';

describe('methodsStation', () => {
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
    const dispatch = methodsStation(models)()(() => {});

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
      dispatch({ type: '@test/SET_STATE', partialState: [] });
    }).toThrow(
      error.INVALID_ACTION(),
    );
    expect(() => {
      dispatch({ type: '@test/SET_STATE', partialState: {} });
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
