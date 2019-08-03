<div align="center">

<img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

Retalk 是 Redux 的一个最佳实践，简单、流畅而智慧。

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

[English](./README.md) | 简体中文

</div>

---

## 特性

- **极简 Redux 实践：** 只需要 `state` 和 `actions`，简洁清晰。
- **只有两个 API：** `createStore` 与 `withStore`，再无其它繁杂概念。
- **异步引入 model：** 对 models 进行代码分隔的完整支持。
- **自动 `loading` 处理：** 发送请求，接着使用自动的 loading 状态即可。

## 安装

```sh
yarn add retalk
```

或

```sh
npm install retalk
```

## 使用

```jsx harmony
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, withStore } from 'retalk';

// 1. Model
const counter = {
  state: {
    count: 0,
  },
  actions: {
    increment() {
      const { count } = this.state;
      this.setState({ count: count + 1 });
    },
    async incrementAsync() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.increment();
    },
  },
};

// 2. View
const Counter = connect(...withStore('counter'))(
  ({ count, increment, incrementAsync, loading }) => (
    <div>
      {count}
      <button onClick={increment}>+</button>
      <button onClick={incrementAsync}>+ Async{loading.incrementAsync && '...'}</button>
    </div>
  ),
);

// 3. Store
const store = createStore({ counter });

const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

## 示例

[![Edit retalk](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/retalk-5l9mqnzvx?fontsize=14)

## API

### createStore()

`createStore(models[, options])`

```js
const store = createStore({ modelA, modelB }, { useDevTools: false, plugins: [logger] });
```

#### options.useDevTools

类型：`boolean`，默认：`true`。启用 [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension)，务必确保插件版本 [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) 且 [不是 v2.16.0](https://stackoverflow.com/a/53512072/6919133)。

#### options.plugins

类型：`array`，默认：`[]`。将中间件以数组各项的形式，传入 [`applyMiddleware`](https://redux.js.org/api/applymiddleware) 中去。

### withStore()

`withStore(...modelNames)`

```js
const DemoConnected = connect(...withStore('modelA', 'modelB'))(Demo);
```

使用 `withStore` 将 model 中所有的 state 和 action 注入组件的 props 中，可以注入多个 model。

`withStore` 必须以 [剩余参数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Rest_parameters) 的语法传入 `connect()`。

### action

```js
actions: {
  someAction() {
    // action 的 `this` 中有些什么？

    // this.state -> 获取 state
    // this.setState() -> 更新 state
    // this.someOtherAction() -> 调用 action

    // this.someModel.state -> 获取其它 model 的 state
    // this.someModel.someAction() -> 调用其它 model 的 action
  },
  async someAsyncAction() {
    // 自动添加的 `loading.someAsyncAction` 可供使用
  }
}
```

## FAQ

### 异步引入 model？

`createStore` 初始化 store，接着使用 [loadable-components](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) 去动态引入组件与 model。

然后使用 `store.addModel(name, model)` 将异步引入的 model 注入 store。

一个使用 loadable-components 的示例：

```jsx harmony
import React from 'react';
import loadable from 'loadable-components';

const AsyncCounter = loadable(async (store) => {
  const [{ default: Counter }, { default: model }] = await Promise.all([
    import('./counter/index.jsx'),
    import('./counter/model'),
  ]);
  store.addModel('counter', model); // 将异步引入的 model 注入 store
  return (props) => <Counter {...props} />;
});
```

### 自定义 state 与 actions？

需要对注入组件的 props 进行定制时，可使用 [`mapStateToProps` 与 `mapDispatchToProps`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments) 来替代 `withStore`。

```jsx harmony
const mapState = ({ counter: { value } }) => ({
  value,
});

const mapActions = ({ counter: { increment, incrementAsync } }) => ({
  increment,
  incrementAsync,
});
// `mapDispatchToProps` 的第一个参数是 `dispatch`。
// `dispatch` 是一个函数，但在上面的 `mapActions` 中，我们把它当做一个对象来使用。
// Retalk 做了一些处理，它确实是 `dispatch` 函数，但在它上面绑定了所有的 model。

export default connect(
  mapState,
  mapActions,
)(Counter);
```

### 支持热更新？

例如将`index.js` 改为：

```jsx harmony
if (module.hot) {
  module.hot.accept('./App', () => {
    render();
  });
}
```

则 `Provider` 必须在 `App` 组件内：

```jsx harmony
const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
```

如果想保持 store，将 `store.js` 改为：

```js
if (!window.store) {
  window.store = createStore({ ... });
}

export default window.store;
```

### Proxy 报错?

Retalk 中使用了 `Proxy`，如果老版本浏览器不支持，请尝试 [proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill)。

## 协议

[MIT License](https://github.com/nanxiaobei/retalk/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
