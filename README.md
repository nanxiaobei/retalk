# <img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

Retalk is a best practice for Redux. just simple, smooth, and smart.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

## Features

- **Simplest Redux**: Just `state` and `actions`, if you like.
- **Only two API**: `createStore` and `withStore`, no more annoying concepts.
- **Async import model**: Now we can use code splitting for models.
- **Auto `loading` state**: You request, we handle the loading state.

## Install

#### Yarn

```bash
yarn add retalk
```

#### npm

```bash
npm install retalk
```

## Usage

#### 1. Model

```js
const count = {
  state: {
    value: 0,
  },
  actions: {
    add() {
      const { value } = this.state;
      this.setState({ value: value + 1 });
    },
    async asyncAdd() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.add();
    },
  },
};

export default count;
```

#### 2. Store

```js
import { createStore } from 'retalk';
import count from './count';

const store = createStore({
  count,
});

export default store;
```

#### 3. View

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { withStore } from 'retalk';
import store from './store';

const Count = ({ value, add, asyncAdd, loading }) => (
  <>
    <h3>Count: {value}</h3>
    <button onClick={add}>+ 1</button>
    <button onClick={asyncAdd}>async + 1 {loading.asyncAdd ? '...' : ''}</button>
  </>
);

const ConnectedCount = connect(...withStore('count'))(Count);

const App = () => (
  <Provider store={store}>
    <ConnectedCount />
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

Well, only 3 steps, A simple Retalk demo is here: https://codesandbox.io/s/5l9mqnzvx.

## API

#### createStore

`createStore(models[, options])`

```js
createStore(
  {
    modelA,
    modelB,
  },
  {
    useDevTools: true, // type: boolean, default: false
    plugins: [logger], // type: Array, default: []
  },
);
```

_(Make sure Redux DevTools Extension's version [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) and [not v2.16.0](https://stackoverflow.com/a/53512072/6919133).)_

#### withStore

`withStore(...modelNames)`

```js
connect(...withStore('modelA', 'modelB'))(Component);
```

#### this.setState

`this.setState(partialState)`

```js
this.setState({ value: 1 });
```

### action

```js
sum(a, b) {
  const { value } = this.state;
  this.setState({ value: value + a + b });
}

// Call action
this.sum(1, 2);
```
