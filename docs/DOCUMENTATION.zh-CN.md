# 文档

- [概念](#概念)
  - [Model](#model)
  - [Store](#store)
  - [View](#view)
- [API](#concepts)
  - [createStore](#createstore)
  - [withStore](#withstore)
- [指南](#指南)
  - [异步引入 model](#异步引入-model)
  - [自定义 state 与 actions](#自定义-state-与-actions)
  - [使用 Redux 时热更新](#使用-redux-时热更新)

## 概念

### Model

Model 将 `state` 和 `actions` 集合于一处。通常，你会有多个 model。

#### `state`

类型：`Object`

Retalk 会自动添加 `loading` 对象到 `state` 中。

```js
// state.loading

state: {
  loading: {
    asyncActionA: false,
    asyncActionB: false,
    asyncActionC: true, // 正在请求
  }
}
```

#### `actions`

类型：`Object`

单个 action 是一个函数，可以是同步函数也可以是异步函数。

在 action 中，使用 `this.state` 获取 state，使用 `this.setState` 更新 state。

同 React 组件中的语法一致， 但需注意它们是不同的东西。

```js
actions: {
  add() {
    // `this` 中有些什么？

    // this.state
    // this.setState
    // this[actionName]

    // this[modelName].state
    // this[modelName][actionName]
  },
  async asyncAdd() {
    // 使用 `async / await` 语法定义一个异步 action
    // 自动添加的 `loading.asyncAdd` 可供使用
  }
}
```

### Store

Store 将 `models` 集合在一起，它是连接 model 与 view 的一座桥梁。

使用 [`createStore`](#createstore) 去生成唯一的 Redux store。

### View

View 是一个 React 组件。

使用 [`connect`](https://react-redux.js.org/introduction/quick-start#provider-and-connect)（来自 `react-redux`）和 [`withStore`](#withstore) 去连接 store 与 view。

接着即可在组件中使用所有的 `state` 与 `actions`。

## API

### createStore

`createStore(models[, options])`

```js
import { createStore } from 'retalk';

createStore(
  {
    modelA: { state, actions },
    modelB: { state, actions },
  },
  {
    useDevTools: true,
    plugins: [logger],
  },
);
```

#### options.useDevTools

类型：`boolean`，默认：`false`

> 启用 [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
>
> 务必确保插件的版本 [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) 且[不是 v2.16.0](https://stackoverflow.com/a/53512072/6919133)。

#### options.plugins

类型：`Array`，默认：`[]`

> 传递中间件到 `[applymiddleware](https://redux.js.org/api/applymiddleware)` 中。

### withStore

`withStore(...modelNames)`

```js
import { withStore } from 'retalk';

connect(...withStore('modelA', 'modelB'))(component);
```

使用 `withStore` 将所有的 `state` 和 `actions` 注入组件的 props 中，可以注入多个 model。

`withStore` 比如使用 [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) 语法传递给 `connect`。

## 指南

### 异步引入 model

首先，使用 `createStore` 初始化 store。

接着使用 [react-loadable](https://github.com/jamiebuilds/react-loadable#loading-multiple-resources) 或 [loadable-components](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) 去动态引入组件与 model。

使用 `loadable-components` 示例：

```jsx
import React from 'react';
import loadable from 'loadable-components';

const AsyncDemo = loadable(async (store) => {
  const [{ default: Demo }, { default: model }] = await Promise.all([
    import('./demo/index.jsx'),
    import('./demo/model'),
  ]);
  store.addModel('demo', model);
  return (props) => <Demo {...props} />;
});
```

使用 `store.addModel(name: string, model: Object)` 将异步引入的 model 注入 store。

### 自定义 state 与 actions

当需要对注入组件的 props 进行定制时，可使用 [`mapStateToProps` 与 `mapDispatchToProps`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments) 来替代 `withStore`。

```jsx
const mapState = ({ demo: { value } }) => ({
  value,
});

const mapActions = ({ demo: { add, asyncAdd } }) => ({
  add,
  asyncAdd,
});
// `mapDispatchToProps` 的第一个参数是 `dispatch`。
// `dispatch` 是一个函数，但在上面的 `mapActions` 中，我们把它当成了一个对象来使用。
// Retalk 做了一些处理，它确实是 `dispatch` 函数，但在它上面绑定了所有的 model。

export default connect(
  mapState,
  mapActions,
)(Demo);
```

### 使用 Redux 时热更新

实现使用 Redux 时热更新的关键是，将 `Provider` 放在 `App.js` 里面，而不是外面。然后添加代码：

```js
if (module.hot) {
  module.hot.accept('./App', () => {
    render(App);
  });
}
```

一个完整的示例：[https://codesandbox.io/s/rw32xv1mv4](https://codesandbox.io/s/rw32xv1mv4)
