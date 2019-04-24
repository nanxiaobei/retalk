import {
  createStore as theRealCreateStore,
  combineReducers,
  compose,
  applyMiddleware,
} from 'redux';
import createReducer from './createReducer';
import createActions from './createActions';
import { ERR, isObject, checkModel, createHandler, checkDuplicate } from './utils';

/**
 * Create the Redux store
 *
 * @param {object} models
 * @param {object} options
 * @return {object} Store
 */
const createStore = (models, options = {}) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development';

  const { useDevTools = true, plugins = [] } = options;
  let modelEntries = [];
  let actionNames = [];
  const rootReducers = {};

  if (isEnvDevelopment) {
    // Check params
    if (!isObject(models)) throw new Error(ERR.NOT_OBJECT('models'));
    if (!isObject(options)) throw new Error(ERR.NOT_OBJECT('options'));
    if (typeof useDevTools !== 'undefined' && typeof useDevTools !== 'boolean')
      throw new Error(ERR.NOT_BOOLEAN('options.useDevTools'));
    if (typeof plugins !== 'undefined' && !Array.isArray(plugins))
      throw new Error(ERR.NOT_ARRAY('options.plugins'));

    modelEntries = Object.entries(models);

    // Check model, collect action names for model name check
    modelEntries.forEach(([name, model]) => {
      checkModel(name, model);
      const { actions } = model;
      actionNames = [...actionNames, ...Object.keys(actions)];
    });
    actionNames = [...new Set(actionNames)];

    // Check model name, create reducer
    modelEntries.forEach(([name, { state }]) => {
      if (actionNames.includes(name)) throw new Error(ERR.MODEL_NAME(name));
      rootReducers[name] = createReducer(name, state);
    });
  } else {
    modelEntries = Object.entries(models);

    // Create reducer
    modelEntries.forEach(([name, { state }]) => {
      rootReducers[name] = createReducer(name, state);
    });
  }

  // Create store
  const composeEnhancers =
    useDevTools === true && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const store = theRealCreateStore(
    combineReducers(rootReducers),
    composeEnhancers(applyMiddleware(...plugins)),
  );

  const theRealDispatch = store.dispatch;
  store.dispatch = () => {
    throw new Error(ERR.DISPATCH());
  };
  const { getState, dispatch } = store;

  // Format actions
  const modelsProxy = {};
  modelEntries.forEach(([name]) => {
    modelsProxy[name] = new Proxy({}, createHandler(name, getState, dispatch));
  });
  modelEntries.forEach(([name, model]) => {
    const thisProxy = new Proxy({}, createHandler(name, getState, dispatch, modelsProxy));
    createActions(name, model, getState, dispatch, theRealDispatch, thisProxy);
  });

  // store.addModel
  store.addModel = (name, model) => {
    if (name in rootReducers) return;
    const { state, actions } = model;

    if (isEnvDevelopment) {
      checkModel(name, model);
      actionNames = [...new Set([...actionNames, ...Object.keys(actions)])];
      if (actionNames.includes(name)) throw new Error(ERR.MODEL_NAME(name));
    }

    rootReducers[name] = createReducer(name, state);
    store.replaceReducer(combineReducers(rootReducers));

    modelsProxy[name] = new Proxy({}, createHandler(name, getState, dispatch));
    const thisProxy = new Proxy({}, createHandler(name, getState, dispatch, modelsProxy));
    createActions(name, model, getState, dispatch, theRealDispatch, thisProxy);
  };

  return store;
};

/**
 * Get mapState and mapActions for connect
 *
 * @param {string[]} names
 * @return {function[]} [mapState, mapActions]
 */
const withStore = (...names) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development';

  let mergedState = { loading: {} };
  let mergedActions = {};

  if (isEnvDevelopment) {
    const modelsNum = names.length;
    if (modelsNum === 0) throw new Error(ERR.EMPTY_PARAM());

    let errModalName = false;

    let stateCheckedNum = 0;
    let actionsCheckedNum = 1;

    return [
      (state) => {
        names.forEach((name, index) => {
          const modelState = state[name];

          if (stateCheckedNum < modelsNum) {
            if (typeof name !== 'string' || !(name in state)) errModalName = name;
            if (errModalName !== false) throw new Error(ERR.PARAM());

            if (modelsNum > 1 && index > 0) {
              checkDuplicate(name, 'state', modelState, mergedState);
            }
            stateCheckedNum += 1;
          }

          mergedState = {
            ...mergedState,
            ...modelState,
            ...{ loading: { ...mergedState.loading, ...modelState.loading } },
          };
        });
        return mergedState;
      },
      (dispatch) => {
        names.forEach((name, index) => {
          const modelActions = dispatch[name];

          if (modelsNum > 1 && index > 0 && actionsCheckedNum < modelsNum) {
            checkDuplicate(name, 'action', modelActions, mergedActions);
            actionsCheckedNum += 1;
          }

          mergedActions = { ...mergedActions, ...modelActions };
        });
        return mergedActions;
      },
    ];
  }

  return [
    (state) => {
      names.forEach((name) => {
        const modelState = state[name];
        mergedState = {
          ...mergedState,
          ...modelState,
          ...{ loading: { ...mergedState.loading, ...modelState.loading } },
        };
      });
      return mergedState;
    },
    (dispatch) => {
      names.forEach((name) => {
        const modelActions = dispatch[name];
        mergedActions = { ...mergedActions, ...modelActions };
      });
      return mergedActions;
    },
  ];
};

export { createStore, withStore };
