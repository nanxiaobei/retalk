module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  overrides: [
    {
      files: '*.test.js',
      env: {
        jest: true,
      },
    },
  ],
};
