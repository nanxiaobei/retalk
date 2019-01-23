/**
 * checkSameKey
 * @param {string} name
 * @param {string} type
 * @param {Object} part
 * @param {Object} all
 */
const checkSameKey = (name, type, part, all) => {
  let keys = Object.keys(part);
  if (type === 'state') keys = keys.filter((key) => key !== 'loading');
  keys.forEach((key) => {
    if (key in all) {
      throw new Error(
        `When using withStore, ${name} and other model has duplicate \`${key}\` ${type}`,
      );
    }
  });
};

export default checkSameKey;
