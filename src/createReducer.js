/**
 * Create the reducer for a model
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
    return { ...currentState, ...action.payload };
  };
};

export default createReducer;
