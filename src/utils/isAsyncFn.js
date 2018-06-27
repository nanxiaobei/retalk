/**
 * isAsyncFn
 *
 * @param {any} fn
 * @return {boolean} True if the argument appears to be an async function
 */
const isAsyncFn = fn => {
  if (typeof fn !== 'function') return false;
  const str = fn.toString();
  return (
    str.includes('regeneratorRuntime.mark(') ||
    str.includes('_regenerator') ||
    str.includes('.apply(') ||
    str.includes('_promise') ||
    str.includes('.then(') ||
    str.includes('fetch(')
  );
};

export default isAsyncFn;
