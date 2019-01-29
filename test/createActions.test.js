import createActions from '../src/createActions';
import { ERR, createHandler } from '../src/utils';

describe('createActions', () => {
  const getState = () => ({ testModel: { loading: {} }, testModel2: { loading: {} } });
  const dispatch = () => {};
  const theRealDispatch = () => {};
  const modelsProxy = { testModel2: createHandler('testModel2', getState, dispatch) };
  const thisProxy = new Proxy({}, createHandler('testModel', getState, dispatch, modelsProxy));
  it('should throw error if action name is illegal', () => {
    const testModel = {
      state: { loading: {} },
      actions: {
        setState() {
          return this;
        },
      },
    };
    expect(() => {
      createActions('testModel', testModel, getState, dispatch, theRealDispatch, thisProxy);
    }).toThrow(ERR.ACTION_NAME('testModel', 'setState'));
  });
  it('should throw error if action is illegal', () => {
    const testModel = {
      state: { loading: {} },
      actions: {
        add: 123,
      },
    };
    expect(() => {
      createActions('testModel', testModel, getState, dispatch, theRealDispatch, thisProxy);
    }).toThrow(ERR.ACTION('testModel', 'add'));
  });
  it("should have 'this' context in action", () => {
    const testModel = {
      state: { loading: {} },
      actions: {
        add() {
          return this;
        },
        async asyncAdd() {
          return this.state;
        },
      },
    };
    createActions('testModel', testModel, getState, dispatch, theRealDispatch, thisProxy);
    const testActions = dispatch.testModel;
    const thisContext = testActions.add();
    expect(thisContext).toHaveProperty('setState');
    expect(thisContext).toHaveProperty('asyncAdd');
    expect(thisContext).toHaveProperty('testModel2');
    expect(thisContext.testAction).toBeUndefined();
    expect(testActions.asyncAdd()).resolves.toHaveProperty('loading');
  });
});
