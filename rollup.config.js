import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';

import pkg from './package.json';

const { NODE_ENV } = process.env;

const dependencies = {
  ...Object.keys(pkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
};

const config = {
  input: 'src/index.js',
  output: { format: NODE_ENV, indent: false },
  external: (id) => {
    if (dependencies.includes(id)) return true;
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
