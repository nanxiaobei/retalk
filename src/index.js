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

  const storeReducers = {};
  const rootReducers = {};
  const rootActions = {};
  const isAsyncImport = typeof Object.values(models)[0] === 'function';

  const splitModels = (modelName, model) => {
    verifyParam(modelName, model);
    const { state: modelState, reducers: modelReducers, actions: modelActions } = model;
    storeReducers[modelName] = createReducer(modelName, modelState, modelReducers, modelActions);
    rootReducers[modelName] = modelReducers;
    rootActions[modelName] = modelActions;
  };
  const createReduxStore = () => {
    // when using Redux DevTools，`store.replaceReducer()` will have a problem
    const composeEnhancers = (!isAsyncImport && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE_
      : compose;

    // creating the Redux store
    const store = reduxCreateStore(
      combineReducers(storeReducers),
      composeEnhancers(applyMiddleware(thunk)),
    );

    // assign `dispatch` to `theRealDispatch`,
    store.theRealDispatch = store.dispatch;

    Object.keys(rootActions).forEach(modelName => {
      const { reducers, actions } = createActions(store, rootReducers, rootActions, modelName);
      rootReducers[modelName] = reducers;
      rootActions[modelName] = actions;
    });

    if (isAsyncImport) {
      store.addModule = (modelName, model) => {
        if (Object.keys(storeReducers).includes(modelName)) return;

        verifyParam(modelName, model);
        const { state: modelState, reducers: modelReducers, actions: modelActions } = model;
        storeReducers[modelName] = createReducer(modelName, modelState, modelReducers, modelActions);
        rootReducers[modelName] = modelReducers;
        rootActions[modelName] = modelActions;

        // replace store reducers
        store.replaceReducer(combineReducers(storeReducers));

        const { reducers, actions } = createActions(store, rootReducers, rootActions, modelName);
        rootReducers[modelName] = reducers;
        rootActions[modelName] = actions;
      };
    }

    // `dispatch` used in `connect` to get model reducers and actions in a hack way
    store.dispatch = () => ({ rootReducers, rootActions });

    return store;
  };

  // not async import
  if (!isAsyncImport) {
    Object.keys(models).forEach(modelName => {
      const model = models[modelName];
      splitModels(modelName, model);
    });
    return createReduxStore();
  }

  // async import
  const modelNames = [];
  return Promise.all(Object.keys(models).map(modelName => {
    const importer = models[modelName];
    if (typeof importer !== 'function') {
      throw new Error(
        `If async import model, expected the \`${modelName}\` model to be an import function, but got \`${typeof importer}\``, // eslint-disable-line
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
};

/**
 * connect
 *
 * @param {function} param.mapState - (state, [ownProps]) => stateProps
 * @param {function} param.mapReducers - (reducers, [ownProps]) => reducersProps
 * @param {function} param.mapActions - (actions, [ownProps]) => actionsProps
 * @param {function} param.mergeProps - (stateProps, dispatchProps, ownProps) => props
 * @param {object} param.options - same as `options` to react-redux `connect()`
 * @return {function}
 */
const connect = param => {
  if (param === undefined) return reactReduxConnect();
  if (!isObject(param)) {
    throw new Error('If parameter is passed, expected the parameter to be an object');
  }
  const { mapState, mapReducers, mapActions, mergeProps: validMergeProps, options: validOptions } = param;
  const mapStateToProps = mapState || null;
  const mapDispatchToProps = (typeof mapReducers === 'function' || typeof mapActions === 'function')
    ? (dispatch, ownProps) => {
      const { rootReducers, rootActions } = dispatch();
      let methodProps = mapReducers ? { ...mapReducers(rootReducers, ownProps) } : {};
      methodProps = mapActions ? { ...methodProps, ...mapActions(rootActions, ownProps) } : methodProps;
      return methodProps;
    }
    : undefined;
  const mergeProps = (mapStateToProps && mapDispatchToProps) ? validMergeProps : undefined;
  const options = (mapStateToProps && mapDispatchToProps && mergeProps) ? validOptions : undefined;

  return reactReduxConnect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    options,
  );
};

/**
 * withStore
 *
 * @param {array} modelNames - ['modelA', 'modelB', ...]
 * @return {function}
 */
const withStore = (...modelNames) => Component => connect({
  mapState: rootState => Object.assign({}, ...modelNames.map(modelName => rootState[modelName])),
  mapReducers: rootReducers => Object.assign({}, ...modelNames.map(modelName => rootReducers[modelName])),
  mapActions: rootActions => Object.assign({}, ...modelNames.map(modelName => rootActions[modelName])),
})(Component);

/**
 * exports
 */
export {
  createStore,
  connect,
  Provider,
  withStore,
};
