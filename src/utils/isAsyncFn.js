/**
 * isAsyncFn
 *
 * @param {function} fn - The function to inspect
 * @return {boolean} True if the argument appears to be an async function
 */
const isAsyncFn = fn => {
  if (typeof fn !== 'function') return false;
  const string = fn.toString();
  return (
    string.includes('regeneratorRuntime.mark(') ||
    string.includes('_regenerator') ||
    string.includes('.apply(') ||
    string.includes('_promise') ||
    string.includes('.then(') ||
    string.includes('fetch(')
  );
};

export default isAsyncFn;
