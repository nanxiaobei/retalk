<div align="center">
<img src="./logo.png" width="228" alt="Retalk">

The Simplest Solution for Redux.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/retalk?style=flat-square)](https://bundlephobia.com/result?p=retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

English · [简体中文](./README.zh-CN.md)

</div>

---

## Features

- **Simplest Redux** - Same syntax as Class Components.
- **Only 2 APIs** - `setStore()` and `withStore()`.
- **Async models** - Fully code splitting support for models.
- **Auto loading** - Auto loading state for async actions.

## Install

```sh
yarn add retalk

# npm i retalk
```

## Usage

Model syntax is like a React class component, just without lifecycle methods.

```jsx
import { setStore, withStore, Provider } from 'retalk';

// Setup model
class CounterModel {
  state = {
    count: 0,
  };
  add() {
    const { count } = this.state; // get own state
    this.setState({ count: ++count }); // set own state
    this.addAsync(); // run own action

    // this.models.someModel.state        -> get another model's state
    // this.models.someModel.someAction() -> run another model's action
  }
  async addAsync() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { count } = this.state;
    this.setState({ count: ++count });
  }
}

// Use in components
const Counter = withStore({
  counter: ['count', 'add', 'addAsync'],
})((props) => {
  const { count, add, addAsync } = props; // addAsync.loading can be use

  return (
    <div>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addAsync}>+ ⏳{addAsync.loading && '...'}</button>
    </div>
  );
});

// Setup store
const store = setStore({ counter: CounterModel });

const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
```

## Demo

[![Edit retalk](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/retalk-5l9mqnzvx?fontsize=14&file=/src/Counter/Index.jsx)

## API

### 1. setStore()

`setStore(models, middleware)`

```js
const store = setStore(
  {
    home: HomeModel,
    counter: CounterModel,
  },
  [logger, crashReporter]
);
```

Pass `models` and `middleware`(both are optional), Set up the one and only store.

In `development` mode, [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension) will be enabled by default, make sure its version [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) and [not v2.16.0](https://stackoverflow.com/a/53512072/6919133).

### 2. withStore()

`withStore(...modelNames)(Component)`

Eject state and actions of one or more models, to the props of a component. 3 ways to use it:

####

```js
// 1. Use string to eject all
const Wrapper = withStore('home', 'counter')(Counter);

// The simplest way, but unused props will also trigger re-render.
// Use this if all injected props will be used, or to rapid develop.
```

```js
// 2. Use object to customize
const Wrapper = withStore({
  home: ['name', 'setName'],
  counter: ['count', 'add', 'addAsync'],
})(Counter);

// Customize the injected props, only inject the needed props.
```

```js
// 3. Use `mapStateToProps()`... to customize more
const Wrapper = withStore(mapStateToProps, mapDispatchToProps)(Counter);

// For more customization of the injected props,
// use `mapStateToProps`, `mapDispatchToProps` etc.
// react-redux.js.org/api/connect
```

### 3. Provider & batch()

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

const Wrapper = loadable(async () => {
  const [{ default: Counter }, { default: CounterModel }] = await Promise.all([
    import('./Counter/index.jsx'),
    import('./Counter/Model.js'),
  ]);
  store.add({ counter: CounterModel }); // use `store.add(models)` just like `setStore(models)`
  return (props) => <Counter {...props} />;
});
```

## License

[MIT](https://github.com/nanxiaobei/retalk/blob/master/LICENSE) © [nanxiaobei](https://lee.so/)

## FUTAKE

Try [**FUTAKE**](https://sotake.com/f) in WeChat. A mini app for your inspiration moments. 🌈

![FUTAKE](https://s3.jpg.cm/2021/09/21/IFG3wi.png)
