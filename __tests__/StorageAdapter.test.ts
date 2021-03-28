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
  let storage: StorageAdapter;
  const mockStore: Record<string, unknown> = {
    4: 'test',
    5: 1,
    6: 1.15,
    7: { 0: 'a' },
    8: [1, 1],
    9: 1e15,
  };

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

      test(`should not have __mps__`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = testStorage['mockStore'];

        expect(actualResult).not.toHaveProperty('__mps__');
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

  describe('expiration option with non-expired data', () => {
    beforeEach(() => {
      testStorage = {};
      storage = new StorageAdapter({
        expireIn: ms.seconds(1),
        jsonify: false, // easier to test when data is not a string
        setItem: setItemTestHandler,
        getItem: getItemTestHandler,
        removeItem: removeItemTestHandler,
      });
    });

    describe('setItem', () => {
      test(`should have expireTimestamp on __mps__`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = testStorage['mockStore'];

        expect(actualResult).toHaveProperty('__mps__');
        expect(actualResult.__mps__).toHaveProperty('expireTimestamp');
      });
    });

    describe('getItem', () => {
      test(`should read non-expired data`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = await storage.getItem('mockStore');
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('expiration option with expired data', () => {
    beforeEach(() => {
      testStorage = {};
      storage = new StorageAdapter({
        expireIn: -1, // one millisecond before now
        jsonify: false, // easier to test when data is not a string
        setItem: setItemTestHandler,
        getItem: getItemTestHandler,
        removeItem: removeItemTestHandler,
      });
    });

    describe('getItem', () => {
      test(`should return empty object`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = await storage.getItem('mockStore');
        const expectedResult = {};

        expect(actualResult).toEqual(expectedResult);
      });
    });

    describe('check storage', () => {
      test(`should delete data in storage`, async () => {
        await storage.getItem('mockStore');

        const actualResult = testStorage['mockStore'];
        const expectedResult = undefined;

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });

  describe('removeOnExpiration option', () => {
    beforeEach(() => {
      testStorage = {};
      storage = new StorageAdapter({
        expireIn: -1, // one millisecond before now
        jsonify: false, // easier to test when data is not a string
        removeOnExpiration: false,
        setItem: setItemTestHandler,
        getItem: getItemTestHandler,
        removeItem: removeItemTestHandler,
      });
    });

    describe('getItem', () => {
      test(`should return empty object`, async () => {
        await storage.setItem('mockStore', mockStore);

        const actualResult = await storage.getItem('mockStore');
        const expectedResult = {};

        expect(actualResult).toEqual(expectedResult);
      });
    });

    describe('check storage', () => {
      test(`should not delete data in storage`, async () => {
        await storage.setItem('mockStore', mockStore);
        await storage.getItem('mockStore');

        const actualResult = testStorage['mockStore'];
        const expectedResult = mockStore;

        expect(actualResult).toEqual(expectedResult);
      });
    });
  });
});
