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

- **Simplest Redux** - Write React? then everything is ok.
- **Only 3 API** - `setStore()`, `withStore()`, `<Provider>`.
- **Async model** - Fully code splitting support for models.
- **Auto loading** - Auto loading state for async methods.

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

Usually we split our app into several routes, one model for one route.

Write the model like a React component, just without the lifecycle methods.

```js
class CounterModel {
  state = {
    count: 0,
  };
  increment() {
    // this.state -> Get own model's state
    // this.setState() -> Set own model's state
    // this.someOtherAction() -> Call own model's actions

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

`setStore(models, middleware)`

```js
const store = setStore({ a: AModel, b: BModel }, [middleware1, middleware2]);
```

Setup the one and only store.

Since `3.0.0`, In `development` mode, [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension) will be enabled by default, make sure its version [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) and [not v2.16.0](https://stackoverflow.com/a/53512072/6919133).

### 2. withStore()

`withStore(...modelNames)(Component)`

```js
const DemoWrapper = withStore('a', 'b')(Demo);
```

Eject one or more models' state and actions to a component's props.

### 3. \<Provider>

`<Provider store={store}>`

Wrap your app with it to access the store.

## FAQ

### 1. Async import model?

Setup the store with `setStore()`, then use ibraries like [`loadable-components`](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) to import components and models.

Then, use `store.add(models)` to eject models to store.

Here is an example with `loadable-components`:

```jsx harmony
import React from 'react';
import loadable from 'loadable-components';

const AsyncCounter = loadable(async (store) => {
  const [{ default: Counter }, { default: CounterModel }] = await Promise.all([
    import('./Counter/index.jsx'),
    import('./Counter/Model'),
  ]);
  store.add({ counter: CounterModel }); // Pass `models` to `store.add()`, like `setStore()`
  return (props) => <Counter {...props} />;
});
```

### 2. Customize state and actions?

Use [`mapStateToProps` and `mapDispatchToProps`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments) when need some customization, without passing model names to `withStore()`.

```jsx harmony
const mapState = ({ counter: { count } }) => ({
  count,
});

const mapActions = ({ counter: { increment, incrementAsync } }) => ({
  increment,
  incrementAsync,
});

// First parameter to `mapDispatchToProps` is `dispatch`, `dispatch` is a function,
// but in the `mapActions` above, we treat it like an object.
// Retalk did some tricks here, it's the `dispatch` function, but bound models to it.

export default withStore(mapState, mapActions)(Counter);
```

### 3. Support HMR?

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

`<Provider>` must be inside the `<App>` component:

```jsx harmony
const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
```

## Migrate from v2 to v3

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

## License

[MIT](https://github.com/nanxiaobei/retalk/blob/master/LICENSE) © [nanxiaobei](https://mrlee.me/)
