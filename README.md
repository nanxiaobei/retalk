# <img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

Retalk is a best practice for Redux. just simple, smooth, and smart.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

## Features

- **Simplest Redux**: Just `state` and `actions`, clear than ever before.
- **Only two API**: `createStore` and `withStore`, no more annoying concepts.
- **Async import model**: Fully code splitting support for models.
- **Auto `loading` state**: Just request, and loading state is ready to use.

## Install

#### yarn

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
// demo/model.js

const model = {
  state: {
    value: 0,
  },
  actions: {
    add() {
      const { value } = this.state;
      this.setState({ value: value + 1 });
    },
    async addAsync() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.add();
    },
  },
};

export default model;
```

#### 2. Store

```js
// store.js

import { createStore } from 'retalk';
import demo from './demo/model';

const store = createStore({
  demo,
});

export default store;
```

#### 3. View

```jsx
// demo/index.jsx

import React from 'react';
import { connect } from 'react-redux';
import { withStore } from 'retalk';

const Demo = ({ value, add, addAsync, loading }) => (
  <div>
    <h4>Value: {value}</h4>
    <button onClick={add}>+1</button>
    <button onClick={addAsync}>+1 Async {loading.addAsync ? '...' : ''}</button>
  </div>
);

export default connect(...withStore('demo'))(Demo);
```

Well, only 3 steps, A simple Retalk demo is here. [https://codesandbox.io/s/5l9mqnzvx](https://codesandbox.io/s/5l9mqnzvx).

## API

#### createStore

`createStore(models, options)`

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

_Make sure Redux DevTools Extension's version [>= v2.15.3](https://github.com/reduxjs/redux/issues/2943) and [not v2.16.0](https://stackoverflow.com/a/53512072/6919133)._

#### withStore

`withStore(...modelNames)`

```js
connect(...withStore('modelA', 'modelB'))(Component);
```

### action

```js
sum(a, b) {
  const { value } = this.state;
  this.setState({ value: value + a + b });
}

// Call in another action
this.sum(1, 2);

// Call in a Component
const { sum } = this.props;
sum(1, 2)
```

#### this.setState

`this.setState(partialState)`

```js
// Call in an action
this.setState({ value: 1 });
```

_Note: Call it like `this.setState` in a React Component, but not the same API!_
