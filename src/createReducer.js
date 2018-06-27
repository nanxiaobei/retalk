import verifyModel from './utils/verifyModel';
import isAsyncFn from './utils/isAsyncFn';

/**
 * createReducer
 *
 * @param {string} name
 * @param {object} model
 * @return {function} Reducer
 */
const createReducer = (name, model) => {
  verifyModel(name, model);
  const { state, reducers, actions } = model;

  state.loading = {};
  Object.keys(actions).forEach(actionName => {
    if (isAsyncFn(actions[actionName])) {
      state.loading[actionName] = false;
    }
  });

  return (currentState = state, action) => {
    if (action.type === `@${name}/SET_STATE`) {
      return ({ ...currentState, ...action.nextState });
    }
    const [namespace, reducerName] = action.type.split('/');
    if (namespace !== name) return currentState;
    return reducers[reducerName](currentState, ...action.payload);
  };
};

export default createReducer;
