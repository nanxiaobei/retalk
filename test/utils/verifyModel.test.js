import verifyModel from '@/utils/verifyModel';
import error from '@/utils/error';


describe('verifyModel', () => {
  it('should throw error if name or model is not valid', () => {
    expect(() => {
      verifyModel();
    }).toThrow(
      error.NOT_STRING('name'),
    );
    expect(() => {
      verifyModel('test');
    }).toThrow(
      error.NOT_OBJECT('model'),
    );
    expect(() => {
      verifyModel('test', {});
    }).toThrow(
      error.NO_MODEL_KEY('test', 'state'),
    );
    expect(() => {
      verifyModel('test', { state: [] });
    }).toThrow(
      error.NOT_OBJECT('test', 'state'),
    );
    expect(() => {
      verifyModel('test', { state: {} });
    }).toThrow(
      error.NO_MODEL_KEY('test', 'actions'),
    );
    expect(() => {
      verifyModel('test', { state: {}, actions: [] });
    }).toThrow(
      error.NOT_OBJECT('test', 'actions'),
    );
    expect(() => {
      verifyModel('test', { state: {}, reducers: [], actions: {} });
    }).toThrow(
      error.INVALID_REDUCERS('test'),
    );
    expect(() => {
      verifyModel('test', { state: {}, actions: {} });
    }).not.toThrow();
    expect(() => {
      verifyModel('test', { state: {}, reducers: {}, actions: {} });
    }).not.toThrow();
  });
});
