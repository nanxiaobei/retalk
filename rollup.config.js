import { babel } from '@rollup/plugin-babel';
import pkg from './package.json';

const input = 'src/index.js';
const cjsOutput = { file: pkg.main, format: 'cjs' };
const esmOutput = { file: pkg.module, format: 'es' };
const deps = Object.keys(pkg.dependencies);
const external = (id) => deps.includes(id) || id.includes('@babel/runtime');
const plugins = (isESM) => [
  babel({
    presets: [['@babel/preset-env']],
    plugins: [['@babel/plugin-transform-runtime', { useESModules: isESM }]],
    babelHelpers: 'runtime',
  }),
];

export default [
  { input, output: cjsOutput, external, plugins: plugins(false) },
  { input, output: esmOutput, external, plugins: plugins(true) },
];
