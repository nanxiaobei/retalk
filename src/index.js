import { createStore as reduxCreateStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { connect as reactReduxConnect } from 'react-redux';
import createReducer from './createReducer';
import createActions from './createActions';
import isObject from './utils/isObject';
import verifyParam from './utils/verifyParam';

/**
 * createStore
 *
 * @param {object} models
 * @param {boolean} async
 * @return {object} Store or Promise
 */
const createStore = async (models, async) => {
  if (!isObject(models)) {
    throw new Error('Expected the `models` to be an object');
  }
  if (async !== undefined && typeof async !== 'boolean') {
    throw new Error('Expected the `async` to be a boolean');
  }

  const rootReducers = {};
  const rootActions = {};
  if (async) {
    const importedModels = await Promise.all(models.map((modelName) => {
      const path = models[modelName];
      if (typeof path !== 'string') {
        throw new Error(`If async import model, expected the model path to be a string`);
      }
      return import(path);
    }));
    importedModels.forEach(({ default: model }, index) => {
      verifyParam(model);
      const modelName = models[index];
      const { state: modelState, actions: modelActions } = model;
      rootReducers[modelName] = createReducer(modelName, modelState, modelActions);
      rootActions[modelName] = modelActions;
    });
  } else {
    Object.keys(models).forEach(modelName => {
      const model = models[modelName];
      verifyParam(model);
      const { state: modelState, actions: modelActions } = model;
      rootReducers[modelName] = createReducer(modelName, modelState, modelActions);
      rootActions[modelName] = modelActions;
    });
  }

  // creating the Redux store
  const store = reduxCreateStore(
    combineReducers(rootReducers),
    compose(applyMiddleware(thunk)),
  );

  // assign `dispatch` to `theRealDispatch`,
  store.theRealDispatch = store.dispatch;

  Object.keys(rootActions).forEach(modelName => {
    const modelActions = rootActions[modelName];
    rootActions[modelName] = createActions(store, rootActions, modelName, modelActions);
  });

  if (async) {
    store.addModule = (modelName, modelState, modelActions) => {
      if (Object.keys(rootReducers).includes(modelName)) return;
      rootReducers[modelName] = createReducer(modelName, modelState, modelActions);
      store.replaceReducer(combineReducers(rootReducers));
      rootActions[modelName] = createActions(store, rootActions, modelName, modelActions);
    };
  }

  // `dispatch` used in `connect` to get model actions in a hack way
  store.dispatch = () => rootActions;

  return store;
};

/**
 * connect
 *
 * @param {function} mapState
 * @param {function} mapActions
 * @param {array} otherArgs
 * @return {function}
 */
const connect = (mapState, mapActions, ...otherArgs) => reactReduxConnect(
  (state, ownProps) => mapState(state, ownProps),
  (dispatch, ownProps) => mapActions(dispatch(), ownProps),
  ...otherArgs,
);

/**
 * withStore
 *
 * @param {array} modelNames
 * @return {function}
 */
const withStore = (...modelNames) => {
  modelNames.forEach(modelName => {
    if (typeof modelName !== 'string') {
      throw new Error('Expected the `modelName` to `withStore(modelName)()` to be a string');
    }
  });
  return Component => {
    if (!isObject(Component)) {
      throw new Error('Expected the `Component` to `withStore()(Component)` to be a React component');
    }
    return connect(
      rootState => Object.assign({}, ...modelNames.map(key => rootState[key])),
      rootActions => Object.assign({}, ...modelNames.map(key => rootActions[key])),
    )(Component);
  };
};

/**
 * exports
 */
export {
  createStore,
  connect,
  withStore,
};
