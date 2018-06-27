import isObject from './isObject';
import error from './error';

/**
 * middleware
 *
 * @param {object} models
 * @return {function} Middleware
 */
const middleware = models => () => next => (actionOrType, ...optionalPayload) => {
  const action = isObject(actionOrType) ? actionOrType : { type: actionOrType, payload: optionalPayload };
  const { type, payload } = action;

  if (typeof type !== 'string' || !type.includes('/')) {
    throw new Error(error.INVALID_ACTION_TYPE(type));
  }

  if (type.match(/@\w+\/SET_STATE/g)) {
    const name = type.slice(1, -10);
    if (!(name in models)) {
      throw new Error(error.INVALID_ACTION_TYPE(type, name));
    }
    if ('nextState' in action && !isObject(action.nextState)) {
      throw new Error(error.INVALID_NEXT_STATE());
    }
    if (!('nextState' in action) && (!Array.isArray(action.payload) || !isObject(action.payload[0]))) {
      throw new Error(error.INVALID_NEXT_STATE());
    }
    return next(action);
  }

  const [name, key] = type.split('/');
  if (!(name in models)) {
    throw new Error(error.INVALID_ACTION_TYPE(type, name));
  }
  const { reducers, actions } = models[name];
  if (!(key in reducers) && !(key in actions)) {
    throw new Error(error.INVALID_ACTION_TYPE(type, name, key));
  }
  if (payload !== undefined && !Array.isArray(payload)) {
    throw new Error(error.INVALID_PAYLOAD());
  }
  if (key in reducers) return next(action);
  return actions[key](...(payload === undefined ? [] : payload));
};

export default middleware;
