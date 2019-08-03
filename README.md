<div align="center">

<img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

Retalk is a best practice for Redux. just simple, smooth, and smart.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

English | [简体中文](./README.zh-CN.md)

</div>

---

## Features

- **Simplest Redux:** Just `state` and `actions`, clear than ever before.
- **Two API totally:** `createStore` and `withStore`, no more annoying concepts.
- **Async import model:** Fully code splitting support for models.
- **Auto `loading` state:** Send request, and loading state is ready to use.

## Install

```sh
yarn add retalk
```

or

```sh
npm install retalk
```

## Usage

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

## Demo

[![Edit retalk](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/retalk-5l9mqnzvx?fontsize=14)

## API

### createStore()

`createStore(models[, options])`

```js
const store = createStore({ modelA, modelB }, { useDevTools: false, plugins: [logger] });
```

#### options.useDevTools

type: `boolean`, default: `true`. Enable [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension), make sure the extension's version [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) and [not v2.16.0](https://stackoverflow.com/a/53512072/6919133).

#### options.plugins

type: `array`, default: `[]`. Add one middleware as an item to this array, passed to [`applyMiddleware`](https://redux.js.org/api/applymiddleware).

### withStore()

`withStore(...modelNames)`

```js
const DemoConnected = connect(...withStore('modelA', 'modelB'))(Demo);
```

Use `withStore` to eject all state and actions of a model to a component's props, you can eject more than one model.

`withStore` must be passed in [rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) syntax to `connect()`.

### action

```js
actions: {
  someAction() {
    // What's in an action's `this` context?

    // this.state -> Get state
    // this.setState() -> Set state
    // this.someOtherAction() -> Call actions

    // this.someModel.state -> Get another model's state
    // this.someModel.someAction() -> Call another model's actions
  },
  async someAsyncAction() {
    // Automatically `loading.someAsyncAction` can be use
  }
}
```

## FAQ

### Async import model?

Use `createStore` to initalize the store, then use libraries like [loadable-components](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) to dynamic import both the component and model.

Then use `store.addModel(name, model)` to eject the async imported model to store.

Here is a loadable-components example:

```jsx harmony
import React from 'react';
import loadable from 'loadable-components';

const AsyncCounter = loadable(async (store) => {
  const [{ default: Counter }, { default: model }] = await Promise.all([
    import('./counter/index.jsx'),
    import('./counter/model'),
  ]);
  store.addModel('counter', model); // Key to import async model
  return (props) => <Counter {...props} />;
});
```

### Customize state and actions?

Use [`mapStateToProps` and `mapDispatchToProps`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments) when need some customization, without using `withStore`.

```jsx harmony
const mapState = ({ counter: { count } }) => ({
  count,
});

const mapActions = ({ counter: { increment, incrementAsync } }) => ({
  increment,
  incrementAsync,
});
// First parameter to `mapDispatchToProps` is `dispatch`.
// `dispatch` is a function, but in `mapActions` above, we treat it like an object.
// Retalk did some tricks here, it's the `dispatch` function, but bound models on it.

export default connect(
  mapState,
  mapActions,
)(Counter);
```

### Support HMR?

For example change `index.js` to:

```jsx harmony
if (module.hot) {
  module.hot.accept('./App', () => {
    render();
  });
}
```

Then `Provider` must inside the `App` component:

```jsx harmony
const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
```

If want to keep the store, change `store.js` to:

```js
if (!window.store) {
  window.store = createStore({ ... });
}

export default window.store;
```

### Proxy error?

Retalk uses `Proxy`, if old browsers not support, please try [proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill).

## License

[MIT License](https://github.com/nanxiaobei/retalk/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
