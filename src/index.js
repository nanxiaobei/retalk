import {
  createStore as theRealCreateStore,
  combineReducers,
  compose,
  applyMiddleware,
} from 'redux';
import createReducer from './createReducer';
import createMethods from './createMethods';
import methodsStation from './utils/methodsStation';
import isObject from './utils/isObject';
import error from './utils/error';

/**
 * createStore
 * @param {Object} models
 * @param {Object} options
 * @returns {Object} Store or Promise
 */
const createStore = (models, options = {}) => {
  if (!isObject(models)) {
    throw new Error(error.NOT_OBJECT('models'));
  }
  if (!isObject(options)) {
    throw new Error(error.NOT_OBJECT('options'));
  }

  const { useDevTools = false, plugins = [] } = options;
  if (typeof useDevTools !== 'undefined' && typeof useDevTools !== 'boolean') {
    throw new Error(error.NOT_BOOLEAN('options.useDevTools'));
  }
  if (typeof plugins !== 'undefined' && !Array.isArray(plugins)) {
    throw new Error(error.NOT_ARRAY('options.plugins'));
  }

  const asyncImport = Object.values(models).some(
    model => typeof model === 'function',
  );
  const rootReducers = {};

  const getStore = () => {
    const composeEnhancers =
      useDevTools === true && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        : compose;

    const store = theRealCreateStore(
      combineReducers(rootReducers),
      composeEnhancers(applyMiddleware(methodsStation(models), ...plugins)),
    );

    Object.entries(models).forEach(([name, model]) => {
      createMethods(store, name, model);
    });
    store.addModel = (name, model) => {
      if (name in rootReducers) return;
      rootReducers[name] = createReducer(name, model);
      store.replaceReducer(combineReducers(rootReducers));
      createMethods(store, name, model);
    };
    return store;
  };

  // Static import
  if (!asyncImport) {
    Object.entries(models).forEach(([name, model]) => {
      rootReducers[name] = createReducer(name, model);
    });
    return getStore();
  }

  // Dynamic import
  const infoMap = [];
  return Promise.all(
    Object.entries(models).map(([name, model], index) => {
      infoMap[index] = { name };
      if (typeof model === 'function') {
        infoMap[index].async = true;
        model = model(); // eslint-disable-line
      }
      return model;
    }),
  ).then(modelList => {
    modelList.forEach((model, index) => {
      const { async, name } = infoMap[index];
      if (async) {
        if (!isObject(model) || !isObject(model.default)) {
          throw new Error(error.INVALID_IMPORTER(name));
        }
        model = model.default; // eslint-disable-line
        models[name] = model;
      }
      rootReducers[name] = createReducer(name, model);
    });
    return getStore();
  });
};

/**
 * withStore
 * @param {...string} names - 'modelA', 'modelB', ...
 * @returns {Array} [mapState, mapMethods]
 */
const withStore = (...names) => {
  if (names.length === 0) {
    throw new Error(error.INVALID_MODEL_NAME());
  }
  return [
    state => {
      let mergedState = { loading: {} };
      names.forEach(name => {
        if (typeof name !== 'string') {
          throw new Error(error.INVALID_MODEL_NAME());
        }
        const modelState = state[name];
        mergedState = {
          ...mergedState,
          ...modelState,
          ...{ loading: { ...mergedState.loading, ...modelState.loading } },
        };
      });
      return mergedState;
    },
    dispatch => {
      let mergedMethods = {};
      names.forEach(name => {
        const modelMethods = dispatch[name];
        mergedMethods = { ...mergedMethods, ...modelMethods };
      });
      return mergedMethods;
    },
  ];
};

/**
 * exports
 */
export { createStore, withStore };
