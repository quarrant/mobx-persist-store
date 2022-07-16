/**
 * @jest-environment jsdom
 */
import ms from 'milliseconds';
import { makeObservable, observable } from 'mobx';
import mockConsole from 'jest-mock-console';

import { clock } from '../setup-fake-timers';
import { ReactionOptions, StorageOptions, PersistStore } from '../src';
import { configurePersistable } from '../src';

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
        setItem: (key: string, value: string) => { },
        getItem: (key: string) => '',
        removeItem: (key: string) => { },
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

    test('should work serialize/deserialize', () => {
      persistenceStorageOptions.storage?.setItem('myStoreSet', JSON.stringify({ list: ['test'] }))

      const storePersist = new PersistStore(
        myStore,
        {
          name: 'myStoreSet',
          properties: [{
            key: 'list',
            // @ts-ignore
            serialize: (value) => value.toString(),
            // @ts-ignore
            deserialize: (value) => {
              return Array.isArray(value) && value.every(v => typeof v === 'string') ? value : []
            }
          }],
          ...persistenceStorageOptions,
        }
      );

      storePersist.init()

      const spyOnSerialize = jest.spyOn(storePersist['properties'][0], 'serialize');
      const spyOnDeserialize = jest.spyOn(storePersist['properties'][0], 'deserialize');

      clock.tick(500)

      expect(spyOnSerialize).toBeCalledTimes(0)

      clock.tick(100)

      expect(spyOnDeserialize).toBeCalledTimes(1)

      expect(myStore.list).toEqual(['test'])
    })
  });
});
