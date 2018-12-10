# 更新日志

[English](./CHANGELOG.md) | 简体中文

## 1.2.2 (12.8, 2018)

* 增加对 action 中 `this` 上下文缓存的支持，以提升性能。

## 1.2.1 (12.6, 2018)

* 增加调用不同的 action 时，显示不同的 Action type 的支持，为废弃 `reducers` 做好准备。
* 增加 `reducers` 废弃提醒。

## 1.2.0 (12.5, 2018)

* 更改 `createStore(models: Object, useReduxDevTools: boolean)` 为 `createStore(models: Object, options: Object)`。
* 增加 `options.useDevTools: boolean`。
* 增加 `options.plugins: Array`。[#3](https://github.com/nanxiaobei/retalk/issues/3) [@he5050](https://github.com/he5050)
* 简化 README。
* 优化代码。
