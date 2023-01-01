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
  /**
   * test
   */
  process.env.NODE_ENV = 'test';

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

  // NOT_OBJECT - models (store.add)
  expect(() => {
    store.add([]);
  }).toThrow();

  // NOT_CLASS - Model (store.add)
  expect(() => {
    store.add({ model1: 123 });
  }).toThrow();

  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = compose;
  const store2 = setStore({ model2: class {} });
  store2.add({ model2a: class {} });
  store2.add({ model2a: class {} }); // Add exist model

  /**
   * production
   */
  process.env.NODE_ENV = 'production';

  const store3 = setStore({ model3: class {} });
  store3.add({ model3a: class {} });
  store3.add({ model3a: class {} }); // Add exist model
});

test('withStore', (done) => {
  const store = setStore();

  /**
   * test
   */
  process.env.NODE_ENV = 'test';

  store.add({
    counter1: class {
      state = { count: 0 };
    },
  });

  // default
  const Counter1 = withStore('counter1')(() => <div />); // eslint-disable-line
  const Counter1New = withStore({ counter1: ['count', 'add'] })(() => <div />); // eslint-disable-line
  mount(
    <Provider store={store}>
      <Counter1 />
      <Counter1New />
    </Provider>
  );

  // NOT_STRING - name
  expect(() => {
    const Counter1Err = withStore('counter1', 123)(() => <div />); // eslint-disable-line
    mount(
      <Provider store={store}>
        <Counter1Err />
      </Provider>
    );
  }).toThrow();

  // NOT_EXIST - Model
  expect(() => {
    const Counter2Err = withStore('counter2')(() => <div />); // eslint-disable-line
    const Counter2ErrNew = withStore({ counter2: [] })(() => <div />); // eslint-disable-line

    mount(
      <Provider store={store}>
        <Counter2Err />
        <Counter2ErrNew />
      </Provider>
    );
  }).toThrow();

  // withStore() as connect()
  withStore()(() => <div />);

  /**
   * production
   */
  process.env.NODE_ENV = 'production';

  store.add({
    counter3: class {
      state = {
        count: 0,
      };
      add() {
        const { count } = this.state;
        this.setState({ count: count + 1 });
      }
      async addAsync() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.add();
      }
    },
  });

  const Counter3Comp = ({ addAsync }) => <button id="addAsync" onClick={addAsync} />;
  const Counter3 = withStore('counter3')(Counter3Comp); // eslint-disable-line
  const Counter3New = withStore({ counter3: ['count', 'add'] })(() => <div />); // eslint-disable-line

  const wrapper = mount(
    <Provider store={store}>
      <Counter3 />
      <Counter3New />
    </Provider>
  );
  wrapper.find('#addAsync').simulate('click');
  wrapper.find('#addAsync').simulate('click');

  // Unmount
  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 1000);
});
