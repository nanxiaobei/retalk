import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const input = 'src/index.js';
const deps = Object.keys(pkg.dependencies);
const external = (id) => deps.includes(id) || id.includes('@babel/runtime/');
const plugins = (useESModules) => [
  babel({
    plugins: [['@babel/plugin-transform-runtime', { useESModules }]],
    runtimeHelpers: true,
  }),
];

export default [
  { input, output: { file: pkg.main, format: 'cjs' }, external, plugins: plugins(false) },
  { input, output: { file: pkg.module, format: 'es' }, external, plugins: plugins(true) },
];
