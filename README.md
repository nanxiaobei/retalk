# <img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

**Redux Never So Simple**

Retalk is a best practice for Redux. just simple, small, smooth, and smart.

It helps you write Redux easy and clear than ever before, forget about action types, action creators and so on, no more annoying boilerplate code. On top of that, it even provides full support for async import store (code splitting) and automatically handled the loading state.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm](https://img.shields.io/npm/v/retalk.svg)](https://www.npmjs.com/package/retalk)
[![npm](https://img.shields.io/npm/dt/retalk.svg)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

## Features

* ⚡️ **Simplest Redux practice** only `state` and `actions` need to care, if you like.
* 👌 But I still want `reducers`! ok, that's fine.
* 💄 **Just two API** `createStore` and `withStore` (optional helper function), no more annoying concepts.
* 🚚️ **Dynamic import store** `() => import()` for code splitting and `store.addModel` for injecting dynamic imported model to store.
* 🚀 **Automatically `loading` state** only main state you need to care.
* 🙈 **`dispatch` support** not recommend, but you can still use `dispatch`.

## Getting started

Install with yarn:

```shell
yarn add retalk
```

or with npm:

```shell
npm install retalk
```

### Step 1: Store

**createStore** creates the store.

#### store.js

```js
import { createStore } from 'retalk'
import counter from './counter'

const store = createStore({
  counter
})

export default store
```


### Step 2: Model

**model** brings `state`, `reducers` \[optional\], and `actions` together in one place.

#### 1. counter.js (state, actions)

```js
const counter = {
  state: {
    count: 0
  },
  actions: {
    add() {
      const { count } = this.state
      this.setState({ count: count + 1 })
    },
    async addAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.add()
    }
  })
}

export default counter
```

<hr>

But I want `reducers`, not only `this.setState` to update state!

ok...

#### 2. counter.js (state, reducers, actions)

```js
const counter = {
  state: {
    count: 0
  },
  rerucers: {
    add(state) {
      // need to return new model state
      return { ...state, count: state.count + 1 }
    }
  },
  actions: {
    async addAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.setState() // NO!
      this.add() // YES
    }
  })
}

export default counter
```

*If `reducers` exists in model, `setState` will disappear in action's context, you can only use reducers like `add` to update state*

<hr>

**What can I use in action's `this` context?**

```js
export const counter = {
  actions: {
    add() {
      // # SELF MODEL
      // this.state
      // this[reducer] (`reducers` √)
      // this[action]

      // this.setState(state) (`reducers` ☓)

      // # OTHER MODEL
      // this.otherModel.state
      // this.otherModel[reducer] (otherModel `reducers` √)
      // this.otherModel[action]

      // this.setState('otherModel', state) (`reducers` ☓)
    }
  })
}
```

### Step 3: View

Retalk can be used with "react-redux".

#### CounterPage.js

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'
import { withStore } from 'retalk' // optional
import store from './store'

// Use automatically `loading` [object] state here
const Counter = ({ loading, count, add, addAsync }) => (
  <div style={{ opacity: loading.addAsync ? 0.5 : 1 }}>
    The count is {count}
    <button onClick={add}>add</button>
    <button onClick={addAsync}>addAsync</button>
  </div>
)

const mapState = ({ counter: { loading, count } }) => ({
  loading, // yes! you can get `loading` state
  count
})
const mapMethods = ({ counter: { add, addAsync }}) => ({
  add,
  addAsync
})
const CounterPage = connect(mapState, mapMethods)(Counter)

ReactDOM.render(
  <Provider store={store}>
    <CounterPage />
  </Provider>,
  document.getElementById('root')
)
```

*As we know, first param to [mapDispatchToProps](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments) is `dispatch`, `dispatch` is a function!, but in above `mapMethods` we treat it like it's a object. Yes, `retalk` did some trick here, it's `dispatch` function, but bound model methods to it!*

## What's More?

### Dynamic import

#### createStore

```js
// 1. Static import (store: [Object])
const store = createStore({
  counter
})

// 2. Dynamic import (store: [Promise])
const store = createStore({
  counter: () => import(./counter)
})

// 3. Or even mixin them! (store: [Promise])
const store = createStore({
  counter,
  otherModel: () => import(./otherModel)
})

```

If async import model in `createStore`, then in entry file you need to write like this.

```jsx
import asyncStore from './store'

const start = async () => {
  const store = await asyncStore
  ReactDOM.render(
    <Provider store={store}>
      <CounterPage />
    </Provider>,
    document.getElementById('root')
  )
}

start()
```


#### store.addModel

Actually, above is just code splitting when initialize store, what we really want is when we enter the page, then load page's model, not load them together when initialize store.

We need some help to achieve this goal.

You can use code splitting libraries like [react-loadable](https://github.com/jamiebuilds/react-loadable#loading-multiple-resources) or [loadable-components](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) to dynamic import page component and model together.

Here is a `loadable-components` example below

```js
import React from 'react'
import loadable from 'loadable-components'

const AsyncCounterPage = loadable(async store => {
  const [{ default: CounterPage }, { default: counter }] = await Promise.all([
    import('./CounterPage'),
    import('./counter'),
  ])
  store.addModel('counter', counter)
  return props => <CounterPage {...props} />
})
```


### withStore helper (recommend)

Use `withStore` helper to pass whole model to component, param is model's name \[string\], you can even pass more than one model name.

```jsx
// one
const CounterPage = connect(...withStore('counter'))(Counter)

// more
const CounterPage = connect(...withStore('common', 'counter', ...))(Counter)
```

*`withStore` must be passed in [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) syntax to `connect`.*

### Automatically loading handle

`retalk` will automatically add a `loading` \[object\] state to every model. Keys in the object is async action's names, values are booleans, whether or not the async action is in process.

Here is an example.

```js
// in actions
const counter = {
  actions: {
    actionA() {},
    actionB() {},
    async actionC() {},
    actionD() {},
    async actionE() {},
    async actionF() {},
  }
}

// in counter's state
state.loading = {
  actionC: false,
  actionE: true, // if in process
  actionF: false
}
```

`retalk` will check if an action is async, we recommend to use `async / await` syntax to define an async action.

### Dispatch (not recommend)

Highly not recommend, but if you want, **dispatch** is also support, but in a different (simple) way to call.

```js
// Don't pass `mapMethods` to `connect`, then you get `dispatch`
// See: [https://github.com/reduxjs/react-redux/blob/master/docs/api.md#inject-dispatch-and-todos]

const CounterPage = connect(mapState)(Counter)

// Call `dispatch` in component, (not support in model actions)

// call reducers
dispatch('counter/add', 1) // add(state, num) { // num is `1` }
dispatch('counter/add', 1, 2) // add(state, a, b) { // a is `1`, b is `2` }

// call actions
dispatch('counter/addAsync', 1) // addAsync(num) { // num is `1` }
dispatch('counter/addAsync', 1, 2) // addAsync(a, b) { // a is `1`, b is `2` }
```

## API

More detailed docs will coming soon.

---

Like Retalk? ⭐ us on GitHub. 😊
