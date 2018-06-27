const getErrMsg = (name, method) => {
  if (name && !method) return `, ${name} is not in models`;
  if (name && method) return `, ${method} is not in ${name} model`;
  return '';
};

/**
 * error
 */
const error = {
  // common
  NOT_OBJECT: name => `${name} must be an object`,
  NOT_STRING: name => `${name} must be a string`,
  // index
  INVALID_ACTION_TYPE: (type, name, method) => `Invalid action type ${type}${getErrMsg(name, method)}`,
  INVALID_IMPORTER: name => `Invalid () => import() function to ${name} model`,
  INVALID_MODEL_NAME: () => 'Params to withStore() must all be string',
  // createMethods
  ASYNC_REDUCER: (name, reducer) => `Reducer can not be an async function (${name}.${reducer})`,
  METHODS_CONFLICT: (name, reducer) => `Name duplicated in reducers and actions (${name}.${reducer})`,
  // utils/verifyModel
  NO_MODEL_KEY: (name, key) => `${key} [object] is required in ${name} model`,
  INVALID_REDUCERS: name => `reducers must be an object (in ${name} model)`,
  // utils/middleware
  INVALID_NEXT_STATE: () => 'nextState to this.setState() must be an object',
  INVALID_PAYLOAD: () => 'Invalid action.payload, please call dispatch() in the right way in retalk',
};

export default error;
