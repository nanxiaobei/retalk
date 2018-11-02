import isAsyncFn from './utils/isAsyncFn';
import error from './utils/error';

/**
 * createMethods
 * @param {Object} store
 * @param {string} name
 * @param {Object} model
 * @returns {Object} Formatted model
 */
const createMethods = (store, name, model) => {
  const { dispatch, getState } = store;
  const { reducers, actions } = model;

  // Reducers
  const newReducers = {};

  const setState = function reducer(nextState) {
    dispatch({ type: `@${name}/SET_STATE`, nextState });
  };

  if (reducers === undefined) {
    newReducers.setState = setState;
  } else {
    Object.keys(reducers).forEach((reducerName) => {
      if (isAsyncFn(reducers[reducerName])) throw new Error(error.ASYNC_REDUCER(name, reducerName));
      if (reducerName in actions) throw new Error(error.METHODS_CONFLICT(name, reducerName));

      newReducers[reducerName] = function reducer(...payload) {
        dispatch({ type: `${name}/${reducerName}`, payload });
      };
    });
  }

  // Actions
  const newActions = {};

  const context = (actionName) => {
    const { [actionName]: self, ...methods } = dispatch[name]; // eslint-disable-line
    return {
      state: getState()[name],
      ...methods,
      ...Object.keys(dispatch).reduce((root, modelName) => {
        if (modelName !== name) {
          root[modelName] = {
            state: getState()[modelName],
            ...dispatch[modelName],
          };
        }
        return root;
      }, {}),
    };
  };
  const loading = () => getState()[name].loading;

  Object.keys(actions).forEach((actionName) => {
    const action = (...args) => actions[actionName].bind(context(actionName))(...args);
    newActions[actionName] = loading()[actionName] === undefined
      ? action
      : async function asyncAction(...args) {
        setState({ loading: { ...loading(), [actionName]: true } });
        const result = await action(...args);
        setState({ loading: { ...loading(), [actionName]: false } });
        return result;
      };
  });

  // bind methods to dispatch
  dispatch[name] = { ...newReducers, ...newActions };
  // return new model
  return { reducers: newReducers, actions: newActions };
};

export default createMethods;
