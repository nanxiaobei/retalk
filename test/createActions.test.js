import createActions from '../src/createActions';
import { ERR, createHandler } from '../src/utils';

beforeEach(() => {
  jest.resetModules();
});
afterEach(() => {
  process.env.NODE_ENV = 'test';
});

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

    process.env.NODE_ENV = 'development';
    expect(() => {
      createActions('testModel', testModel, getState, dispatch, theRealDispatch, thisProxy);
    }).toThrow(ERR.ACTION_NAME('testModel', 'setState'));
  });

  it('should throw error if action is illegal', () => {
    const testModel = {
      state: { loading: {} },
      actions: {
        increment: 123,
      },
    };

    process.env.NODE_ENV = 'development';
    expect(() => {
      createActions('testModel', testModel, getState, dispatch, theRealDispatch, thisProxy);
    }).toThrow(ERR.ACTION('testModel', 'increment'));
  });

  it("should have 'this' context in action", () => {
    const testModel = {
      state: { loading: {}, value: 1 },
      actions: {
        increment() {
          const { value } = this.state;
          this.setState({ value: value + 1 });
          return this;
        },
        async incrementAsync() {
          return this.state;
        },
      },
    };

    const runSharedTests = () => {
      createActions('testModel', testModel, getState, dispatch, theRealDispatch, thisProxy);
      const testActions = dispatch.testModel;
      const thisContext = testActions.increment();
      expect(thisContext).toHaveProperty('incrementAsync');
      expect(thisContext).toHaveProperty('testModel2');
      expect(thisContext.testAction).toBeUndefined();
      expect(testActions.incrementAsync()).resolves.toHaveProperty('loading');
    };

    process.env.NODE_ENV = 'development';
    runSharedTests();

    process.env.NODE_ENV = 'production';
    runSharedTests();
  });
});
