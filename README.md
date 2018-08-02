# <img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

Retalk is a best practice for Redux. just simple, small, smooth, and smart.

It helps you write Redux easy and clear than ever before, forget about action types, action creators, no more annoying boilerplate code. On top of that, it even supports async import model and smart loading state handling.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm](https://img.shields.io/npm/v/retalk.svg)](https://www.npmjs.com/package/retalk)
[![npm](https://img.shields.io/npm/dt/retalk.svg)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

## Features

* 🍺️ **Simplest Redux**: only `state` and `actions` need to write, if you like.
* 🎭 **Just two API**: `createStore` and `withStore`, no more annoying concepts.
* ⛵️ **Async import model**: `() => import()` for code splitting and `store.addModel` for model injecting.
* ⏳ **Smart `loading` state**: only main state you need to care.

## Getting started

Install with yarn:

```shell
yarn add retalk
```

Or with npm:

```shell
npm install retalk
```

### Step 1: Model

**count.js (state, actions)**

```js
const count = {
  state: {
    value: 0,
  },
  actions: {
    increase() {
      this.setState({ value: this.state.value + 1 });
    },
    async increaseAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.increase();
    },
  },
};

export default count;
```

**model** brings `state`, `reducers [optional]`, and `actions` together in one place.

In an action, use `this.state` to get state, `this.setState` to update state, `this.action` to call other actions. Just like the syntax in a React component.

How to reach other models? Add the namespace, e.g. `this.model.state`, `this.model.reducer`, `this.model.action`

That's all. Model is just simple like this, when you're using Retalk.

### Step 2: Store

**store.js**

```js
import { createStore } from 'retalk';
import count from './count';

const store = createStore({ count });

export default store;
```

### Step 3: View

**index.js**

```jsx
import 'babel-polyfill';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { withStore } from 'retalk';
import store from './store';

const Count = ({ value, increase, increaseAsync, loading }) => (
  <Fragment>
    <h3>Count: {value}</h3>
    <button onClick={increase}>+ 1</button>
    <button onClick={increaseAsync}>async + 1 {loading.increaseAsync ? '...' : ''}</button>
  </Fragment>
);

const CountWrapper = connect(...withStore('count'))(Count);

const App = () => (
  <Provider store={store}>
    <CountWrapper />
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

If an action is async, you can get `loading.action` state for loading if you like.

Well, only 3 steps, A simple Retalk demo is here: https://codesandbox.io/s/5l9mqnzvx.


## What's More?

### Use reducers

> I want different `reducers`, not only `this.setState` to update state...

Ok... below is what you want.

**count.js (state, reducers, actions)**

```js
const count = {
  state: {
    value: 0,
  },
  reducers: {
    increase(state) {
      // Need to return new state
      return { ...state, value: state.value + 1 };
    },
  },
  actions: {
    async increaseAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // this.setState(); NO `this.setState` HERE!
      this.increase(); // YES
    },
  },
};

export default count;
```

If `reducers` exists, `setState` will disappear in action's context, you can only use reducers like `increase` to update state.

### What's in action's `this` context?

```js
export const count = {
  actions: {
    increase() {
      // this.state
      // this.reducer (`reducers` √)
      // this.setState (`reducers` ☓)
      // this.action

      // this.model.state
      // this.model.reducer (`reducers` √)
      // this.model.setState (`reducers` ☓)
      // this.model.action
    },
  },
};
```

### Async import

**createStore**

```js
// 1. Static import (store: [Object])
const store = createStore({
  count,
});

// 2. Async import (store: [Promise])
const store = createStore({
  countAsync: () => import('./countAsync'),
});

// 3. Even mixin them! (store: [Promise])
const store = createStore({
  count,
  countAsync: () => import('./countAsync'),
});
```

If async import model in `createStore`, then in entry file you need to write like this.

```jsx
const start = async () => {
  const store = await asyncStore;
  const App = () => (
    <Provider store={store}>
      <CountWrapper />
    </Provider>
  );
  ReactDOM.render(<App />, document.getElementById('root'));
};

start();
```

**store.addModel**

Actually, above is just code splitting when initialize store, what we really want is when enter a page, then load page's model, not load them together when initialize store. We need some help to achieve this goal.

You can use code splitting libraries like [react-loadable](https://github.com/jamiebuilds/react-loadable#loading-multiple-resources) and [loadable-components](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) to dynamic import page component and model together.

Here is a `loadable-components` example.

```jsx
import React from 'react';
import loadable from 'loadable-components';

const AsyncBooks = loadable(async (store) => {
  const [{ default: Books }, { default: books }] = await Promise.all([
    import('./Books'),
    import('./books'),
  ]);
  store.addModel('books', books);
  return props => <Books {...props} />;
});
```

### Customize state and methods

You can pass `mapStateToProps` and `mapDispatchToProps` to `connect` when need some customization, without using `withStore`.

```jsx
const mapState = ({ count: { value } }) => ({
  value,
});

const mapMethods = ({ count: { increase, increaseAsync } }) => ({
  increase,
  increaseAsync,
});
// As we know, first param to `mapDispatchToProps` is `dispatch`, `dispatch` is a function,
// [mapDispatchToProps](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments)
// but in above `mapMethods`, we treat it like it's an object.
// Yes, Retalk did some tricks here, it's `dispatch` function, but bound model methods on it!

const CountWrapper = connect(mapState, mapMethods)(Count);
```

### Smart loading state

Retalk will add a `loading [object]` state to every model, then check if an action is async, here is an example.

```js
// In actions
const count = {
  actions: {
    actionA() {},
    actionB() {},
    async actionC() {},
    actionD() {},
    async actionE() {},
    async actionF() {},
  },
};

// In count's state
count.loading = {
  actionC: false,
  actionE: true, // If in process
  actionF: false,
};
```

We recommend to use `async / await` syntax to define an async action.

### Hot reloading with Redux

The key to achieving hot reloading with Redux is - put `Provider` in `App.js`, then add:

```js
if (module.hot) {
  module.hot.accept('./App', () => {
    render(App);
  });
}
```
Here is a working demo: https://codesandbox.io/s/rw32xv1mv4


## API

### `createStore`

```js
createStore({
  one: { state: {}, actions: {} },
  two: () => import('./two'),
});
```

`createStore(models, ?useReduxDevTools)`, `models` must be an object. `useReduxDevTools` is a boolean, you can pass `true` if you want to use [Redux DevTools extension](https://github.com/zalmoxisus/redux-devtools-extension). But remember, only support extension version >= 2.15.3, because previous version + `redux@^4.0.0` will result in a [bug](https://github.com/reduxjs/redux/issues/2943).

`model` in `models` must be an object or an `() => import()` function. If `model` is an object, `state` and `actions` must in it, and must all be objects. `reducers` is optional, if `reducers` exists, `reducers` must be an object too.

### `withStore`

```js
// one
withStore('count');

// more
withStore('count', 'model', ...modelNames);
```

Use `withStore(name)` to pass whole model to a component, param is model's name `[string]`, you can pass more than one model.

`withStore` must be passed in [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) syntax to `connect`.

```js
connect(...withStore('model'))(Component);
```

### `store.addModel`

```js
store.addModel('list', module.default);
```

Use `store.addModel(name, model)` to inject async model to store after imported. `name` is model's namespace in store, and `model` is an object with `state`, `reducers [optional]`, and `actions` in it.

### `this.setState`

```js
this.setState(nextState);
```

Just like `this.setState` function in a React component, `nextState` must be an object, it will be merge with the current state.

### `this.reducer`

```js
// Call reducer in actions or component
this.plusReducer(1, 2, 4);

// Params received in reducer
plusReducer(state, a, b, c) {
  // a: 1, b: 2, c: 4
  return { ...state, sum: state.sum + a + b + c };
}
```

### `this.action`

```js
// Call action in other actions or component
this.plusAction(1, 2, 4);

// Params received in action
plusAction(a, b, c) {
  // a: 1, b: 2, c: 4
  this.setState({ sum: this.state.sum + a + b + c });
}
```

---

Like Retalk? ★ us on GitHub.
