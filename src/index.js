import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { connect } from 'react-redux';
export { Provider, batch } from 'react-redux';

/**
 * Utils
 */
const ERR = {
  NOT_STRING: (name) => `'${name}' should be a string`,
  NOT_ARRAY: (name) => `'${name}' should be an array`,
  NOT_OBJECT: (name) => `'${name}' should be an object`,
  NOT_CLASS: (name) => `'${name}' should be a class`,

  NO_DISPATCH: () => "Please don't use 'dispatch' directly in Retalk",
  NOT_EXIST: (name) => `'${name}' Model dose not exist`,
};

const isObj = (obj) => Object.prototype.toString.call(obj) === '[object Object]';

/**
 * Add a model, create the model's reducer
 *
 * @param {string} name
 * @param {class} Model
 * @param {object} newModels
 * @param {object} newReducers
 */
const createReducer = (name, Model, newModels, newReducers) => {
  const model = { ...new Model() };
  newModels[name] = model;
  model.models = newModels;

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

  const setLoading = (actionName, type, loading) => {
    model[actionName].loading = loading;
    return realDispatch({
      type: `${name}/${actionName}/${type}_LOADING`,
      newState: { ...model.state, loading: { [actionName]: loading } },
    });
  };

  newDispatch[name] = {};
  Object.getOwnPropertyNames(model__proto__).forEach((actionName) => {
    if (actionName === 'constructor' || actionName === 'models') return;

    const setState = (payload) => {
      const newState = Object.assign(model.state, payload);
      return realDispatch({ type: `${name}/${actionName}`, newState: { ...newState } });
    };

    let oldAction;
    const newAction = (...args) => {
      if (!oldAction) oldAction = model__proto__[actionName].bind({ ...model, setState });

      const res = oldAction(...args);
      if (!res || typeof res.then !== 'function') return res;

      setLoading(actionName, 'START', true);
      return res.finally(() => {
        setLoading(actionName, 'STOP', false);
      });
    };

    model[actionName] = newAction;
    newDispatch[name][actionName] = newAction;
  });
};

/**
 * Initialize all models
 *
 * @param {object} models
 * @param {array} middleware
 * @return {object} Store
 */
export const setStore = (models = {}, middleware = []) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';

  if (__DEV__) {
    if (!isObj(models)) throw new Error(ERR.NOT_OBJECT('models'));
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
      if (!isObj(modelsToAdd)) throw new Error(ERR.NOT_OBJECT('models'));

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
 * @param {string|object|function} names
 * @return {function} Higher-order component
 */
export const withStore = (...names) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  const first = names[0];

  // ['a', 'b']
  if (typeof first === 'string') {
    const mapStore = (store) => {
      let obj = {};
      names.forEach((name) => {
        obj = { ...obj, ...store[name] };
      });
      return obj;
    };

    let mapState;
    if (__DEV__) {
      mapState = (state) => {
        let stateObj = {};
        names.forEach((name, index) => {
          if (index > 0 && typeof name !== 'string') throw new Error(ERR.NOT_STRING('name'));
          const modelState = state[name];
          if (typeof modelState === 'undefined') throw new Error(ERR.NOT_EXIST(name));
          stateObj = { ...stateObj, ...modelState };
        });
        return stateObj;
      };
    } else {
      mapState = mapStore;
    }

    return connect(mapState, mapStore);
  }

  // [{ a: ['a1', 'a2'] }]
  if (isObj(first)) {
    const stateActionsMap = first;
    const actionsMap = {};

    let mapState;
    if (__DEV__) {
      mapState = (state) => {
        const stateObj = {};
        Object.entries(stateActionsMap).forEach(([name, keys]) => {
          actionsMap[name] = [];
          const modelState = state[name];
          if (typeof modelState === 'undefined') throw new Error(ERR.NOT_EXIST(name));
          keys.forEach((key) => {
            const val = modelState[key];
            typeof val !== 'undefined' ? (stateObj[key] = val) : actionsMap[name].push(key);
          });
          stateObj.loading = { ...stateObj.loading, ...modelState.loading };
        });
        return stateObj;
      };
    } else {
      mapState = (state) => {
        const stateObj = {};
        Object.entries(stateActionsMap).forEach(([name, keys]) => {
          actionsMap[name] = [];
          const modelState = state[name];
          keys.forEach((key) => {
            const val = modelState[key];
            typeof val !== 'undefined' ? (stateObj[key] = val) : actionsMap[name].push(key);
          });
          stateObj.loading = { ...stateObj.loading, ...modelState.loading };
        });
        return stateObj;
      };
    }

    const mapDispatch = (dispatch) => {
      let actionsObj = {};
      Object.entries(actionsMap).forEach(([name, keys]) => {
        const modelActions = dispatch[name];
        keys.forEach((key) => {
          actionsObj[key] = modelActions[key];
        });
      });
      return actionsObj;
    };

    return connect(mapState, mapDispatch);
  }

  // connect
  return connect(...names);
};
