import { PersistenceStorageOptions, ReactionOptions } from './types';
import { StorePersist } from './StorePersist';
import { StorageConfiguration } from './StorageConfiguration';
import { duplicatedStoreWarningIf } from './utils';

export const makePersistable = <T extends { [key: string]: any }, P extends keyof T>(
  target: T,
  storageOptions: PersistenceStorageOptions<P>,
  reactionOptions?: ReactionOptions
): StorePersist<T, P> => {
  const mobxPersistStore = new StorePersist(target, storageOptions, reactionOptions);

  const hasPersistedStoreAlready = Array.from(StorageConfiguration.values())
    .map((item) => item.storageName)
    .includes(mobxPersistStore.storageName);

  duplicatedStoreWarningIf(hasPersistedStoreAlready, mobxPersistStore.storageName);

  StorageConfiguration.set(target, mobxPersistStore);

  return mobxPersistStore;
};
