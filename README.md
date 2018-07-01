# <img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

**Redux Never So Simple**

Retalk is a best practice for Redux. just simple, small, smooth, and smart.

It helps you write Redux easy and clear than ever before, forget about action types, action creators, no more annoying boilerplate code. On top of that, it even supports async import model and automatically loading state.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm](https://img.shields.io/npm/v/retalk.svg)](https://www.npmjs.com/package/retalk)
[![npm](https://img.shields.io/npm/dt/retalk.svg)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

## Features

* 🎉 **Simplest Redux practice**: only `state` and `actions` need to care, if you like.
* 💄 **Just two API**: `createStore` and `withStore` (optional helper), no more annoying concepts.
* 🚚️ **Async import model**: `() => import()` for code splitting and `store.addModel` for model injecting.
* 🚀 **Automatically `loading` state**: only main state you need to care.

## Getting started

Install with yarn:

```shell
yarn add retalk
```

Or with npm:

```shell
npm install retalk
```

### Step 1: Store

#### store.js

```js
import { createStore } from 'retalk';
import count from './count';

const store = createStore({
  count,
});

export default store;
```

### Step 2: Model

**model** brings `state`, `reducers [optional]`, and `actions` together in one place.

#### count.js (state, actions)

```js
const count = {
  state: {
    count: 0,
  },
  actions: {
    add() {
      this.setState({ count: this.state.count + 1 });
    },
    async addAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.add();
    },
  },
};

export default count;
```

Use `this.setState` to update state and `this[action]` to call other actions, just like in a React component.

Umm... That's all, Redux is simple like this, when you using Retalk.

### Step 3: View

#### App.js

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { withStore } from 'retalk';
import store from './store';

const Count = ({ count, add, addAsync }) => (
  <div>
    The count is {count}
    <button onClick={add}>add</button>
    <button onClick={addAsync}>addAsync</button>
  </div>
);

const App = connect(...withStore('count'))(Count);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
```

## What's More?

### Async import

#### createStore

```js
// 1. Static import (store: [Object])
const store = createStore({
  count,
});

// 2. Async import (store: [Promise])
const store = createStore({
  count: () => import('./count'),
});

// 3. Even mixin them! (store: [Promise])
const store = createStore({
  count,
  otherModel: () => import('./otherModel'),
});
```

If async import model in `createStore`, then in entry file you need to write like this.

```jsx
import asyncStore from './store';

const start = async () => {
  const store = await asyncStore;
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
};

start();
```

#### store.addModel

Actually, above is just code splitting when initialize store, what we really want is when enter a page, then load page's model, not load them together when initialize store. We need some help to achieve this goal.

You can use code splitting libraries like [react-loadable](https://github.com/jamiebuilds/react-loadable#loading-multiple-resources) and [loadable-components](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) to dynamic import page component and model together.

Here is a `loadable-components` example.

```js
import React from 'react';
import loadable from 'loadable-components';

const AsyncPage = loadable(async store => {
  const [{ default: Page }, { default: count }] = await Promise.all([
    import('./Page'),
    import('./count'),
  ]);
  store.addModel('count', count);
  return props => <Page {...props} />;
});
```

### Use reducers

> I want different `reducers`, not only `this.setState` to update state...

Ok... Below is what you want!

#### count.js (state, reducers, actions)

```js

const count = {
  state: {
    count: 0,
  },
  rerucers: {
    add(state) {
      // Need to return new state
      return { ...state, count: state.count + 1 };
    },
  },
  actions: {
    async addAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // this.setState(); ERROR: NO `this.setState` HERE!
      this.add(); // YES
    },
  },
};

export default count;
```


If `reducers` exists, `setState` will disappear in action's context, you can only use reducers like `add` to update state.

### What's in action's `this` context?

```js
export const count = {
  actions: {
    add() {
      // OWN
      // this.state
      // this.setState(state) (`reducers` ☓)
      // this[reducer] (`reducers` √)
      // this[action]

      // OTHER
      // this.otherModel.state
      // this.otherModel[reducer] (otherModel `reducers` √)
      // this.otherModel[action]
    },
  },
};
```

### Customize state and methods

You can just pass `mapStateToProps` and `mapDispatchToProps` to `connect` when need some customization, without using `withStore`.

```jsx
const mapState = ({ count: { count } }) => ({
  count,
});

const mapMethods = ({ count: { add, addAsync } }) => ({
  add,
  addAsync,
});
// As we know, first param to `mapDispatchToProps` is `dispatch`, `dispatch` is a function,
// [mapDispatchToProps](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments)
// but in above `mapMethods`, we treat it like it's an object.
// Yes, Retalk did some trick here, it's `dispatch` function, but bound model methods!

const App = connect(mapState, mapMethods)(Count);
```

### Automatically loading state

Retalk will check if an action is async, then automatically add a `loading` \[object\] state to every model, here is an example.

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
state.loading = {
  actionC: false,
  actionE: true, // If in process
  actionF: false,
};

// Use `loading` in component
const Count = ({ loading, count, add, addAsync }) => (
  <div className={loading.addAsync ? 'loading' : 'loaded'}>
    The count is {count}
    <button onClick={add}>add</button>
    <button onClick={addAsync}>addAsync</button>
  </div>
);
```

We recommend to use `async / await` syntax to define an async action.

## API

### `createStore`

`createStore(models)`, `models` must be an object.

```js
const models = {
  modelA: { state: {}, actions: {} },
  modelB: () => import('./modelB'),
};
```

`modelA` and `modelB` is `model`, `model` must be an object or an `import` function.

 If `model` is an object, `state` and `actions` must in it, and are all objects. `reducers` is optional, if `reducers` exists, `reducers` must be an object too.

### `withStore`

Use `withStore` helper to pass whole model to component, param is model's name `[string]`, you can pass more than one model.

```js
// one
withStore('count');

// more
withStore('count', 'otherModel', ...);
```

`withStore` must be passed in [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) syntax to `connect`.

```js
connect(...withStore('model'))(Component);
```

### `store.addModel`

Use `store.addModel(name, model)` to inject async model to store after imported. `name [string]` is model's namespace in store, and `model` is an object with `state`, `reducers [optional]`, and `actions` in it.

### `this.setState`

Just like `this.setState` in a React component (different when set other model's state).

```js
// Set own state
this.setState(nextState);

// Set other model's state
this.setState('otherModel', nextState).
```

`nextState` must be an object, it will be merge with the previous model state.

---

Like Retalk? ★ us on GitHub.
