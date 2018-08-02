/**
 * error
 */
const error = {
  // common
  NOT_STRING: name => `${name} must be a string`,
  NOT_OBJECT: name => `${name} must be an object`,
  // index
  INVALID_IMPORTER: name => `Invalid () => import() function to ${name} model`,
  INVALID_MODEL_NAME: () => 'Params to withStore() must all be string',
  // createReducer
  NO_MODEL_KEY: (name, key) => `${key} [object] is required in ${name} model`,
  INVALID_REDUCERS: name => `reducers must be an object (in ${name} model)`,
  // createMethods
  ASYNC_REDUCER: (name, reducer) => `Reducer can not be an async function (${name}.${reducer})`,
  METHODS_CONFLICT: (name, reducer) => `Name duplicated in reducers and actions (${name}.${reducer})`,
  // utils/methodsStation
  INVALID_ACTION: () => 'Please do not use dispatch in Retalk',
};

export default error;
