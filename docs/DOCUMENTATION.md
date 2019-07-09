# Documentation

English | [简体中文](./DOCUMENTATION.zh-CN.md)

- [Concepts](#concepts)
  - [Model](#model)
  - [Store](#store)
  - [View](#view)
- [API](#api)
  - [createStore](#createstore)
  - [withStore](#withstore)
- [Guides](#guides)
  - [Async import model](#async-import-model)
  - [Customize state and actions](#customize-state-and-actions)
  - [Hot reloading with Redux](#hot-reloading-with-redux)

## Concepts

### Model

Model brings `state` and `actions` together in one place. Typically, you will have several models.

#### `state`

type: `object`

Set the initial state of model here.

Retalk will add `loading: object` to `state` automatically, structure is like this:

```js
// Use state.loading directly, no need to add manually

state: {
  loading: {
    asyncActionA: false,
    asyncActionB: false,
    asyncActionC: true, // When requesting
  }
}
```

#### `actions`

type: `object`

A single action is a function, it can be sync or async.

In an action, you can use `this.state` and `this.setState()`, just like APIs in a React component.

```js
actions: {
  add() {
    // What's in `this` context?

    // this.state -> Get state
    // this.setState() -> Set state
    // this[actionName]() -> Call action

    // this[modelName].state -> Get another model's state
    // this[modelName][actionName]() -> Call another model's action
  },
  async asyncAdd() {
    // Use `async / await` syntax to define an async action
    // Automatically `loading.asyncAdd` can be use
  }
}
```

### Store

Store brings `models` together, it's the bridge between model and view.

Use [`createStore`](#createstore) to generate the one and only Redux store.

### View

View is a React component.

Use [`connect`](https://react-redux.js.org/introduction/quick-start#provider-and-connect) (from `react-redux`) and [`withStore`](#withstore) to connect store and view.

Then you can use all `state` and `actions` in the component.

## API

### createStore

`createStore(models: object, options?: object)`

```js
import { createStore } from 'retalk';

createStore({ modelA, modelB }, { useDevTools: false, plugins: [logger] });
```

#### options.useDevTools

type: `boolean`, default: `true`

> Enable [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
>
> Make sure the extension's version should [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) and [not v2.16.0](https://stackoverflow.com/a/53512072/6919133).

#### options.plugins

type: `array`, default: `[]`

> Add middleware as an item in an array, passed to [`applyMiddleware`](https://redux.js.org/api/applymiddleware).

### withStore

`withStore(...modelNames)`

```js
import { withStore } from 'retalk';

connect(...withStore('modelA', 'modelB'))(component);
```

Use `withStore` to eject all `state` and `actions` to a component's props, you can eject more than one model.

`withStore` must be passed in [rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) syntax to `connect`.

## Guides

### Async import model

First, use `createStore` to initialize store.

Then use libraries like [react-loadable](https://github.com/jamiebuilds/react-loadable#loading-multiple-resources) (or [loadable-components](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel)) to dynamic import both component and model.

Then use `store.addModel(name: string, model: object)` to eject the async imported model to store.

Here is a loadable-components example:

```jsx
import React from 'react';
import loadable from 'loadable-components';

const AsyncDemo = loadable(async (store) => {
  const [{ default: Demo }, { default: model }] = await Promise.all([
    import('./demo/index.jsx'),
    import('./demo/model'),
  ]);
  store.addModel('demo', model); // Key to import async model
  return (props) => <Demo {...props} />;
});
```

### Customize state and actions

Use [`mapStateToProps` and `mapDispatchToProps`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#arguments) when you need some customization, without using `withStore`.

```jsx
const mapState = ({ demo: { value } }) => ({
  value,
});

const mapActions = ({ demo: { add, asyncAdd } }) => ({
  add,
  asyncAdd,
});
// First parameter to `mapDispatchToProps` is `dispatch`.
// `dispatch` is a function, but in `mapActions` above, we treat it like an object.
// Retalk did some tricks here, it's the `dispatch` function, but bound models on it.

export default connect(
  mapState,
  mapActions,
)(Demo);
```

### Hot reloading with Redux

The key to hot reloading with Redux is, put `Provider` inside `App.js`, not outside! then add code:

```js
if (module.hot) {
  module.hot.accept('./App', () => {
    render(App);
  });
}
```

Here is a working demo: https://codesandbox.io/s/rw32xv1mv4
