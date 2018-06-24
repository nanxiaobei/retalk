import isAsyncFn from './utils/isAsyncFn';

/**
 * createActions
 *
 * @param {object} store
 * @param {object} rootReducers
 * @param {object} rootActions
 * @param {string} modelName
 * @return {object} Formatted model actions
 */
const createActions = (store, rootReducers, rootActions, modelName) => {
  const { theRealDispatch, getState } = store;
  const modelReducers = rootReducers[modelName];
  const modelActions = rootActions[modelName];

  const modelReducersInContext = {};

  // define model `setState`
  const setState = function reducer(modelNameInType, nextState) {
    if (typeof modelNameInType === 'object' && nextState === undefined) {
      nextState = modelNameInType; // eslint-disable-line
      modelNameInType = modelName; // eslint-disable-line
    }
    theRealDispatch({ type: `@${modelNameInType}/SET_STATE`, nextState });
  };

  // if `reducers` key exists, add reducers to context
  if (modelReducers === undefined) {
    modelReducersInContext.setState = setState;
  } else {
    Object.keys(modelReducers).forEach(reducerName => {
      // if reducer is async function, throw error
      if (isAsyncFn(modelReducers[reducerName])) {
        throw new Error(
          `Reducer can not be async function! Please modify the \`${reducerName}()\` reducer in \`${modelName}\` model`, // eslint-disable-line
        );
      }
      // if reducer name is renamed with model name, throw error
      if (Object.keys(rootActions).includes(reducerName)) {
        throw new Error(
          `Reducer name and model name can not be duplicated! Please modify the \`${reducerName}()\` reducer's name in \`${modelName}\` model`, // eslint-disable-line
        );
      }
      // if reducer name is renamed with action name, throw error
      if (Object.keys(modelActions).includes(reducerName)) {
        throw new Error(
          `Reducer name and action name can not be duplicated! Please modify the \`${reducerName}()\` reducer's name in \`${modelName}\` model`, // eslint-disable-line
        );
      }

      modelReducersInContext[reducerName] = function reducer(...payload) {
        theRealDispatch({ type: `${modelName}/${reducerName}`, payload });
      };
    });
  }

  // used for get `loading` state real time
  const loadingState = () => getState()[modelName].loading;

  // used for create context object
  const context = actionName => {
    const { [actionName]: self, ...modelActionsInContext } = rootActions[modelName]; // eslint-disable-line
    return {
      state: getState()[modelName],
      ...modelReducersInContext,
      ...modelActionsInContext,
      ...Object.keys(rootActions).reduce((root, moduleName) => {
        if (moduleName !== modelName) {
          root[moduleName] = {
            state: getState()[moduleName],
            ...rootActions[moduleName],
          };
        }
        return root;
      }, {}),
    };
  };

  const modelActionsWithContext = {};
  // format model actions
  Object.keys(modelActions).forEach(actionName => {
    // if action name is renamed with model name, throw error
    if (Object.keys(rootActions).includes(actionName)) {
      throw new Error(
        `Action name and model name can not be duplicated! Please modify the \`${actionName}()\` action's name in \`${modelName}\` model`, // eslint-disable-line
      );
    }

    // bind context to action
    const action = (...args) => modelActions[actionName].bind(context(actionName))(...args);
    // if action is async, handle the `loading` state
    modelActionsWithContext[actionName] = loadingState()[actionName] === undefined
      ? action
      : async function asyncAction(...args) {
        setState({ loading: { ...loadingState(), [actionName]: true } });
        const actionResponse = await action(...args);
        setState({ loading: { ...loadingState(), [actionName]: false } });
        return actionResponse;
      };
  });

  return {
    reducers: modelReducersInContext,
    actions: modelActionsWithContext,
  };
};

export default createActions;
