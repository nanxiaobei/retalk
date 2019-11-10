import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { connect } from 'react-redux';

export let setStore;
export let withStore;
export { Provider } from 'react-redux';

/**
 * Utils
 */
const ERR = {
  NOT_STRING: (name) => `'${name}' must be a string`,
  NOT_ARRAY: (name) => `'${name}' must be an array`,
  NOT_OBJECT: (name) => `'${name}' must be an object`,
  NOT_CLASS: (name) => `'${name}' must be a class`,

  NO_DISPATCH: () => "Please don't use 'dispatch' directly in Retalk",

  NOT_EXIST: (name) => `'${name}' Model dose not exist`,
};

const isObject = (obj) => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

/**
 * Add a model, create the model's reducer
 *
 * @param {string} name
 * @param {class} Model
 * @param {object} models
 * @param {object} reducers
 */
const createReducer = (name, Model, models, reducers) => {
  const model = new Model();
  models[name] = model;
  reducers[name] = (currentState = model.state || null, action) => {
    const [modelName] = action.type.split('/');
    if (modelName === name) return { ...currentState, ...action.payload };
    return currentState;
  };
};

/**
 * Format a model's actions
 *
 * @param {string} name
 * @param {class} Model
 * @param {object} models
 * @param {function} newDispatch
 * @param {function} realDispatch
 */
const createActions = (name, Model, models, newDispatch, realDispatch) => {
  const model__proto__ = Model.prototype;
  model__proto__.models = models;
  const model = models[name];

  newDispatch[name] = {};
  const setStateMap = {};

  Object.getOwnPropertyNames(model__proto__).forEach((actionName) => {
    if (actionName === 'constructor' || actionName === 'models') return;

    setStateMap[actionName] = function reducer(payload) {
      model.state = { ...model.state, ...payload };
      return realDispatch({ type: `${name}/${actionName}`, payload });
    };
    const setLoading = (type, loading) => {
      model__proto__[actionName].loading = loading;
      return realDispatch({
        type: `${name}/${actionName}/${type}_LOADING`,
        payload: { loading },
      });
    };

    const oldAction = model__proto__[actionName].bind(model);
    const newAction = function action(...args) {
      model__proto__.setState = setStateMap[actionName];
      const result = oldAction(...args);
      if (!result || typeof result.then !== 'function') {
        delete model__proto__.setState;
        return result;
      }
      return new Promise((resolve, reject) => {
        setLoading('START', true);
        result
          .then(resolve)
          .catch(reject)
          .finally(() => {
            setLoading('STOP', false);
            delete model__proto__.setState;
          });
      });
    };

    newDispatch[name][actionName] = newAction;
    model__proto__[actionName] = newAction;
  });
};

/**
 * Initialize all models
 *
 * @param {object} initialModels
 * @param {array} middleware
 * @return {object} Store
 */
setStore = (initialModels = {}, middleware = []) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';

  if (__DEV__) {
    if (!isObject(initialModels)) throw new Error(ERR.NOT_OBJECT('initialModels'));
    if (!Array.isArray(middleware)) throw new Error(ERR.NOT_ARRAY('middleware'));
  }

  const models = {};
  const reducers = {};
  const initialModelList = Object.entries(initialModels);

  // Reducers
  if (__DEV__) {
    initialModelList.forEach(([name, Model]) => {
      if (typeof Model !== 'function') throw new Error(ERR.NOT_CLASS('Model'));
      createReducer(name, Model, models, reducers);
    });
  } else {
    initialModelList.forEach(([name, Model]) => {
      createReducer(name, Model, models, reducers);
    });
  }

  // Store
  const __COMPOSE__ = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  const newCompose = __DEV__ && __COMPOSE__ ? __COMPOSE__ : compose;

  const store = createStore(combineReducers(reducers), newCompose(applyMiddleware(...middleware)));
  const realDispatch = store.dispatch;
  const newDispatch = () => {
    throw new Error(ERR.NO_DISPATCH());
  };
  store.dispatch = newDispatch;

  // Actions
  initialModelList.forEach(([name, Model]) => {
    createActions(name, Model, models, newDispatch, realDispatch);
  });

  // store.add
  store.add = (initialModelsToAdd) => {
    if (__DEV__) {
      if (!isObject(initialModelsToAdd)) throw new Error(ERR.NOT_OBJECT('initialModels'));

      Object.entries(initialModelsToAdd).forEach(([name, Model]) => {
        if (name in models) return;
        if (typeof Model !== 'function') throw new Error(ERR.NOT_CLASS('Model'));
        createReducer(name, Model, models, reducers);
        store.replaceReducer(combineReducers(reducers));
        createActions(name, Model, models, newDispatch, realDispatch);
      });
    } else {
      Object.entries(initialModelsToAdd).forEach(([name, Model]) => {
        if (name in models) return;
        createReducer(name, Model, models, reducers);
        store.replaceReducer(combineReducers(reducers));
        createActions(name, Model, models, newDispatch, realDispatch);
      });
    }
  };

  return store;
};

/**
 * Eject some models to a component
 *
 * @param {string[]} names
 * @return {function} Higher-order component
 */
withStore = (...names) => {
  if (typeof names[0] !== 'string') {
    return connect(...names);
  }

  const __DEV__ = process.env.NODE_ENV !== 'production';
  const mapStore = (store) => names.reduce((merged, name) => ({ ...merged, ...store[name] }), {});

  let mapState;
  if (__DEV__) {
    mapState = (state) =>
      names.reduce((merged, name) => {
        if (typeof name !== 'string') throw new Error(ERR.NOT_STRING('name'));
        const partState = state[name];
        if (typeof partState === 'undefined') throw new Error(ERR.NOT_EXIST(name));
        return { ...merged, ...partState };
      }, {});
  } else {
    mapState = mapStore;
  }
  return connect(mapState, mapStore);
};
