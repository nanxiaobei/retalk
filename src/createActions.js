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
      newActions[actionName] = async function asyncAction(...args) {
        setState({ loading: { ...getState()[name].loading, [actionName]: true } });
        const result = await newAction(...args);
        setState({ loading: { ...getState()[name].loading, [actionName]: false } });
        return result;
      };
    }
  });

  dispatch[name] = newActions;
};

export default createActions;
