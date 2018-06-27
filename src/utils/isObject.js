/**
 * isObject
 *
 * @param {any} obj
 * @returns {boolean} True if the argument appears to be an object
 */
const isObject = obj => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

export default isObject;
