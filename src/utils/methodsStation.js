import isObject from './isObject';
import error from './error';

/**
 * methodsStation
 * @param {Object} models
 * @returns {Function} Middleware
 */
const methodsStation = models => () => next => action => {
  if (!isObject(action) || typeof action.type !== 'string' || !action.type.includes('/')) {
    throw new Error(error.INVALID_ACTION());
  }
  if (action.type.match(/@\w+\/SET_STATE/g)) {
    const name = action.type.slice(1, -10);
    if (!(name in models) || !isObject(action.partialState)) {
      throw new Error(error.INVALID_ACTION());
    }
  } else {
    const [name, key] = action.type.split('/');
    if (!(name in models) || !(key in models[name].reducers) || !Array.isArray(action.payload)) {
      throw new Error(error.INVALID_ACTION());
    }
  }
  return next(action);
};

export default methodsStation;
