# Documentation

- [Concepts](#concepts)

  - [Model](#model)
  - [Store](#store)
  - [View](#view)

- [API](#concepts)

  - [createStore](#createstore)
  - [withStore](#withstore)

- [Guides](#guides)

  - [Async import model](#async-import-model)
  - [Customize state and actions](#customize-state-and-actions)
  - [Hot reloading with Redux](#hot-reloading-with-redux)

## Concepts

### Model

**model** brings `state` and `actions` together in one place. Typically, you will have several models.

**`model.state`**

type: `Object`

Retalk will automatically add `loading: Object` to `model.state`.

```js
// state.loading

state: {
  loading: {
    asyncActionA: false,
    asyncActionB: false,
    asyncActionC: true, // When requesting
  }
}
```

**`model.actions`**

type: `Object`

An action is a function, it can be sync or async.

In an action, use `this.state` to get state, `this.setState` to set state.

Like the syntax in a React component, but remember they're not the same.

```js
actions: {
  add() {
    // What's in `this` context?

    // this.state
    // this.setState
    // this[actionName]

    // this[modelName].state
    // this[modelName][actionName]
  },
  async asyncAdd() {
    // `loading.asyncAdd` can be used
    // Use `async / await` syntax to define an async action
  }
}
```

### Store

**store** brings `models` together, can be connected to React components.

Use [`createStore`](#createStore) to generate the one and only Redux store.

### View

View is a React component.

Use `connect` (from [`react-redux`](https://github.com/reduxjs/react-redux)) and [`withStore`](#withStore) to connect **store** and **view**.

Then you can use state and actions in a component.

## API

### createStore

`createStore(models[, options])`

```js
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

**options.useDevTools**

type: `boolean`, default: `false`

> Enable [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension).
>
> Make sure Redux DevTools Extension's version [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) and [not v2.16.0](https://stackoverflow.com/a/53512072/6919133).

**options.plugins**

type: `Array`, default: `[]`

> Pass middleware to store.

### withStore

`withStore(...modelNames)`

```js
connect(...withStore('modelA', 'modelB'))(component);
```

Use `withStore(name)` to pass whole `model.state` and `model.actions` to a component, you can pass more than one model.

`withStore` must be passed in [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) syntax to `connect`.

## Guides

### Async import model

First, use `createStore` to initialize store.

When enter a page, then load page's model. We need some help to achieve this goal.

You can use code splitting libraries like [react-loadable](https://github.com/jamiebuilds/react-loadable#loading-multiple-resources) and [loadable-components](https://github.com/smooth-code/loadable-components/#loading-multiple-resources-in-parallel) to dynamic import component and model.

Here is a `loadable-components` example.

```jsx
import React from 'react';
import loadable from 'loadable-components';

const AsyncBooks = loadable(async (store) => {
  const [{ default: Books }, { default: books }] = await Promise.all([
    import('./books/index.jsx'),
    import('./books/model'),
  ]);
  store.addModel('books', books);
  return (props) => <Books {...props} />;
});
```

Use `store.addModel(name: string, model: Object)` to eject the async imported model to store.

### Customize state and actions

You can pass `mapStateToProps` and `mapDispatchToProps` to `connect` when need some customization, without using `withStore`.

```jsx
const mapState = ({ demo: { value } }) => ({
  value,
});

const mapActions = ({ demo: { increase, asyncIncrease } }) => ({
  increase,
  asyncIncrease,
});
// First param to `mapDispatchToProps` is `dispatch`, `dispatch` is a function,
// but in above `mapActions`, we treat it like it's an object.
// Yes, Retalk did some tricks here, it's `dispatch` function, but bound models on it.

export default connect(
  mapState,
  mapActions,
)(Demo);
```

### Hot reloading with Redux

The key to achieving hot reloading with Redux is, put `Provider` inside `App.js`, not outside! then add code:

```js
if (module.hot) {
  module.hot.accept('./App', () => {
    render(App);
  });
}
```

Here is a working demo: https://codesandbox.io/s/rw32xv1mv4
