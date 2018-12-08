import isAsyncFn from './utils/isAsyncFn';
import error from './utils/error';

/**
 * createMethods
 * @param {Object} store
 * @param {string} name
 * @param {Object} model
 */
const createMethods = (store, name, model) => {
  const { dispatch, getState } = store;
  const { state, reducers, actions } = model;

  // Reducers
  // ------------------------------------------------------------

  const newReducerCreators = {};

  const setStateCreator = (actionName) =>
    function reducer(partialState) {
      dispatch({ type: `${name}/${actionName}/SET_STATE`, partialState });
    };

  if (reducers === undefined) {
    // No `reducers` in model
    newReducerCreators.setState = setStateCreator;
  } else {
    // Has `reducers` in model
    Object.entries(reducers).forEach(([reducerName, reducer]) => {
      if (isAsyncFn(reducer)) {
        throw new Error(error.ASYNC_REDUCER(name, reducerName));
      }
      if (reducerName in actions) {
        throw new Error(error.METHODS_CONFLICT(name, reducerName));
      }

      newReducerCreators[reducerName] = () =>
        function reducer(...payload) {
          dispatch({ type: `${name}/${reducerName}`, payload });
        };
    });
  }

  // Actions
  // ------------------------------------------------------------

  const newActions = {};

  // Get action's `this` context
  let _this = null;
  const getThis = (actionName) => {
    if (!_this) {
      // actions
      _this = dispatch[name];
      // reducers
      Object.entries(newReducerCreators).forEach(([reducerName, newReducerCreator]) => {
        _this[reducerName] = newReducerCreator(actionName);
      });
      // models' actions
      Object.entries(dispatch).forEach(([modelName, modelActions]) => {
        if (modelName !== name) _this[modelName] = modelActions;
      });
    }
    // state
    _this.state = getState()[name];
    // models' state
    Object.keys(dispatch).forEach((modelName) => {
      if (modelName !== name) _this[modelName].state = getState()[modelName];
    });

    return _this;
  };

  // Add `loading` state
  state.loading = {};

  Object.entries(actions).forEach(([actionName, oldAction]) => {
    // Used to set `loading` state
    const setLoading = (actionName, actionLoadingState) => {
      setStateCreator(actionName)({
        loading: { ...getState()[name].loading, [actionName]: actionLoadingState },
      });
    };

    const newAction = function action(...args) {
      return oldAction.bind(getThis(actionName))(...args);
    };

    if (!isAsyncFn(oldAction)) {
      // Sync action
      newActions[actionName] = newAction;
    } else {
      // Async action
      state.loading[actionName] = false;

      newActions[actionName] = async function asyncAction(...args) {
        setLoading(actionName, true);
        const result = await newAction(...args);
        setLoading(actionName, false);
        return result;
      };
    }
  });

  // Assign actions to `dispatch`
  dispatch[name] = newActions;
};

export default createMethods;
