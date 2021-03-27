import { StorageAdapter } from '../src';
import ms from 'milliseconds';

let testStorage: Record<string, any> = {};

async function setItemTestHandler(name: string, content: string): Promise<void> {
  Object.assign(testStorage, { [name]: content });
}

async function getItemTestHandler<T>(name: string): Promise<string | T> {
  return testStorage[name];
}

async function removeItemTestHandler(name: string): Promise<void> {
  delete testStorage[name];
}

describe('StorageAdapter', () => {
  const mockStore: Record<string, unknown> = {
    4: 'test',
    5: 1,
    6: 1.15,
    7: { 0: 'a' },
    8: [1, 1],
    9: 1e15,
  };

  let storage: StorageAdapter;

  describe('jsonify option equals true', () => {
    beforeEach(() => {
      testStorage = {};
      storage = new StorageAdapter({
        // jsonify: true, // true is the default
        setItem: setItemTestHandler,
        getItem: getItemTestHandler,
        removeItem: removeItemTestHandler,
      });
    });

    describe('setItem', () => {
      test(`write to storage as stringify`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = testStorage['mockStore'];
        const expectedResult = JSON.stringify(mockStore);

        expect(actualResult).toEqual(expectedResult);
        expect(typeof expectedResult).toBe('string');
      });
    });

    describe('getItem', () => {
      test(`should read storage data and be an object`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = await storage.getItem('mockStore');
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
      });
    });

    describe('removeItem', () => {
      test(`should read storage data and be an object`, async () => {
        await storage.setItem('mockStore', mockStore);
        await storage.removeItem('mockStore');

        const actualResult = await storage.getItem('mockStore');
        const expectedResult = {};

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('jsonify option equals false', () => {
    beforeEach(() => {
      testStorage = {};
      storage = new StorageAdapter({
        jsonify: false,
        setItem: setItemTestHandler,
        getItem: getItemTestHandler,
        removeItem: removeItemTestHandler,
      });
    });

    describe('setItem', () => {
      test(`write to storage as stringify`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = testStorage['mockStore'];
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
        expect(typeof expectedResult).toBe('object');
      });
    });

    describe('getItem', () => {
      test(`should read storage data and be an object`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = await storage.getItem('mockStore');
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
      });
    });

    describe('removeItem', () => {
      test(`should read storage data and be an object`, async () => {
        await storage.setItem('mockStore', mockStore);
        await storage.removeItem('mockStore');

        const actualResult = await storage.getItem('mockStore');
        const expectedResult = {};

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});

// ms.seconds(2);

// if (process.env.NODE_ENV !== 'production')
//   console.warn(`redux-persist ${storageType} test failed, persistence will be disabled.`);
// }

// persistor object
// the persistor object is returned by persistStore with the following methods:
//   .purge()
// purges state from disk and returns a promise
//   .flush()
// immediately writes all pending state to disk and returns a promise
//   .pause()
// pauses persistence
//   .persist()
// resumes persistence
