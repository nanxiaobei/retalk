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
          async wait(param) {
            return param;
          },
        },
      },
    };
    const next = action => action;
    const dispatch = middleware(models)()(next);

    expect(() => {
      dispatch(123);
    }).toThrow(
      error.INVALID_ACTION_TYPE(123),
    );
    expect(() => {
      dispatch('abc');
    }).toThrow(
      error.INVALID_ACTION_TYPE('abc'),
    );
    expect(() => {
      dispatch({ type: 'abc' });
    }).toThrow(
      error.INVALID_ACTION_TYPE('abc'),
    );

    expect(() => {
      dispatch('@abc/SET_STATE');
    }).toThrow(
      error.INVALID_ACTION_TYPE('@abc/SET_STATE', 'abc'),
    );
    expect(() => {
      dispatch({ type: '@abc/SET_STATE' });
    }).toThrow(
      error.INVALID_ACTION_TYPE('@abc/SET_STATE', 'abc'),
    );

    expect(() => {
      dispatch('@test/SET_STATE', []);
    }).toThrow(
      error.INVALID_NEXT_STATE(),
    );
    expect(() => {
      dispatch({ type: '@test/SET_STATE', payload: [[]] });
    }).toThrow(
      error.INVALID_NEXT_STATE(),
    );

    // usage
    expect(() => {
      dispatch('@test/SET_STATE', {});
    }).not.toThrow();
    expect(() => {
      dispatch({ type: '@test/SET_STATE', payload: [{}] });
    }).not.toThrow();

    expect(() => {
      dispatch({ type: '@test/SET_STATE', nextState: [] });
    }).toThrow(
      error.INVALID_NEXT_STATE(),
    );
    expect(() => {
      dispatch({ type: '@test/SET_STATE', nextState: {} });
    }).not.toThrow();
    expect(() => {
      dispatch({ type: '@test/SET_STATE', payload: {} });
    }).toThrow(
      error.INVALID_NEXT_STATE(),
    );

    expect(() => {
      dispatch('abc/add');
    }).toThrow(
      error.INVALID_ACTION_TYPE('abc/add', 'abc'),
    );
    expect(() => {
      dispatch({ type: 'abc/add' });
    }).toThrow(
      error.INVALID_ACTION_TYPE('abc/add', 'abc'),
    );

    expect(() => {
      dispatch('test/addNum');
    }).toThrow(
      error.INVALID_ACTION_TYPE('test/addNum', 'test', 'addNum'),
    );
    expect(() => {
      dispatch({ type: 'test/addNum' });
    }).toThrow(
      error.INVALID_ACTION_TYPE('test/addNum', 'test', 'addNum'),
    );

    // usage
    expect(
      dispatch('test/add'),
    ).toEqual(
      { type: 'test/add', payload: [] },
    );

    expect(() => {
      dispatch({ type: 'test/add' });
    }).not.toThrow();
    expect(() => {
      dispatch({ type: 'test/add', payload: {} });
    }).toThrow(
      error.INVALID_PAYLOAD(),
    );
    expect(() => {
      dispatch({ type: 'test/add', payload: [] });
    }).not.toThrow();

    expect(
      dispatch({ type: 'test/add', payload: [] }),
    ).toEqual(
      { type: 'test/add', payload: [] },
    );

    // usage
    expect(
      dispatch('test/add', 123),
    ).toEqual(
      { type: 'test/add', payload: [123] },
    );
    expect(
      dispatch({ type: 'test/add', payload: [123] }),
    ).toEqual(
      { type: 'test/add', payload: [123] },
    );

    // usage
    expect(
      dispatch('test/wait', 'name'),
    ).resolves.toEqual(
      'name',
    );
    expect(
      dispatch({ type: 'test/wait', payload: ['name'] }),
    ).resolves.toEqual(
      'name',
    );

    expect(
      dispatch({ type: 'test/wait' }),
    ).resolves.toBeUndefined();
  });
});
