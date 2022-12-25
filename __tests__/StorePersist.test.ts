/**
 * @jest-environment jsdom
 */
import ms from 'milliseconds';
import { makeObservable, observable, runInAction } from 'mobx';
import mockConsole from 'jest-mock-console';

import { ReactionOptions, StorageOptions, PersistStore, configurePersistable } from '../src';

class MyStore {
  list: string[] = [];

  constructor() {
    makeObservable(this, { list: observable });
  }
}

describe('StorePersist', () => {
  const myStore = new MyStore();
  const persistenceStorageOptions: StorageOptions = {
    expireIn: ms.days(7),
    removeOnExpiration: false,
    stringify: false,
    debugMode: false,
    storage: localStorage,
  };
  const reactionOptions: ReactionOptions = {
    delay: 200,
    fireImmediately: false,
  };
  let restoreConsole: ReturnType<typeof mockConsole>;

  beforeEach(() => {
    restoreConsole = mockConsole();

    configurePersistable({});
  });

  afterEach(() => {
    restoreConsole();
  });

  describe('storageAdapter', () => {
    test(`should have default values`, () => {
      const storePersist = new PersistStore(myStore, { name: 'myStore', properties: ['list'] });

      expect(storePersist['storageAdapter']).toEqual({
        options: {
          expireIn: undefined,
          removeOnExpiration: true,
          storage: undefined,
          stringify: true,
          debugMode: false,
        },
      });
      expect(storePersist['reactionOptions']).toEqual({ delay: undefined, fireImmediately: true });
      expect(console.warn).toHaveBeenCalledWith(
        `mobx-persist-store: myStore does not have a valid storage adaptor.\n\n* Make sure the storage controller has 'getItem', 'setItem' and 'removeItem' methods."`
      );
    });

    test(`should be all set`, () => {
      const storePersist = new PersistStore(
        myStore,
        {
          name: 'myStoreSet',
          properties: ['list'],
          ...persistenceStorageOptions,
        },
        reactionOptions
      );

      expect(storePersist['storageAdapter']).toEqual({ options: persistenceStorageOptions });
      expect(storePersist['reactionOptions']).toEqual(reactionOptions);
    });

    test(`should be all set from configurePersistable`, () => {
      configurePersistable(
        {
          ...persistenceStorageOptions,
        },
        {
          ...reactionOptions,
        }
      );
      const storePersist = new PersistStore(myStore, { name: 'myStoreConfigurePersistable', properties: ['list'] });

      expect(storePersist['storageAdapter']).toEqual({ options: persistenceStorageOptions });
      expect(storePersist['reactionOptions']).toEqual(reactionOptions);
    });

    test(`should override options from configurePersistable`, () => {
      configurePersistable(
        {
          ...persistenceStorageOptions,
        },
        {
          ...reactionOptions,
        }
      );

      const storage = {
        setItem: (key: string, value: string) => {},
        getItem: (key: string) => '',
        removeItem: (key: string) => {},
      };
      const storePersist = new PersistStore(
        myStore,
        {
          name: 'myStoreOverride',
          properties: ['list'],
          expireIn: ms.hours(7),
          removeOnExpiration: true,
          stringify: true,
          debugMode: true,
          storage: storage,
        },
        { delay: 300, fireImmediately: true }
      );

      expect(storePersist['storageAdapter']).toEqual({
        options: {
          expireIn: ms.hours(7),
          removeOnExpiration: true,
          stringify: true,
          debugMode: true,
          storage: storage,
        },
      });
      expect(storePersist['reactionOptions']).toEqual({ delay: 300, fireImmediately: true });
      expect(storePersist['storageAdapter']?.options.storage).toBe(storage);
    });

    test('should work serialize/deserialize', async () => {
      const storePersist = new PersistStore(myStore, {
        name: 'myStoreSet',
        properties: [
          {
            key: 'list',
            // @ts-ignore
            serialize: (value) => {
              return value.join(',');
            },
            // @ts-ignore
            deserialize: (value) => {
              return value.split(',');
            },
          },
        ],
        ...persistenceStorageOptions,
        stringify: true,
      });

      const spyOnSerialize = jest.spyOn(storePersist['properties'][0], 'serialize');
      const spyOnDeserialize = jest.spyOn(storePersist['properties'][0], 'deserialize');

      await storePersist.init();

      expect(storePersist.isHydrated).toEqual(true);

      expect(spyOnSerialize).toBeCalledTimes(1);
      expect(spyOnDeserialize).toBeCalledTimes(0);

      expect(myStore.list).toEqual([]);

      runInAction(() => (myStore.list = ['test']));

      expect(spyOnSerialize).toBeCalledTimes(2);
      expect(spyOnDeserialize).toBeCalledTimes(0);

      storePersist.pausePersisting();

      runInAction(() => (myStore.list = []));

      await storePersist.hydrateStore();

      expect(myStore.list).toEqual(['test']);

      return;
    });
  });
});
