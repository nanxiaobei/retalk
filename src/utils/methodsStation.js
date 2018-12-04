import isObject from './isObject';
import error from './error';

/**
 * methodsStation
 * @param {Object} models
 * @returns {Function} middleware
 */
const methodsStation = (models) => () => (next) => (action) => {
  if (!isObject(action) || typeof action.type !== 'string' || !action.type.includes('/')) {
    throw new Error(error.INVALID_ACTION());
  }
  const found = action.type.match(/^@(\w+)\/SET_STATE/);
  if (found) {
    // No `reducers` in model
    const name = found[1];
    if (!(name in models) || !isObject(action.partialState)) {
      throw new Error(error.INVALID_ACTION());
    }
  } else {
    // Has `reducers` in model
    const [name, key] = action.type.split('/');
    if (!(name in models) || !(key in models[name].reducers) || !Array.isArray(action.payload)) {
      throw new Error(error.INVALID_ACTION());
    }
  }
  return next(action);
};

export default methodsStation;
