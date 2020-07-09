<img src="./logo.png" width="228" alt="Retalk">

最简单的 Redux 解决方案。

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/retalk?style=flat-square)](https://bundlephobia.com/result?p=retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

[English](./README.md) | 简体中文

---

## 特性

- **极简 Redux** - 与 React 组件语法相同。
- **只有 2 个 API** - `setStore()` 与 `withStore()`。
- **异步 model** - 完整支持对 model 的代码分割。
- **自动 loading** - 自动处理异步 action 的 loading 状态。

## 安装

```sh
yarn add retalk

# 或

npm install retalk
```

## 使用

### 1. Model

通常我们会在 app 内设置多个路由，一个路由对应一个 model，所以将会有多个 model。

像写一个 React 组件一样来写 model，只是没有了生命周期而已。

```js
class CounterModel {
  state = {
    count: 0,
  };
  add() {
    // this.state -> 获取自身 model 的 state
    // this.setState() -> 更新自身 model 的 state
    // this.someAction() -> 调用自身 model 的 action

    // this.models.someModel.state -> 获取其它 model 的 state
    // this.models.someModel.someAction() -> 调用其它 model 的 action

    const { count } = this.state;
    this.setState({ count: count + 1 });
  }
  async addLater() {
    // 自动生成的 `someAsyncAction.loading` state 可供使用

    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.add();
  }
}
```

### 2. Store

使用 `setStore()` 来初始化所有 model 与其命名空间。

```js
import { setStore } from 'retalk';

const store = setStore({
  counter: CounterModel,
  // 其它 model...
});
```

### 3. View

使用 `withStore()` 来连接 model 与组件。

```jsx harmony
import React from 'react';
import { withStore } from 'retalk';

const Counter = ({ count, add, addLater }) => (
  <div>
    <p>{count}</p>
    <button onClick={add}>+</button>
    <button onClick={addLater}>+ ⏳{addLater.loading && '...'}</button>
  </div>
);

const CounterWrapper = withStore({
  counter: ['count', 'add', 'addLater'],
})(Counter);
```

### 4. App

使用 `<Provider>` 来将 store 提供给 app。

```jsx harmony
import ReactDOM from 'react-dom';
import { Provider } from 'retalk';

const App = () => (
  <Provider store={store}>
    <CounterWrapper />
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

## 示例

[![Edit retalk](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/retalk-5l9mqnzvx?fontsize=14)

## API

### 1. setStore()

```
const store = setStore(models, middleware);
```

传入 `models` 与 `middleware`（均为可选），生成唯一的 store。

> `development` 模式下，[Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension) 将默认启用，请确保其版本 [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) 且 [不是 v2.16.0](https://stackoverflow.com/a/53512072/6919133)。

```js
const store = setStore(
  {
    home: HomeModel,
    counter: CounterModel,
  },
  [logger, crashReporter]
);
```

### 2. withStore()

`withStore(...modelNames)(Component)`

将一个或多个 model 的 state 与 action 注入组件的 props。

有三种使用方式：

#### 使用 string 注入全部

```js
const CounterWrapper = withStore('home', 'counter')(Counter);
```

最简单的使用方式，但若注入了一些未用到的 props，也会触发重新渲染。

若确定所有注入的 props 都会用到，或优先考虑快速开发，可使用此方式。

#### 使用 object 自定义

```js
const CounterWrapper = withStore({
  home: ['name', 'setName'],
  counter: ['count', 'add', 'addLater'],
})(Counter);
```

对注入的 props 进行自定义，只注入需要的 props，从而优化性能。

#### 使用 `mapStateToProps()` 等自定义更多

```js
const CounterWrapper = withStore(mapStateToProps, mapDispatchToProps)(Counter);
```

对注入的 props 进行更多的自定义，可使用 [`mapStateToProps`、`mapDispatchToProps`](https://react-redux.js.org/api/connect) 等。

此时 `withStore()` 将被当做 `connect()` 来使用。

### 3. Provider & batch()

即 `redux-redux` 的 [`Provider`](https://react-redux.js.org/api/provider) 与 [`batch()`](https://react-redux.js.org/api/batch)。

你可以从 `retalk` 引入它们以简化开发。

## FAQ

### 异步引入 model？

使用 `setStore()` 初始化 store，接着使用比如 [`loadable-components`](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) 来引入组件与 model。

然后，使用 `store.add()` 将 model 注入 store。

使用 `loadable-components` 的示例：

```jsx harmony
import React from 'react';
import loadable from 'loadable-components';

const AsyncCounter = loadable(async () => {
  const [{ default: Counter }, { default: CounterModel }] = await Promise.all([
    import('./Counter/index.jsx'),
    import('./Counter/Model.js'),
  ]);
  store.add({ counter: CounterModel }); // 使用 `store.add(models)`，就像 `setStore(models)` 一样
  return (props) => <Counter {...props} />;
});
```

## 协议

[MIT](https://github.com/nanxiaobei/retalk/blob/master/LICENSE) © [nanxiaobei](https://mrlee.me/)
