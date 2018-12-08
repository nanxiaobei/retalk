## 1.2.2 (12.8, 2018)

* Add cache to action's context to improving performance.

## 1.2.1 (12.6, 2018)

* Add Support to show different action types between `model.actions` to prepare for deprecating `model.reducers`.
* Add `model.reducers` deprecating warning.

## 1.2.0 (12.5, 2018)

* Change `createStore(models: Object, useReduxDevTools: boolean)` to `createStore(models: Object, options: Object)`.
* Add `options.useDevTools: boolean`.
* Add `options.plugins: Array`. ([@he5050](https://github.com/he5050) in [#3](https://github.com/nanxiaobei/retalk/issues/3))
* Simplify README.
* Refine code.
