import isObject from './utils/isObject';
import isAsyncFn from './utils/isAsyncFn';
import error from './utils/error';

/**
 * createMethods
 *
 * @param {object} store
 * @param {string} name
 * @param {object} model
 * @return {object} Formatted model
 */
const createMethods = (store, name, model) => {
  const { dispatch, getState } = store;
  const { reducers, actions } = model;

  // Reducers
  const newReducers = {};

  const setState = function reducer(namespace, nextState) {
    if (isObject(namespace) && nextState === undefined) {
      nextState = namespace; // eslint-disable-line
      namespace = name; // eslint-disable-line
    }
    dispatch({ type: `@${namespace}/SET_STATE`, nextState });
  };

  if (reducers === undefined) {
    newReducers.setState = setState;
  } else {
    Object.keys(reducers).forEach(reducerName => {
      if (isAsyncFn(reducers[reducerName])) throw new Error(error.ASYNC_REDUCER(name, reducerName));
      if (reducerName in actions) throw new Error(error.METHODS_CONFLICT(name, reducerName));

      newReducers[reducerName] = function reducer(...payload) {
        dispatch({ type: `${name}/${reducerName}`, payload });
      };
    });
  }

  // Actions
  const newActions = {};

  const context = actionName => {
    const { [actionName]: self, ...otherMethods } = dispatch[name]; // eslint-disable-line
    return {
      state: getState()[name],
      ...otherMethods,
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

  Object.keys(actions).forEach(actionName => {
    const action = (...args) => actions[actionName].bind(context(actionName))(...args);
    newActions[actionName] = loading()[actionName] === undefined
      ? action
      : async function asyncAction(...args) {
        setState({ loading: { ...loading(), [actionName]: true } });
        const resolve = await action(...args);
        setState({ loading: { ...loading(), [actionName]: false } });
        return resolve;
      };
  });

  // bind methods to dispatch
  dispatch[name] = { ...newReducers, ...newActions };
  // return new model
  return { reducers: newReducers, actions: newActions };
};

export default createMethods;
