import { ERR, isAsyncFn } from './utils';

/**
 * Format model's actions
 *
 * @param {string} name
 * @param {object} model
 * @param {function} getState
 * @param {function} dispatch
 * @param {function} theRealDispatch
 * @param {object} thisProxy
 */
const createActions = (name, model, getState, dispatch, theRealDispatch, thisProxy) => {
  const { state, actions } = model;
  const forbiddenNames = ['state', 'setState', ...Object.keys(state)];

  const newActions = {};
  Object.entries(actions).forEach(([actionName, oldAction]) => {
    if (forbiddenNames.includes(actionName)) throw new Error(ERR.ACTION_NAME(name, actionName));
    if (typeof oldAction !== 'function') throw new Error(ERR.ACTION(name, actionName));

    const setState = function reducer(partialState) {
      theRealDispatch({ type: `${name}/${actionName}`, partialState });
    };

    const newAction = function action(...args) {
      thisProxy.setState = setState;
      return oldAction.bind(thisProxy)(...args);
    };

    if (!isAsyncFn(oldAction)) {
      newActions[actionName] = newAction;
    } else {
      state.loading[actionName] = false;
      const setLoading = (actionName, actionLoading) => {
        theRealDispatch({
          type: `${name}/${actionName}/SET_LOADING`,
          partialState: { loading: { ...getState()[name].loading, [actionName]: actionLoading } },
        });
      };
      newActions[actionName] = async function asyncAction(...args) {
        setLoading(actionName, true);
        const result = await newAction(...args);
        setLoading(actionName, false);
        return result;
      };
    }
  });

  dispatch[name] = newActions;
};

export default createActions;
