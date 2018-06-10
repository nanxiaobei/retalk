import isObject from './isObject';

/**
 * verifyParam
 * @param {any} model - The model to inspect
 */
const verifyParam = model => {
  if (!isObject(model)) {
    throw new Error(`Expected model to be an object`);
  }
  const { state: modelState, actions: modelActions } = model;
  if (!isObject(modelState)) {
    throw new Error(modelState === undefined
      ? 'Expected to have `state` key in a model'
      : 'Expected `state` in a model to be an object',
    );
  }
  if (!isObject(modelActions)) {
    throw new Error(modelActions === undefined
      ? 'Expected to have `actions` key in a model'
      : 'Expected `actions` in a model to be an object',
    );
  }
};

export default verifyParam;
