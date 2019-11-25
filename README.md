<img src="./logo/retalk.png" width="280" alt="Retalk">

Simplest solution for Redux, write Redux like React.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/retalk?style=flat-square)](https://bundlephobia.com/result?p=retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

English | [简体中文](./README.zh-CN.md)

---

## Why

- **Simplest Redux** - Same syntax as a React component.
- **Only 2 API** - `setStore()` and `withStore()`.
- **Async models** - Fully code splitting support for models.
- **Auto loading** - Auto loading state for async actions.

## Install

```sh
yarn add retalk
```

or

```sh
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
  increment() {
    // this.state -> Get own model's state
    // this.setState() -> Set own model's state
    // this.someAction() -> Call own model's actions

    // this.models.someModel.state -> Get other models' state
    // this.models.someModel.someAction() -> Call other models' actions

    const { count } = this.state;
    this.setState({ count: count + 1 });
  }
  async incrementAsync() {
    // Auto `someAsyncAction.loading` state can be use

    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.increment();
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
  [logger, crashReporter],
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
  counter: ['count', 'increment', 'incrementAsync'],
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

### 1. Async import models?

Setup the store with `setStore()`, then use ibraries like [`loadable-components`](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) to import components and models.

Then, use `store.add(models)` to eject the imported models to the store.

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

### 2. Support HMR?

Change the entry file `index.js` to:

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

Make sure that `<Provider>` is inside the `<App>` component:

```jsx harmony
const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
```

### 3. Migrate from v2 to v3?

#### 3.1. Models

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

#### 3.2. Store

```diff
- import { createStore } from 'retalk';
+ import { setStore } from 'retalk';

- const store = createStore({ counter }, { plugins: [logger] });
+ const store = setStore({ counter: CounterModel }, [logger]);
```

#### 3.3. Views

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

#### 3.4. App

```diff
- import { Provider } from 'react-redux';
+ import { Provider } from 'retalk';
```

## License

[MIT](https://github.com/nanxiaobei/retalk/blob/master/LICENSE) © [nanxiaobei](https://mrlee.me/)
