import isAsyncFn from './utils/isAsyncFn';

/**
 * createReducer
 *
 * @param {string} modelName
 * @param {object} modelState
 * @param {object} modelActions
 * @return {function} Model reducer
 */
const createReducer = (modelName, modelState, modelActions) => {
  // add `loading` state to model state
  modelState.loading = {};
  Object.keys(modelActions).forEach(actionName => {
    if (isAsyncFn(modelActions[actionName])) {
      modelState.loading[actionName] = false;
    }
  });

  // return module reducer
  return (currentState = modelState, action) => {
    if (action !== undefined && action.type === modelName) {
      return ({ ...currentState, ...action.nextState });
    }
    return currentState;
  };
};

export default createReducer;
