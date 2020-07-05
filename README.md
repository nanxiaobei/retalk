<img src="./logo.png" width="228" alt="Retalk">

The simplest solution for Redux.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/retalk?style=flat-square)](https://bundlephobia.com/result?p=retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

English | [简体中文](./README.zh-CN.md)

---

## Why

- **Simplest Redux** - Same syntax as React components.
- **Only 2 API** - `setStore()` and `withStore()`.
- **Async models** - Fully code splitting support for models.
- **Auto loading** - Auto loading state for async actions.

## Install

```sh
yarn add retalk

# or

npm install retalk

```

## Usage

### 1. Models

Usually we'll set several routes in our app, one route with one model, so we'll have several models.

Write the model like a React component, just without the lifecycle methods.

```js
class CounterModel {
  state = {
    count: 0,
  };
  add() {
    // this.state -> Get state of own model
    // this.setState() -> Set state of own model
    // this.someAction() -> Call actions of own model

    // this.models.someModel.state -> Get state of other models
    // this.models.someModel.someAction() -> Call actions of other models

    const { count } = this.state;
    this.setState({ count: count + 1 });
  }
  async addLater() {
    // Auto `someAsyncAction.loading` state can be use

    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.add();
  }
}
```

### 2. Store

Use `setStore()` to setup all models with theirs namespaces.

```js
import { setStore } from 'retalk';

const store = setStore({
  counter: CounterModel,
  // Other models...
});
```

### 3. Views

Use `withStore()` to connect models and components.

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

Use `<Provider>` to provide the store to your app.

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

## Demo

[![Edit retalk](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/retalk-5l9mqnzvx?fontsize=14)

## API

### 1. setStore()

```
const store = setStore(models, middleware);
```

Pass `models` and `middleware`(both are optional), Setup the one and only store.

In `development` mode, [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension) will be enabled by default, make sure its version [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) and [not v2.16.0](https://stackoverflow.com/a/53512072/6919133).

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

Eject one or more models' state and actions to a component's props.

There are 3 ways to use it:

#### 2.1. Use string to eject all

```js
const CounterWrapper = withStore('home', 'counter')(Counter);
```

Simplest way, but if some unused props are injected, it will also trigger a re-rendering to affect performance.

> This method can be used if it is determined that all injected props will be used, or rapid development will be given priority rather than performance.

#### 2.2. Use object to customize

```js
const CounterWrapper = withStore({
  home: ['name', 'setName'],
  counter: ['count', 'add', 'addLater'],
})(Counter);
```

Customize the injected props, only inject the needed props, so as to optimize the performance.

#### 2.3. Use `mapStateToProps()`... to customize more

```js
const CounterWrapper = withStore(mapStateToProps, mapDispatchToProps)(Counter);
```

For more customization of the injected props, you can use [`mapStateToProps`, `mapDispatchToProps`](https://react-redux.js.org/api/connect) etc.

At that time, `withStore()` will be used as `connect()`.

### 3. \<Provider> & batch()

Just `redux-redux`'s [`Provider`](https://react-redux.js.org/api/provider) and [`batch()`](https://react-redux.js.org/api/batch).

You can import them from `retalk` to simplify development.

## FAQ

### Async import models?

Setup the store with `setStore()`, then use libs like [`loadable-components`](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) to import components and models.

Then, use `store.add()` to eject models to store.

Here is an example with `loadable-components`:

```jsx harmony
import React from 'react';
import loadable from 'loadable-components';

const AsyncCounter = loadable(async () => {
  const [{ default: Counter }, { default: CounterModel }] = await Promise.all([
    import('./Counter/index.jsx'),
    import('./Counter/Model.js'),
  ]);
  store.add({ counter: CounterModel }); // Use `store.add(models)`, like `setStore(models)`
  return (props) => <Counter {...props} />;
});
```

## License

[MIT](https://github.com/nanxiaobei/retalk/blob/master/LICENSE) © [nanxiaobei](https://mrlee.me/)
