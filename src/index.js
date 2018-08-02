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
 *
 * @param {object} models - { model: { state, actions } } or { model: () => import() }
 * @return {object} Store or Promise
 */
const createStore = models => {
  if (!isObject(models)) {
    throw new Error(error.NOT_OBJECT('models'));
  }

  const asyncImport = Object.values(models).some(model => typeof model === 'function');
  const rootReducers = {};

  const getStore = () => {
    const store = theRealCreateStore(
      combineReducers(rootReducers),
      compose(applyMiddleware(methodsStation(models))),
    );
    Object.keys(models).forEach(name => {
      const model = models[name];
      models[name] = createMethods(store, name, model);
    });
    store.addModel = (name, model) => {
      if (name in rootReducers) return;
      rootReducers[name] = createReducer(name, model);
      store.replaceReducer(combineReducers(rootReducers));
      models[name] = createMethods(store, name, model);
    };
    return store;
  };

  // static import
  if (!asyncImport) {
    Object.keys(models).forEach(name => {
      const model = models[name];
      rootReducers[name] = createReducer(name, model);
    });
    return getStore();
  }

  // dynamic import
  const modelMap = {};
  return Promise.all(Object.keys(models).map((name, index) => {
    modelMap[index] = { name };
    const model = models[name];
    if (typeof model === 'function') {
      modelMap[index].async = true;
      return model();
    }
    modelMap[index].async = false;
    return model;
  })).then(modelList => {
    modelList.forEach((model, index) => {
      const { name, async } = modelMap[index];
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
 *
 * @param {...string} names - ['modelA', 'modelB', ...]
 * @return {array} [mapState, mapMethods]
 */
const withStore = (...names) => {
  if (names.length === 0) {
    throw new Error(error.INVALID_MODEL_NAME());
  }
  return [
    state => Object.assign({}, ...names.map(name => {
      if (typeof name !== 'string') {
        throw new Error(error.INVALID_MODEL_NAME());
      }
      return state && state[name];
    })),
    dispatch => Object.assign({}, ...names.map(name => dispatch && dispatch[name])),
  ];
};

/**
 * exports
 */
export {
  createStore,
  withStore,
};
