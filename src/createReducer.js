/**
 * Create model's reducer
 *
 * @param {string} name
 * @param {object} state
 * @return {function} Reducer
 */
const createReducer = (name, state) => {
  state.loading = {};
  return (currentState = state, action) => {
    const [modelName] = action.type.split('/');
    if (modelName !== name) return currentState;
    return { ...currentState, ...action.partialState };
  };
};

export default createReducer;
