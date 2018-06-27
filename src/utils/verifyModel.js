import isObject from './isObject';
import error from './error';

/**
 * verifyModel
 *
 * @param {any} name
 * @param {any} model
 */
const verifyModel = (name, model) => {
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
};

export default verifyModel;
