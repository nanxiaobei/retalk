/**
 * isAsyncFn
 *
 * @param {function} fn - The function to inspect
 * @return {boolean} True if the argument appears to be an async function
 */
const isAsyncFn = fn => {
  const string = fn.toString();
  return string.includes('regeneratorRuntime.mark') || string.includes('.apply(');
};

export default isAsyncFn;
