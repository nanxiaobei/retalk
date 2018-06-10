import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';

const env = process.env.NODE_ENV;
const config = {
  input: 'src/index.js',
  external: ['redux', 'redux-thunk', 'react-redux'],
  plugins: [],
};

if (env === 'es' || env === 'cjs') {
  config.output = { format: env };
  config.plugins.push(
    babel({
      plugins: ['external-helpers'],
    }),
  );
}

if (env === 'development' || env === 'production') {
  config.output = {
    format: 'umd',
    name: 'Retalk',
    globals: {
      redux: 'redux',
      thunk: 'redux-thunk',
      reactRedux: 'react-redux',
    },
  };
  config.plugins.push(
    resolve(),
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  );
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    }),
  );
}

export default config;
