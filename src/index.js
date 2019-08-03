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
 * Create the store
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
    // Check the arguments
    if (!isObject(models)) throw new Error(ERR.NOT_OBJECT('models'));
    if (!isObject(options)) throw new Error(ERR.NOT_OBJECT('options'));
    if (typeof useDevTools !== 'undefined' && typeof useDevTools !== 'boolean')
      throw new Error(ERR.NOT_BOOLEAN('options.useDevTools'));
    if (typeof plugins !== 'undefined' && !Array.isArray(plugins))
      throw new Error(ERR.NOT_ARRAY('options.plugins'));

    modelEntries = Object.entries(models);

    // Check the models, collect the names of actions in models
    modelEntries.forEach(([name, model]) => {
      checkModel(name, model);
      const { actions } = model;
      actionNames = [...actionNames, ...Object.keys(actions)];
    });
    actionNames = [...new Set(actionNames)];

    // Check the names of models, create the reducers for models
    modelEntries.forEach(([name, { state }]) => {
      if (actionNames.includes(name)) throw new Error(ERR.MODEL_NAME(name));
      rootReducers[name] = createReducer(name, state);
    });
  } else {
    modelEntries = Object.entries(models);

    // Create the reducers for models
    modelEntries.forEach(([name, { state }]) => {
      rootReducers[name] = createReducer(name, state);
    });
  }

  // Create the Redux store
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

  // Format the actions of models
  const modelsProxy = {};
  modelEntries.forEach(([name]) => {
    modelsProxy[name] = new Proxy({}, createHandler(name, getState, dispatch));
  });
  modelEntries.forEach(([name, model]) => {
    const thisProxy = new Proxy({}, createHandler(name, getState, dispatch, modelsProxy));
    createActions(name, model, getState, dispatch, theRealDispatch, thisProxy);
  });

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
 * Create the mapState and mapActions
 *
 * @param {string[]} names
 * @return {function[]} [mapState, mapActions]
 */
const withStore = (...names) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development';

  let allState = { loading: {} };
  let allActions = {};

  if (isEnvDevelopment) {
    if (names.length === 0) throw new Error(ERR.EMPTY_PARAM());

    let stateChecked = false;
    let actionsChecked = false;

    return [
      (state) => {
        names.forEach((name, index) => {
          const partState = state[name];

          if (!stateChecked) {
            if (typeof name !== 'string' || !(name in state)) throw new Error(ERR.PARAM());
            if (index > 0) checkDuplicate(name, 'state', partState, allState);
          }

          allState = {
            ...allState,
            ...partState,
            ...{ loading: { ...allState.loading, ...partState.loading } },
          };
        });
        if (!stateChecked) stateChecked = true;

        return allState;
      },
      (dispatch) => {
        names.forEach((name, index) => {
          const partActions = dispatch[name];

          if (!actionsChecked) {
            if (index > 0) checkDuplicate(name, 'action', partActions, allActions);
          }

          allActions = { ...allActions, ...partActions };
        });
        if (!actionsChecked) actionsChecked = true;

        return allActions;
      },
    ];
  }

  return [
    (state) => {
      names.forEach((name) => {
        const partState = state[name];
        allState = {
          ...allState,
          ...partState,
          ...{ loading: { ...allState.loading, ...partState.loading } },
        };
      });
      return allState;
    },
    (dispatch) => {
      names.forEach((name) => {
        const partActions = dispatch[name];
        allActions = { ...allActions, ...partActions };
      });
      return allActions;
    },
  ];
};

export { createStore, withStore };
