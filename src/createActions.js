/**
 * createActions
 *
 * @param {object} store
 * @param {object} rootActions
 * @param {string} modelName
 * @param {object} modelActions
 * @return {object} Formatted model actions
 */
const createActions = (store, rootActions, modelName, modelActions) => {
  const { theRealDispatch, getState } = store;
  // define model setState
  const setState = (type, nextState) => {
    if (typeof type === 'object' && nextState === undefined) {
      nextState = type; // eslint-disable-line
      type = modelName; // eslint-disable-line
    }
    theRealDispatch({ type, nextState });
  };

  // used for get `loading` state real time
  const loadingState = () => getState()[modelName].loading;
  // used for create context object
  const context = () => ({
    setState,
    state: getState()[modelName],
    ...rootActions[modelName],
    ...Object.keys(rootActions).reduce((obj, moduleName) => {
      obj[moduleName] = {
        state: getState()[moduleName],
        ...rootActions[moduleName],
      };
      return obj;
    }, {}),
  });

  const formattedActions = {};
  // format model actions
  Object.keys(modelActions).forEach(actionName => {
    // if action name is renamed with model name, throw error
    if (Object.keys(rootActions).includes(actionName)) {
      throw new Error(
        `Action name and model name must not be renamed! 
        Please modify the name of \`${actionName}()\` action in \`${modelName}\` model`,
      );
    }

    // bind context on model action
    const actionWithContext = (...args) => modelActions[actionName].bind(context())(...args);

    // if action is async, handle the `loading` state
    formattedActions[actionName] = loadingState()[actionName] === undefined
      ? actionWithContext
      : async (...args) => {
        setState({ loading: { ...loadingState(), [actionName]: true } });
        const actionResponse = await actionWithContext(...args);
        setState({ loading: { ...loadingState(), [actionName]: false } });
        return actionResponse;
      };
  });

  return formattedActions;
};

export default createActions;
