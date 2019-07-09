import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';

import { dependencies } from './package.json';

const { NODE_ENV } = process.env;

const depKeys = Object.keys(dependencies);

const config = {
  input: 'src/index.js',
  output: { format: NODE_ENV, indent: false },
  external: (id) => {
    if (depKeys.includes(id)) return true;
    if (id.includes('@babel/runtime/')) return true;
  },
  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      include: ['src/**/*.js'],
      exclude: ['node_modules/**'],
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
  ],
};

export default config;
