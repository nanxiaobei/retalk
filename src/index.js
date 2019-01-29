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
  // Check params
  if (!isObject(models)) throw new Error(ERR.NOT_OBJECT('models'));
  if (!isObject(options)) throw new Error(ERR.NOT_OBJECT('options'));
  const { useDevTools = false, plugins = [] } = options;
  if (typeof useDevTools !== 'undefined' && typeof useDevTools !== 'boolean')
    throw new Error(ERR.NOT_BOOLEAN('options.useDevTools'));

  if (typeof plugins !== 'undefined' && !Array.isArray(plugins))
    throw new Error(ERR.NOT_ARRAY('options.plugins'));

  const modelEntries = Object.entries(models);

  // Check model, get action names
  let actionNames = [];
  modelEntries.forEach(([name, model]) => {
    checkModel(name, model);
    actionNames = [...actionNames, ...Object.keys(model.actions)];
  });
  actionNames = [...new Set(actionNames)];

  // Check model name, create reducer
  const rootReducers = {};
  modelEntries.forEach(([name, model]) => {
    if (actionNames.includes(name)) throw new Error(ERR.MODEL_NAME(name));
    rootReducers[name] = createReducer(name, model.state);
  });

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

    checkModel(name, model);
    actionNames = [...new Set([...actionNames, ...Object.keys(model.actions)])];

    if (actionNames.includes(name)) throw new Error(ERR.MODEL_NAME(name));
    rootReducers[name] = createReducer(name, model.state);

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
  const namesLength = names.length;
  if (namesLength === 0) throw new Error(ERR.WITH_STORE());

  let stateCount = 0;
  let actionsCount = 0;

  let mergedState = { loading: {} };
  let mergedActions = {};

  return [
    (state) => {
      names.forEach((name) => {
        const modelState = state[name];

        if (stateCount < namesLength) {
          if (typeof name !== 'string' || !(name in state)) throw new Error(ERR.WITH_STORE());
          if (namesLength > 1) {
            checkDuplicate(name, 'state', modelState, mergedState);
          }
          stateCount += 1;
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
      names.forEach((name) => {
        const modelActions = dispatch[name];

        if (namesLength > 1 && actionsCount < namesLength) {
          checkDuplicate(name, 'action', modelActions, mergedActions);
          actionsCount += 1;
        }

        mergedActions = { ...mergedActions, ...modelActions };
      });
      return mergedActions;
    },
  ];
};

export { createStore, withStore };
