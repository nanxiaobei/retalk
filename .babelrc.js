module.exports = {
  presets: [['@babel/preset-env', { targets: '> 0.25%, not dead', modules: false }]],
  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-react-jsx',
      ],
    },
  },
};
