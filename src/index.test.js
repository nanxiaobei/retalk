import React from 'react'; // eslint-disable-line
import { compose } from 'redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { setStore, withStore, Provider } from './index'; // eslint-disable-line

configure({ adapter: new Adapter() });

beforeEach(() => {
  jest.spyOn(console, 'error');
  global.console.error.mockImplementation(() => {});
});

test('setStore', () => {
  // NOT_OBJECT - models
  expect(() => {
    setStore([]);
  }).toThrow();
  // NOT_ARRAY - middleware
  expect(() => {
    setStore({}, 123);
  }).toThrow();
  // NOT_CLASS - Model
  expect(() => {
    setStore({ model1: 123 });
  }).toThrow();

  const store = setStore();
  // NO_DISPATCH
  expect(() => {
    store.dispatch();
  }).toThrow();
  // NOT_OBJECT - models (add)
  expect(() => {
    store.add([]);
  }).toThrow();
  // NOT_CLASS - Model (add)
  expect(() => {
    store.add({ model2: 123 });
  }).toThrow();

  /**
   * DEVELOPMENT
   */
  process.env.NODE_ENV = 'development';
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = compose;
  const store2 = setStore({ model3: class {} });
  store2.add({ model4: class {} });
  store2.add({ model4: class {} }); // Add an exist model

  /**
   * PRODUCTION
   */
  process.env.NODE_ENV = 'production';
  const store3 = setStore({ model5: class {} });
  store3.add({ model6: class {} });
  store3.add({ model6: class {} }); // Add an exist model
});

test('withStore', (done) => {
  const store = setStore();

  /**
   * DEVELOPMENT
   */
  process.env.NODE_ENV = 'development';
  store.add({ message: class {} });
  // NOT_STRING - name
  expect(() => {
    const Message = withStore('message', 123)(() => 'hello'); // eslint-disable-line
    mount(
      <Provider store={store}>
        <Message />
      </Provider>,
    );
  }).toThrow();
  // NOT_EXIST - Model
  expect(() => {
    const Message = withStore('message2')(() => 'hello'); // eslint-disable-line
    mount(
      <Provider store={store}>
        <Message />
      </Provider>,
    );
  }).toThrow();
  // withStore() without names
  withStore()(() => '');

  /**
   * PRODUCTION
   */
  process.env.NODE_ENV = 'production';
  class CounterModel {
    state = {
      count: 0,
    };
    increment() {
      const { count } = this.state;
      this.setState({ count: count + 1 });
    }
    async incrementAsync() {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.increment();
    }
  }
  store.add({ counter: CounterModel });
  // eslint-disable-next-line
  const Counter = withStore('counter')(({ incrementAsync }) => (
    <button className="increase-async" onClick={incrementAsync} />
  ));
  const wrapper = mount(
    <Provider store={store}>
      <Counter />
    </Provider>,
  );
  wrapper.find('.increase-async').simulate('click');
  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 1000);
});
