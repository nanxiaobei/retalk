## 1.2.2 (2018.12.8)

* Add cache to action's context to improving performance.

## 1.2.1 (2018.12.6)

* Add Support to show different action types between `model.actions` to prepare for deprecating `model.reducers`.
* Add `model.reducers` deprecating warning.

## 1.2.0 (2018.12.5)

* Change `createStore(models: Object, useReduxDevTools: boolean)` to `createStore(models: Object, options: Object)`.
* Add `options.useDevTools: boolean`.
* Add `options.plugins: Array`. ([@he5050](https://github.com/he5050) in [#3](https://github.com/nanxiaobei/retalk/issues/3))
* Simplify README.
* Refine code.
