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
  const { state, reducers, actions } = model;

  // Reducers
  const newReducers = {};
  const setState = function reducer(partialState) {
    dispatch({ type: `@${name}/SET_STATE`, partialState });
  };
  if (reducers === undefined) {
    newReducers.setState = setState;
  } else {
    Object.entries(reducers).forEach(([reducerName, reducer]) => {
      if (isAsyncFn(reducer)) {
        throw new Error(error.ASYNC_REDUCER(name, reducerName));
      }
      if (reducerName in actions) {
        throw new Error(error.METHODS_CONFLICT(name, reducerName));
      }

      newReducers[reducerName] = function reducer(...payload) {
        dispatch({ type: `${name}/${reducerName}`, payload });
      };
    });
  }

  // Actions
  const newActions = {};
  const getContent = (actionName) => {
    const { [actionName]: self, ...methods } = dispatch[name]; // eslint-disable-line
    return {
      state: getState()[name],
      ...methods,
      ...Object.entries(dispatch).reduce((root, [modelName, modelMethods]) => {
        if (modelName !== name) {
          root[modelName] = {
            state: getState()[modelName],
            ...modelMethods,
          };
        }
        return root;
      }, {}),
    };
  };

  state.loading = {};
  const setLoading = (actionName, loading) => {
    setState({
      loading: { ...getState()[name].loading, [actionName]: loading },
    });
  };
  Object.entries(actions).forEach(([actionName, action]) => {
    const boundAction = (...args) => action.bind(getContent(actionName))(...args);
    if (isAsyncFn(action)) {
      state.loading[actionName] = false;
      newActions[actionName] = async function asyncAction(...args) {
        setLoading(actionName, true);
        const result = await boundAction(...args);
        setLoading(actionName, false);
        return result;
      };
    } else {
      newActions[actionName] = function action(...args) {
        return boundAction(...args);
      };
    }
  });

  dispatch[name] = { ...newReducers, ...newActions };
  return {
    state,
    reducers: newReducers,
    actions: newActions,
  };
};

export default createMethods;
