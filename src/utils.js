/**
 * 1. Error types
 */
export const ERR = {
  // common
  NOT_STRING: (name) => `'${name}' must be a string`,
  NOT_BOOLEAN: (name) => `'${name}' must be a boolean`,
  NOT_ARRAY: (name) => `'${name}' must be an array`,
  NOT_OBJECT: (name) => `'${name}' must be an object`,
  // createStore
  DISPATCH: () => "Please do not use 'dispatch' directly in Retalk",
  MODEL_NAME: (name) => `Illegal model name '${name}', duplicated with an action name`,
  // createReducer
  DEPRECATED: () => "BREAKING CHANGES: 'reducers' was deprecated since v2.0.0, please don't use it",
  MODEL: (name) => `'${name}' model must be { state: Object, actions: Object }`,
  // createActions
  ACTION_NAME: (name, action) => `Illegal action name '${action}' in ${name} model`,
  ACTION: (name, action) => `Illegal action '${action}' in ${name} model`,
  // checkDuplicate
  DUPLICATE: (name, type, key) =>
    `withStore: Duplicate '${key}' ${type} in ${name} and another model`,
  // withStore
  WITH_STORE: () => 'Illegal model name passed to withStore',
};

/**
 * 2. Detect an object
 *
 * @param {any} obj
 * @return {boolean}
 */
export const isObject = (obj) => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

/**
 * 3. Detect an async function
 *
 * @param {any} fn
 * @return {boolean}
 */
export const isAsyncFn = (fn) => {
  if (typeof fn !== 'function') return false;
  const str = fn.toString();
  return (
    str.includes('regeneratorRuntime.mark(') ||
    str.includes('_regenerator') ||
    str.includes('.apply(')
  );
};

/**
 * 4. Check model
 *
 * @param {string} name
 * @param {object} model
 */
export const checkModel = (name, model) => {
  if (typeof name !== 'string') throw new Error(ERR.NOT_STRING('name'));
  if (!isObject(model)) throw new Error(ERR.NOT_OBJECT('model'));

  const { reducers, state, actions } = model;
  if (reducers !== undefined) throw new Error(ERR.DEPRECATED());
  if (!(Object.keys(model).length === 2 && isObject(state) && isObject(actions))) {
    throw new Error(ERR.MODEL(name));
  }
};

/**
 * 5. Create Proxy's handler
 *
 * @param {string} name
 * @param {function} getState
 * @param {function} dispatch
 * @param {object} [modelsProxy]
 * @return {object} handler
 */
export const createHandler = (name, getState, dispatch, modelsProxy) => ({
  get: (target, prop) => {
    if (prop === 'state') return getState()[name];
    if (prop in target) return target[prop];
    if (prop in dispatch[name]) {
      Object.assign(target, dispatch[name]);
      return target[prop];
    }
    if (typeof modelsProxy !== 'undefined' && prop in modelsProxy) {
      Object.assign(target, modelsProxy);
      return target[prop];
    }
    return undefined;
  },
});

/**
 * 6. Check duplicate keys
 *
 * @param {string} name
 * @param {string} type
 * @param {object} part
 * @param {object} all
 */
export const checkDuplicate = (name, type, part, all) => {
  let keys = Object.keys(part);
  if (type === 'state') keys = keys.filter((key) => key !== 'loading');
  keys.forEach((key) => {
    if (key in all) throw new Error(ERR.DUPLICATE(name, type, key));
  });
};
