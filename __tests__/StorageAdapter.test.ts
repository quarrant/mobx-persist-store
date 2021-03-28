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
  let storageAdapter: StorageAdapter;
  const mockStore: Record<string, unknown> = {
    4: 'test',
    5: 1,
    6: 1.15,
    7: { 0: 'a' },
    8: [1, 1],
    9: 1e15,
  };

  describe('stringify option equals true', () => {
    beforeEach(() => {
      testStorage = {};
      storageAdapter = new StorageAdapter({
        // stringify: true, // true is the default
        storage: {
          setItem: setItemTestHandler,
          getItem: getItemTestHandler,
          removeItem: removeItemTestHandler,
        },
      });
    });

    describe('setItem', () => {
      test(`write to storage as stringify`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = testStorage['mockStore'];
        const expectedResult = JSON.stringify(mockStore);

        expect(actualResult).toEqual(expectedResult);
        expect(typeof expectedResult).toBe('string');
      });
    });

    describe('getItem', () => {
      test(`should read storage data and be an object`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = await storageAdapter.getItem('mockStore');
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
      });
    });

    describe('removeItem', () => {
      test(`should read storage data and be an object`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);
        await storageAdapter.removeItem('mockStore');

        const actualResult = await storageAdapter.getItem('mockStore');
        const expectedResult = {};

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('stringify option equals false', () => {
    beforeEach(() => {
      testStorage = {};
      storageAdapter = new StorageAdapter({
        stringify: false,
        storage: {
          setItem: setItemTestHandler,
          getItem: getItemTestHandler,
          removeItem: removeItemTestHandler,
        },
      });
    });

    describe('setItem', () => {
      test(`write to storage as stringify`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = testStorage['mockStore'];
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
        expect(typeof expectedResult).toBe('object');
      });

      test(`should not have __mps__`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = testStorage['mockStore'];

        expect(actualResult).not.toHaveProperty('__mps__');
      });
    });

    describe('getItem', () => {
      test(`should read storage data and be an object`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = await storageAdapter.getItem('mockStore');
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
      });
    });

    describe('removeItem', () => {
      test(`should read storage data and be an object`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);
        await storageAdapter.removeItem('mockStore');

        const actualResult = await storageAdapter.getItem('mockStore');
        const expectedResult = {};

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('expiration option with non-expired data', () => {
    beforeEach(() => {
      testStorage = {};
      storageAdapter = new StorageAdapter({
        expireIn: ms.seconds(1),
        stringify: false, // easier to test when data is not a string
        storage: {
          setItem: setItemTestHandler,
          getItem: getItemTestHandler,
          removeItem: removeItemTestHandler,
        },
      });
    });

    describe('setItem', () => {
      test(`should have expireInTimestamp on __mps__`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = testStorage['mockStore'];

        expect(actualResult).toHaveProperty('__mps__');
        expect(actualResult.__mps__).toHaveProperty('expireInTimestamp');
      });
    });

    describe('getItem', () => {
      test(`should read non-expired data`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = await storageAdapter.getItem('mockStore');
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('expiration option with expired data', () => {
    beforeEach(() => {
      testStorage = {};
      storageAdapter = new StorageAdapter({
        expireIn: -1, // one millisecond before now
        stringify: false, // easier to test when data is not a string
        storage: {
          setItem: setItemTestHandler,
          getItem: getItemTestHandler,
          removeItem: removeItemTestHandler,
        },
      });
    });

    describe('getItem', () => {
      test(`should return empty object`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = await storageAdapter.getItem('mockStore');
        const expectedResult = {};

        expect(actualResult).toEqual(expectedResult);
      });
    });

    describe('check storage', () => {
      test(`should delete data in storage`, async () => {
        await storageAdapter.getItem('mockStore');

        const actualResult = testStorage['mockStore'];
        const expectedResult = undefined;

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('removeOnExpiration option', () => {
    beforeEach(() => {
      testStorage = {};
      storageAdapter = new StorageAdapter({
        expireIn: -1, // one millisecond before now
        stringify: false, // easier to test when data is not a string
        removeOnExpiration: false,
        storage: {
          setItem: setItemTestHandler,
          getItem: getItemTestHandler,
          removeItem: removeItemTestHandler,
        },
      });
    });

    describe('getItem', () => {
      test(`should return empty object`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);

        const actualResult = await storageAdapter.getItem('mockStore');
        const expectedResult = {};

        expect(actualResult).toEqual(expectedResult);
      });
    });

    describe('check storage', () => {
      test(`should not delete data in storage`, async () => {
        await storageAdapter.setItem('mockStore', mockStore);
        await storageAdapter.getItem('mockStore');

        const actualResult = testStorage['mockStore'];
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});
