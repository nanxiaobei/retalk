/**
 * isAsyncFn
 * @param {any} fn
 * @returns {boolean} True if the argument appears to be an async function
 */
const isAsyncFn = (fn) => {
  if (typeof fn !== 'function') return false;
  const str = fn.toString();
  return (
    str.includes('regeneratorRuntime.mark(') ||
    str.includes('_regenerator') ||
    str.includes('.apply(') ||
    str.includes('.then(') ||
    str.includes('_promise') ||
    str.includes('Promise(') ||
    str.includes('Promise.') ||
    str.includes('fetch(')
  );
};

export default isAsyncFn;
