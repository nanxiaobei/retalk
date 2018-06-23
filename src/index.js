import { createStore as reduxCreateStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { connect as reactReduxConnect, Provider } from 'react-redux';
import createReducer from './createReducer';
import createActions from './createActions';
import isObject from './utils/isObject';
import verifyParam from './utils/verifyParam';

/**
 * createStore
 *
 * @param {object} models - { model: { state, actions } } or { model: () => import() }
 * @return {object} Store or Promise
 */
const createStore = models => {
  if (!isObject(models)) {
    throw new Error('Expected the `models` to be an object');
  }

  const rootReducers = {};
  const rootActions = {};
  const isAsyncImport = typeof Object.values(models)[0] === 'function';

  const splitModels = (modelName, model) => {
    verifyParam(modelName, model);
    const { state: modelState, actions: modelActions } = model;
    rootReducers[modelName] = createReducer(modelName, modelState, modelActions);
    rootActions[modelName] = modelActions;
  };
  const createReduxStore = () => {
    // when using Redux DevTools，`store.replaceReducer()` will have a problem
    const composeEnhancers = (!isAsyncImport && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE_
      : compose;

    // creating the Redux store
    const store = reduxCreateStore(
      combineReducers(rootReducers),
      composeEnhancers(applyMiddleware(thunk)),
    );

    // assign `dispatch` to `theRealDispatch`,
    store.theRealDispatch = store.dispatch;

    Object.keys(rootActions).forEach(modelName => {
      const modelActions = rootActions[modelName];
      rootActions[modelName] = createActions(store, rootActions, modelName, modelActions);
    });

    if (isAsyncImport) {
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

  if (isAsyncImport) {
    const modelNames = [];
    return Promise.all(Object.keys(models).map(modelName => {
      const importer = models[modelName];
      if (typeof importer !== 'function') {
        throw new Error(
          `If async import model, expected the \`${modelName}\` model to be an import function, but got \`${typeof importer}\``,
        );
      }
      modelNames.push(modelName);
      return importer();
    })).then(moduleList => {
      moduleList.forEach((module, index) => {
        const modelName = modelNames[index];
        if (!isObject(module) || !isObject(module.default)) {
          throw new Error(`If async import model, expected the \`${modelName}\` model to be an import function`);
        }
        const model = module.default;
        splitModels(modelName, model);
      });
      return createReduxStore();
    });
  } else {
    Object.keys(models).forEach(modelName => {
      const model = models[modelName];
      splitModels(modelName, model);
    });
    return createReduxStore();
  }
};

/**
 * connect
 *
 * @param {function} mapState - (state, [ownProps]) => void
 * @param {function} mapActions - (actions, [ownProps]) => void
 * @param {array} otherArgs - [mergeProps, options]
 * @return {function}
 */
const connect = (mapState, mapActions, ...otherArgs) => {
  if (typeof mapState === 'function' && typeof mapActions === 'function') {
    return reactReduxConnect(
      (state, ownProps) => mapState(state, ownProps),
      (dispatch, ownProps) => mapActions(dispatch(), ownProps),
      ...otherArgs,
    );
  }
  return reactReduxConnect(...otherArgs);
};

/**
 * withStore
 *
 * @param {array} modelNames - [modelA, modelB, ...]
 * @return {function}
 */
const withStore = (...modelNames) => Component => connect(
  rootState => Object.assign({}, ...modelNames.map(modelName => rootState[modelName])),
  rootActions => Object.assign({}, ...modelNames.map(modelName => rootActions[modelName])),
)(Component);

/**
 * exports
 */
export {
  createStore,
  connect,
  Provider,
  withStore,
};
