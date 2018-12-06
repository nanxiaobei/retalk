import isObject from './utils/isObject';
import error from './utils/error';

/**
 * createReducer
 * @param {string} name
 * @param {Object} model
 * @returns {Function} Reducer
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
    throw new Error(
      state === undefined ? error.NO_MODEL_KEY(name, 'state') : error.NOT_OBJECT(name, 'state'),
    );
  }
  if (reducers !== undefined && !isObject(reducers)) {
    throw new Error(error.INVALID_REDUCERS(name));
  }
  if (!isObject(actions)) {
    throw new Error(
      actions === undefined
        ? error.NO_MODEL_KEY(name, 'actions')
        : error.NOT_OBJECT(name, 'actions'),
    );
  }

  return (currentState = state, action) => {
    const [modelName, methodName, setStateLabel] = action.type.split('/');
    if (modelName !== name) return currentState;

    if (setStateLabel === 'SET_STATE') {
      return { ...currentState, ...action.partialState };
    }
    return reducers[methodName](currentState, ...action.payload);
  };
};

export default createReducer;
