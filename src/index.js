import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { connect } from 'react-redux';

export let setStore;
export let withStore;
export { Provider, batch } from 'react-redux';

/**
 * Utils
 */
const ERR = {
  NOT_STRING: (name) => `'${name}' must be a string`,
  NOT_ARRAY: (name) => `'${name}' must be an array`,
  NOT_OBJECT: (name) => `'${name}' must be an object`,
  NOT_CLASS: (name) => `'${name}' must be a class`,

  NO_SET_STATE: (name) => `${name}.setState() is not allowed outside of ${name} model`,
  NO_DISPATCH: () => "Please don't use 'dispatch' directly in Retalk",
  NOT_EXIST: (name) => `'${name}' Model dose not exist`,
};

const isObject = (obj) => typeof obj === 'object' && obj !== null && !Array.isArray(obj);
const isPromise = (obj) => !!obj && typeof obj.then === 'function';

/**
 * Add a model, create the model's reducer
 *
 * @param {string} name
 * @param {class} Model
 * @param {object} newModels
 * @param {object} newReducers
 */
const createReducer = (name, Model, newModels, newReducers) => {
  const model = new Model();
  newModels[name] = model;
  newReducers[name] = (state = model.state || {}, action) => {
    const [modelName] = action.type.split('/');
    if (modelName === name) return action.newState;
    return state;
  };
};

/**
 * Format a model's actions
 *
 * @param {string} name
 * @param {class} Model
 * @param {object} newModels
 * @param {function} newDispatch
 * @param {function} realDispatch
 */
const createActions = (name, Model, newModels, newDispatch, realDispatch) => {
  const model__proto__ = Model.prototype;
  const model = newModels[name];

  const setState = (payload) => {
    if (createActions.current.name !== name) {
      console.error(ERR.NO_SET_STATE(name));
      return;
    }
    const newState = { ...model.state, ...payload };
    model.state = newState;
    return realDispatch({
      type: `${name}/${createActions.current.actionName}`,
      newState,
    });
  };

  const setLoading = (actionName, type, status) => {
    model__proto__[actionName].loading = status;
    return realDispatch({
      type: `${name}/${actionName}/${type}_LOADING`,
      newState: { ...model.state, loading: { [actionName]: status } },
    });
  };

  model__proto__.models = newModels;
  model__proto__.setState = setState;
  const skipList = ['constructor', 'models', 'setState'];

  newDispatch[name] = {};

  Object.getOwnPropertyNames(model__proto__).forEach((actionName) => {
    if (skipList.includes(actionName)) return;

    const oldAction = model__proto__[actionName].bind(model);

    const newAction = (...args) => {
      const newCurrent = { name, actionName };
      const prevCurrent = createActions.current || newCurrent;
      createActions.current = newCurrent;

      const result = oldAction(...args);
      if (!isPromise(result)) {
        createActions.current = prevCurrent;
        return result;
      }

      setLoading(actionName, 'START', true);
      return new Promise((resolve, reject) => {
        result
          .then(resolve)
          .catch(reject)
          .finally(() => {
            setLoading(actionName, 'STOP', false);
            createActions.current = prevCurrent;
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
 * @param {object} models
 * @param {array} middleware
 * @return {object} Store
 */
setStore = (models = {}, middleware = []) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';

  if (__DEV__) {
    if (!isObject(models)) throw new Error(ERR.NOT_OBJECT('models'));
    if (!Array.isArray(middleware)) throw new Error(ERR.NOT_ARRAY('middleware'));
  }

  const newModels = {};
  const newReducers = {};
  const nameModelList = Object.entries(models);

  // Reducers
  if (__DEV__) {
    nameModelList.forEach(([name, Model]) => {
      if (typeof Model !== 'function') throw new Error(ERR.NOT_CLASS('Model'));
      createReducer(name, Model, newModels, newReducers);
    });
  } else {
    nameModelList.forEach(([name, Model]) => {
      createReducer(name, Model, newModels, newReducers);
    });
  }

  // Store
  const __COMPOSE__ = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  const newCompose = __DEV__ && __COMPOSE__ ? __COMPOSE__ : compose;

  const store = createStore(
    combineReducers(newReducers),
    newCompose(applyMiddleware(...middleware)),
  );

  const realDispatch = store.dispatch;
  const newDispatch = () => {
    console.error(ERR.NO_DISPATCH());
  };
  store.dispatch = newDispatch;

  // Actions
  nameModelList.forEach(([name, Model]) => {
    createActions(name, Model, newModels, newDispatch, realDispatch);
  });

  // store.add
  store.add = (modelsToAdd) => {
    if (__DEV__) {
      if (!isObject(modelsToAdd)) throw new Error(ERR.NOT_OBJECT('models'));

      Object.entries(modelsToAdd).forEach(([name, Model]) => {
        if (name in newModels) return;
        if (typeof Model !== 'function') throw new Error(ERR.NOT_CLASS('Model'));

        createReducer(name, Model, newModels, newReducers);
        store.replaceReducer(combineReducers(newReducers));
        createActions(name, Model, newModels, newDispatch, realDispatch);
      });
    } else {
      Object.entries(modelsToAdd).forEach(([name, Model]) => {
        if (name in newModels) return;

        createReducer(name, Model, newModels, newReducers);
        store.replaceReducer(combineReducers(newReducers));
        createActions(name, Model, newModels, newDispatch, realDispatch);
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
  const __DEV__ = process.env.NODE_ENV !== 'production';
  const first = names[0];

  if (typeof first === 'string') {
    const mapStore = (store) => names.reduce((props, name) => ({ ...props, ...store[name] }), {});

    let mapState;
    if (__DEV__) {
      mapState = (state) =>
        names.reduce((props, name) => {
          if (typeof name !== 'string') throw new Error(ERR.NOT_STRING('name'));
          const obj = state[name];
          if (typeof obj === 'undefined') throw new Error(ERR.NOT_EXIST(name));
          return { ...props, ...obj };
        }, {});
    } else {
      mapState = mapStore;
    }

    const mapDispatch = mapStore;
    return connect(mapState, mapDispatch);
  }

  if (isObject(first)) {
    const firstFiltered = {};
    const getProps = (props, name, keys, obj) => {
      const modelProps = keys.reduce((part, key) => {
        const val = obj[key];
        if (typeof val !== 'undefined') return { ...part, [key]: val };
        firstFiltered[name].push(key);
        return part;
      }, {});
      return { ...props, ...modelProps, loading: obj.loading };
    };

    let mapState;
    if (__DEV__) {
      mapState = (state) =>
        Object.entries(first).reduce((props, [name, keys]) => {
          firstFiltered[name] = [];
          const obj = state[name];
          if (typeof obj === 'undefined') throw new Error(ERR.NOT_EXIST(name));
          return getProps(props, name, keys, obj);
        }, {});
    } else {
      mapState = (state) =>
        Object.entries(first).reduce((props, [name, keys]) => {
          firstFiltered[name] = [];
          return getProps(props, name, keys, state[name]);
        }, {});
    }

    const mapDispatch = (dispatch) =>
      Object.entries(firstFiltered).reduce((props, [name, keys]) => {
        const obj = dispatch[name];
        const modelProps = keys.reduce((part, key) => ({ ...part, [key]: obj[key] }), {});
        return { ...props, ...modelProps };
      }, {});

    return connect(mapState, mapDispatch);
  }

  return connect(...names);
};
