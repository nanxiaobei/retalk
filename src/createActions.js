import { ERR, isAsyncFn } from './utils';

/**
 * Format the actions of a model
 *
 * @param {string} name
 * @param {object} model
 * @param {function} getState
 * @param {function} dispatch
 * @param {function} theRealDispatch
 * @param {object} thisProxy
 */
const createActions = (name, model, getState, dispatch, theRealDispatch, thisProxy) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development';

  const { state, actions } = model;
  const newActions = {};

  const formatAction = (actionName, oldAction) => {
    const setState = function reducer(payload) {
      return theRealDispatch({ type: `${name}/${actionName}`, payload });
    };

    const newAction = function action(...args) {
      thisProxy.setState = setState;
      return oldAction.bind(thisProxy)(...args);
    };

    if (!isAsyncFn(oldAction)) {
      newActions[actionName] = newAction;
    } else {
      state.loading[actionName] = false;
      const setLoading = function reducer(actionName, actionLoading) {
        return theRealDispatch({
          type: `${name}/${actionName}/SET_LOADING`,
          payload: { loading: { ...getState()[name].loading, [actionName]: actionLoading } },
        });
      };
      newActions[actionName] = async function asyncAction(...args) {
        setLoading(actionName, true);
        const result = await newAction(...args);
        setLoading(actionName, false);
        return result;
      };
    }
  };

  if (isEnvDevelopment) {
    const forbiddenNames = ['state', 'setState', ...Object.keys(state)];

    Object.entries(actions).forEach(([actionName, oldAction]) => {
      if (forbiddenNames.includes(actionName)) throw new Error(ERR.ACTION_NAME(name, actionName));
      if (typeof oldAction !== 'function') throw new Error(ERR.ACTION(name, actionName));

      formatAction(actionName, oldAction);
    });
  } else {
    Object.entries(actions).forEach(([actionName, oldAction]) => {
      formatAction(actionName, oldAction);
    });
  }

  dispatch[name] = newActions;
};

export default createActions;
