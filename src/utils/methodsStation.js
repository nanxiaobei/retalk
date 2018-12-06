import isObject from './isObject';
import error from './error';

/**
 * methodsStation
 * @param {Object} models
 * @returns {Function} middleware
 */
const methodsStation = (models) => () => (next) => (action) => {
  if (!isObject(action) || typeof action.type !== 'string') {
    throw new Error(error.INVALID_ACTION());
  }

  const [modelName, methodName, setStateLabel] = action.type.split('/');
  if (!modelName || !methodName) {
    throw new Error(error.INVALID_ACTION());
  }

  if (setStateLabel === 'SET_STATE') {
    // No `reducers` in model
    if (
      !(modelName in models) ||
      !(methodName in models[modelName].actions) ||
      !isObject(action.partialState)
    ) {
      throw new Error(error.INVALID_ACTION());
    }
  } else {
    // Has `reducers` in model
    if (
      !(modelName in models) ||
      !(methodName in models[modelName].reducers) ||
      !Array.isArray(action.payload)
    ) {
      throw new Error(error.INVALID_ACTION());
    }
  }
  return next(action);
};

export default methodsStation;
