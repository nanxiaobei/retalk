const { NODE_ENV } = process.env;
const isESMode = NODE_ENV === 'esm';

module.exports = {
  presets: [['@babel/preset-env', { modules: false }]],
  plugins: [
    !isESMode && '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-transform-runtime', { useESModules: isESMode }],
  ].filter(Boolean),
};
