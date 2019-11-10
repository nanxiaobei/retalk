<img src="./logo/retalk.png" width="280" alt="Retalk">

最简单的 Redux 解决方案，像写 React 一样来写 Redux。

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/retalk?style=flat-square)](https://bundlephobia.com/result?p=retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

[English](./README.md) | 简体中文

---

## 简介

- **极简 Redux** - 会写 React？那就已经一切就绪。
- **共 3 个 API** - `setStore()`、`withStore()`、`<Provider>`。
- **异步 model** - models 代码分隔的完美支持。
- **自动 loading** - 异步 action 的自动 loading state。

## 安装

```sh
yarn add retalk
```

或

```sh
npm install retalk
```

## 使用

### 1. Models

通常我们会在 app 内划分多个路由，一个路由就对应一个 model。

像写 React 组件一样来写 model，只是没有了生命周期而已。

```js
class CounterModel {
  state = {
    count: 0,
  };
  increment() {
    // this.state -> 获取自身 model 的 state
    // this.setState() -> 更新自身 model 的 state
    // this.someOtherAction() -> 调用自身 model 的 actions

    // this.models.someModel.state -> 获取其它 model 的 state
    // this.models.someModel.someAction() -> 调用其它 model 的 actions

    const { count } = this.state;
    this.setState({ count: count + 1 });
  }
  async incrementAsync() {
    // 自动的 `someAsyncAction.loading` 可供使用

    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.increment();
  }
}
```

### 2. Store

使用 `setStore()` 来初始化所有 model 与其命名空间。

```js
import { setStore } from 'retalk';

const store = setStore({
  counter: CounterModel,
  // Other models...
});
```

### 3. Views

使用 `withStore()`来连接 models 与组件。

```jsx harmony
import React from 'react';
import { withStore } from 'retalk';

const Counter = ({ count, increment, incrementAsync }) => (
  <div>
    <p>{count}</p>
    <button onClick={increment}>+</button>
    <button onClick={incrementAsync}>+ Async{incrementAsync.loading && '...'}</button>
  </div>
);

const CounterWrapper = withStore('counter')(Counter);
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

`setStore(models, middleware)`

```js
const store = setStore({ a: AModel, b: BModel }, [middleware1, middleware2]);
```

生成唯一的 store。

自 `3.0.0` 起，在 `development`模式下，[Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension) 将默认启用，请确保其版本 [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) 且 [不是 v2.16.0](https://stackoverflow.com/a/53512072/6919133)。

### 2. withStore()

`withStore(...modelNames)(Component)`

```js
const DemoWrapper = withStore('a', 'b')(Demo);
```

将一个或多个 model 的 state 与 actions 注入一个组件的 props。

### 3. \<Provider>

`<Provider store={store}>`

使用其包裹 app 以获取 store。

## FAQ

### 1. 异步引入 model？

使用 `setStore()` 初始化 store，接着使用像 [`loadable-components`](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) 这样的库引入组件与 models。

然后，使用 `store.add(models)` 将 models 注入 store。

一个使用 `loadable-components` 的示例：

```jsx harmony
import React from 'react';
import loadable from 'loadable-components';

const AsyncCounter = loadable(async (store) => {
  const [{ default: Counter }, { default: CounterModel }] = await Promise.all([
    import('./Counter/index.jsx'),
    import('./Counter/Model'),
  ]);
  store.add({ counter: CounterModel }); // 将 `models` 传入 `store.add()`，像 `_setStore_()` 一样
  return (props) => <Counter {...props} />;
});
```

### 2. 自定义 state 与 actions？

如需对注入组件的 props 进行定制，可传入 [`mapStateToProps` 与 `mapDispatchToProps`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments)，而不是传入 model 名称至 `withStore()`。

```jsx harmony
const mapState = ({ counter: { count } }) => ({
  count,
});

const mapActions = ({ counter: { increment, incrementAsync } }) => ({
  increment,
  incrementAsync,
});

// `mapDispatchToProps` 的第一个参数是 `dispatch`，`dispatch` 是一个函数。
// 但在上面的 `mapActions` 中，我们把它当做一个对象来使用。
// Retalk 做了一些处理，它是 `dispatch` 函数，但在它身上绑定了所有的 model。

export default withStore(mapState, mapActions)(Counter);
```

### 3. 支持热更新？

将入口文件 `index.js` 改为：

```jsx harmony
const rootElement = document.getElementById('root');
const render = () => ReactDOM.render(<App />, rootElement);

render();

if (module.hot) {
  module.hot.accept('./App', () => {
    render();
  });
}
```

`<Provider>` 必须在 `<App>` 组件内：

```jsx harmony
const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
```

## 从 v2 升级到 v3

### 1. Models

```diff
- const counter = {
+ class CounterModel {
-   state: {},
+   state = {};
-   actions: {
-     increment() {
-       const home = this.home; // Get other models
-     },
-   },
+   increment() {
+     const { home } = this.models; // Get other models
+   }
- };
+ }
```

### 2. Store

```diff
- import { createStore } from 'retalk';
+ import { setStore } from 'retalk';

- const store = createStore({ counter }, { plugins: [logger] });
+ const store = setStore({ counter: CounterModel }, [logger]);
```

### 3. Views

```diff
- import { connect } from 'react-redux';

- const Counter = ({ incrementAsync, loading }) => (
+ const Counter = ({ incrementAsync }) => (
-   <button onClick={incrementAsync}>+ Async{loading.incrementAsync && '...'}</button>
+   <button onClick={incrementAsync}>+ Async{incrementAsync.loading && '...'}</button>
  );

- const CounterWrapper = connect(...withStore('counter'))(Counter);
+ const CounterWrapper = withStore('counter')(Counter);
```

### 4. App

```diff
- import { Provider } from 'react-redux';
+ import { Provider } from 'retalk';
```

## 协议

[MIT](https://github.com/nanxiaobei/retalk/blob/master/LICENSE) © [nanxiaobei](https://mrlee.me/)
