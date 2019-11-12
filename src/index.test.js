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
  store.dispatch();
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

  // NOT_STRING - name
  store.add({ counter: class {} });
  expect(() => {
    // eslint-disable-next-line
    const Counter = withStore('counter', 123)(() => <div />);
    mount(
      <Provider store={store}>
        <Counter />
      </Provider>,
    );
  }).toThrow();

  // NOT_EXIST - Model
  expect(() => {
    // eslint-disable-next-line
    const Counter2 = withStore('counter2')(() => <div />);
    mount(
      <Provider store={store}>
        <Counter2 />
      </Provider>,
    );
  }).toThrow();

  // withStore() run as connect()
  withStore()(() => <div />);

  /**
   * PRODUCTION
   */
  process.env.NODE_ENV = 'production';

  store.add({
    home: class {},
    counter3: class {
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
      homeSetState() {
        const { home } = this.models;
        home.setState();
      }
    },
  });
  // eslint-disable-next-line
  const Counter3 = withStore('counter3')(({ incrementAsync, homeSetState }) => (
    <>
      <button id="incrementAsync" onClick={incrementAsync} />
      <button id="homeSetState" onClick={homeSetState} />
    </>
  ));
  const wrapper = mount(
    <Provider store={store}>
      <Counter3 />
    </Provider>,
  );
  wrapper.find('#incrementAsync').simulate('click');
  // NO_SET_STATE - name
  wrapper.find('#homeSetState').simulate('click');

  // Unmount
  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 1000);
});
