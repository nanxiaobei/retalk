const { NODE_ENV } = process.env;

module.exports = {
  presets: [['@babel/preset-env', { modules: false }]],
  plugins: [
    NODE_ENV === 'test' && '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-transform-runtime', { useESModules: NODE_ENV === 'esm' }],
  ].filter(Boolean),
};
