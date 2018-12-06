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
      dispatch({ type: 123 });
    }).toThrow(error.INVALID_ACTION());
    expect(() => {
      dispatch({ type: 'abc' });
    }).toThrow(error.INVALID_ACTION());

    expect(() => {
      dispatch({ type: 'test/addAsync/SET_STATE', partialState: [] });
    }).toThrow(error.INVALID_ACTION());
    expect(() => {
      dispatch({ type: 'test/addAsync/SET_STATE', partialState: {} });
    }).not.toThrow();

    expect(() => {
      dispatch({ type: 'test/add', payload: {} });
    }).toThrow(error.INVALID_ACTION());
    expect(() => {
      dispatch({ type: 'test/add', payload: [] });
    }).not.toThrow();
  });
});
