import ms from 'milliseconds';
import { StorageOptions, StorePersist } from '../src';
import { makeObservable, observable } from 'mobx';
import { configurePersistable } from '../src';
import mockConsole from 'jest-mock-console';

class MyStore {
  list: string[] = [];

  constructor() {
    makeObservable(this, { list: observable });
  }
}

describe('StorePersist', () => {
  const target = new MyStore();
  const persistenceStorageOptions: StorageOptions = {
    expireIn: ms.days(7),
    removeOnExpiration: false,
    stringify: false,
    storage: localStorage,
  };
  const reactionOptions = {
    delay: 200,
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
    test(`should be all undefined `, async () => {
      const storePersist = new StorePersist(target, { name: 'myStoreUndefined', properties: ['list'] });

      expect(storePersist['storageAdapter']).toEqual({
        options: {
          expireIn: undefined,
          removeOnExpiration: undefined,
          storage: undefined,
          stringify: undefined,
        },
      });
      expect(storePersist['reactionOptions']).toEqual({ delay: undefined });
      expect(console.warn).toHaveBeenCalledWith(
        `mobx-persist-store: myStoreUndefined does not have a valid storage adaptor and data will not be persisted. Please set "storage:" `,
      );
    });

    test(`should be all set`, async () => {
      const storePersist = new StorePersist(
        target,
        {
          name: 'myStoreSet',
          properties: ['list'],
          ...persistenceStorageOptions,
        },
        reactionOptions,
      );

      expect(storePersist['storageAdapter']).toEqual({ options: persistenceStorageOptions });
      expect(storePersist['reactionOptions']).toEqual(reactionOptions);
    });

    test(`should be all set from configurePersistable`, async () => {
      configurePersistable({
        ...persistenceStorageOptions,
        ...reactionOptions,
      });
      const storePersist = new StorePersist(target, { name: 'myStoreConfigurePersistable', properties: ['list'] });

      expect(storePersist['storageAdapter']).toEqual({ options: persistenceStorageOptions });
      expect(storePersist['reactionOptions']).toEqual(reactionOptions);
    });

    test(`should override options from configurePersistable`, async () => {
      configurePersistable({
        ...persistenceStorageOptions,
        ...reactionOptions,
      });

      const storage = {
        setItem: (key: string, value: string) => {},
        getItem: (key: string) => '',
        removeItem: (key: string) => {},
      };
      const storePersist = new StorePersist(
        target,
        {
          name: 'myStoreOverride',
          properties: ['list'],
          expireIn: ms.hours(7),
          removeOnExpiration: true,
          stringify: true,
          storage: storage,
        },
        { delay: 300 },
      );

      expect(storePersist['storageAdapter']).toEqual({
        options: { expireIn: ms.hours(7), removeOnExpiration: true, stringify: true, storage: storage },
      });
      expect(storePersist['reactionOptions']).toEqual({ delay: 300 });
    });
  });
});
