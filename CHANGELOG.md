# Changelog

English | [简体中文](./CHANGELOG.zh-CN.md)

## 2.0.0 (1.29, 2019)

- Upgrade core code, simplify logic.
- Remove `reducers` support.
- Use Proxy to improve great performance.
- Add more widely check support.

## 1.2.3 (12.10, 2018)

- Add `@babel/runtime` to `peerDependencies`.
- Add zh-CN Readme, Changelog and Documentation.

## 1.2.2 (12.8, 2018)

- Add cache to action's context to improving performance.

## 1.2.1 (12.6, 2018)

- Add Support to show different action types between `actions` to prepare for deprecating `reducers`.
- Add `reducers` deprecating warning.

## 1.2.0 (12.5, 2018)

- Change `createStore(models: Object, useReduxDevTools: boolean)` to `createStore(models: Object, options: Object)`.
- Add `options.useDevTools: boolean`.
- Add `options.plugins: Array`. ([#3](https://github.com/nanxiaobei/retalk/issues/3) by [@he5050](https://github.com/he5050))
- Simplify README.
- Refine code.
