import isAsyncFn from './utils/isAsyncFn';
import isObject from './utils/isObject';
import error from './utils/error';

/**
 * createReducer
 * @param {string} name
 * @param {object} model
 * @return {function} Reducer
 */
const createReducer = (name, model) => {
  if (typeof name !== 'string') {
    throw new Error(error.NOT_STRING('name'));
  }
  if (!isObject(model)) {
    throw new Error(error.NOT_OBJECT('model'));
  }
  const { state, reducers, actions } = model;
  if (!isObject(state)) {
    throw new Error(state === undefined
      ? error.NO_MODEL_KEY(name, 'state')
      : error.NOT_OBJECT(name, 'state'));
  }
  if (reducers !== undefined && !isObject(reducers)) {
    throw new Error(error.INVALID_REDUCERS(name));
  }
  if (!isObject(actions)) {
    throw new Error(actions === undefined
      ? error.NO_MODEL_KEY(name, 'actions')
      : error.NOT_OBJECT(name, 'actions'));
  }

  state.loading = {};
  Object.keys(actions).forEach((actionName) => {
    if (isAsyncFn(actions[actionName])) {
      state.loading[actionName] = false;
    }
  });

  return (currentState = state, action) => {
    if (action.type === `@${name}/SET_STATE`) {
      return ({ ...currentState, ...action.nextState });
    }
    const [namespace, reducerName] = action.type.split('/');
    if (namespace !== name) return currentState;
    return reducers[reducerName](currentState, ...action.payload);
  };
};

export default createReducer;
