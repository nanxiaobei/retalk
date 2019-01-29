<img src="./logo/logo-title.png" height="100" width="300" alt="Retalk">

Retalk 是 Redux 的一个最佳实践，简单、流畅而智慧。

[![Travis](https://img.shields.io/travis/nanxiaobei/retalk.svg?style=flat-square)](https://travis-ci.org/nanxiaobei/retalk)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/retalk.svg?style=flat-square)](https://codecov.io/gh/nanxiaobei/retalk)
[![npm version](https://img.shields.io/npm/v/retalk.svg?style=flat-square)](https://www.npmjs.com/package/retalk)
[![npm downloads](https://img.shields.io/npm/dt/retalk.svg?style=flat-square)](http://www.npmtrends.com/retalk)
[![license](https://img.shields.io/github/license/nanxiaobei/retalk.svg?style=flat-square)](https://github.com/nanxiaobei/retalk/blob/master/LICENSE)

[English](./README.md) | 简体中文

> 请注意：自 v2.0.0 起 `reducers' 已被废弃

## 特性

- **极简 Redux 实践**：只需要 `state` 和 `actions`，简洁清晰。
- **只有两个 API**：`createStore` 与 `withStore`，再无其它繁杂概念。
- **异步引入 model**：对 models 进行代码分隔的完整支持。
- **自动 `loading` 处理**：发送请求，接着使用自动的 loading 状态即可。

## 安装

#### Yarn

```bash
yarn add retalk
```

#### npm

```bash
npm install retalk
```

## 使用

#### 1. Model

```js
// demo/model.js

const model = {
  state: {
    value: 0,
  },
  actions: {
    add() {
      const { value } = this.state; // `this.state` -> 获取 state
      this.setState({ value: value + 1 }); // `this.setState` -> 更新 state
    },
    async asyncAdd() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.add(); // `this[actionName]` -> 调用 action
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

// `loading[asyncAction]` 可供使用
const Demo = ({ value，add，asyncAdd，loading }) => (
  <div>
    <h4>Value: {value}</h4>
    <button onClick={add}>+1</button>
    <button onClick={asyncAdd}>Async +1 {loading.asyncAdd ? '...' ：''}</button>
  </div>
);

export default connect(...withStore('demo'))(Demo);
```

只需要 3 步，一个简单的 Retalk 示例就呈现在眼前了。[https://codesandbox.io/s/5l9mqnzvx](https://codesandbox.io/s/5l9mqnzvx)

## 文档

查看 [文档](./docs/DOCUMENTATION.zh-CN.md) 了解更多详细信息。

## 更新

查看 [更新日志](./CHANGELOG.zh-CN.md) 获取最新动态。
