# <img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

Retalk is a best practice for Redux. just simple, smooth, and smart.

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

English | [简体中文](./README.zh_CN.md)

## Features

- **Simplest Redux**: Just `state` and `actions`, clear than ever before.
- **Two API totally**: `createStore` and `withStore`, no more annoying concepts.
- **Async import model**: Fully code splitting support for models.
- **Auto `loading` state**: Just request, and loading state is ready to use.

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
// demo/model.js

const model = {
  state: {
    value: 0,
  },
  actions: {
    add() {
      const { value } = this.state; // Use `this.state` to get state
      this.setState({ value: value + 1 }); // Use `this.setState` to update state
    },
    async asyncAdd() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.add(); // Use `this[actionName]` to call other actions
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

// Automatically `loading[asyncAction]` is ready to use
const Demo = ({ value, add, asyncAdd, loading }) => (
  <div>
    <h4>Value: {value}</h4>
    <button onClick={add}>+1</button>
    <button onClick={asyncAdd}>Async +1 {loading.asyncAdd ? '...' : ''}</button>
  </div>
);

export default connect(...withStore('demo'))(Demo);
```

Well, only 3 steps, A simple Retalk demo is here. [https://codesandbox.io/s/5l9mqnzvx](https://codesandbox.io/s/5l9mqnzvx)

## Documentation

See more details in the [documentation](./docs/DOCUMENTATION.md).

## Changelog

See what's new in the [changelog](./CHANGELOG.md).
