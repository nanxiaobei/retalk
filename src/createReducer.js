import isAsyncFn from './utils/isAsyncFn';

/**
 * createReducer
 *
 * @param {string} modelName
 * @param {object} modelState
 * @param {object} modelReducers
 * @param {object} modelActions
 * @return {function} Model reducer
 */
const createReducer = (modelName, modelState, modelReducers, modelActions) => {
  // add `loading` state to model state
  modelState.loading = {};
  Object.keys(modelActions).forEach(actionName => {
    if (isAsyncFn(modelActions[actionName])) {
      modelState.loading[actionName] = false;
    }
  });

  // return module reducer
  return (currentState = modelState, action) => {
    if (action.type === `@${modelName}/SET_STATE`) {
      return ({ ...currentState, ...action.nextState });
    }
    if (modelReducers !== undefined) {
      const reducerKey = action.type.split('/')[1];
      if (typeof modelReducers[reducerKey] === 'function') {
        return modelReducers[reducerKey](currentState, ...action.payload);
      }
      return currentState;
    }
    return currentState;
  };
};

export default createReducer;
