import isObject from './isObject';

/**
 * verifyParam
 * @param {string} modelName - Model's name
 * @param {any} model - The model to inspect
 */
const verifyParam = (modelName, model) => {
  if (typeof modelName !== 'string') {
    throw new Error('Expected the `modelName` to be a string');
  }
  if (!isObject(model)) {
    throw new Error(`Expected the \`${modelName}\` model to be an object`);
  }
  const { state: modelState, actions: modelActions } = model;
  if (!isObject(modelState)) {
    throw new Error(modelState === undefined
      ? `Expected to have \`state\` key in the \`${modelName}\` model`
      : `Expected \`state\` in in the \`${modelName}\` model to be an object`);
  }
  if (!isObject(modelActions)) {
    throw new Error(modelActions === undefined
      ? `Expected to have \`actions\` key in the \`${modelName}\` model`
      : `Expected \`actions\` in in the \`${modelName}\` model to be an object`);
  }
};

export default verifyParam;
