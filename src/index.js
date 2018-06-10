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
 * @param {object} models - { model: { state, actions } } or { model: () => import() }
 * @return {object} Store or Promise
 */
const createStore = async models => {
  if (!isObject(models)) {
    throw new Error('Expected the `models` to be an object');
  }

  const isAsyncImport = typeof Object.values(models)[0] === 'function';

  const rootReducers = {};
  const rootActions = {};

  if (isAsyncImport) {
    const modelNames = [];
    const importedModels = await Promise.all(Object.keys(models).map(modelName => {
      const importer = models[modelName];
      if (typeof importer !== 'function') {
        throw new Error(`If async import model, expected the \`${modelName}\` model to be an import function`);
      }
      modelNames.push(modelName);
      return importer();
    }));
    importedModels.forEach(({ default: model }, index) => {
      const modelName = modelNames[index];
      verifyParam(modelName, model);
      const { state: modelState, actions: modelActions } = model;
      rootReducers[modelName] = createReducer(modelName, modelState, modelActions);
      rootActions[modelName] = modelActions;
    });
  } else {
    Object.keys(models).forEach(modelName => {
      const model = models[modelName];
      verifyParam(modelName, model);
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

/**
 * connect
 *
 * @param {function} mapState - (state, [ownProps]) => void
 * @param {function} mapActions - (actions, [ownProps]) => void
 * @param {array} otherArgs - [mergeProps, options]
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
 * @param {array} modelNames - [modelA, modelB, ...]
 * @return {function}
 */
const withStore = (...modelNames) => Component => connect(
  rootState => Object.assign({}, ...modelNames.map(modelName => {
    if (typeof modelName !== 'string') {
      throw new Error('At `withStore(modelName)()`, expected the `modelName` to be a string');
    }
    return rootState[modelName];
  })),
  rootActions => Object.assign({}, ...modelNames.map(modelName => rootActions[modelName])),
)(Component);


/**
 * exports
 */
export {
  createStore,
  connect,
  withStore,
};
