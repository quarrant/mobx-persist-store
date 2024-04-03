import { PersistenceStorageOptions, ReactionOptions } from './types';
import { PersistStore } from './PersistStore';
import { PersistStoreMap } from './PersistStoreMap';
import { duplicatedStoreWarningIf } from './utils';

const setMobxPersistStore = <T extends { [key: string]: any }, P extends keyof T>(target: T, persistStore: PersistStore<T, P>) => {
  if (process.env.NODE_ENV !== 'production') {
    for (const [key, store] of PersistStoreMap.entries()) {
      if (store.storageName === persistStore.storageName) {
        store.stopPersisting()
        PersistStoreMap.delete(key)
      }
    }
  }

  PersistStoreMap.set(target, persistStore);
}

export const makePersistable = async <T extends { [key: string]: any }, P extends keyof T>(
  target: T,
  storageOptions: PersistenceStorageOptions<T, P>,
  reactionOptions?: ReactionOptions
): Promise<PersistStore<T, P>> => {
  const mobxPersistStore = new PersistStore(target, storageOptions, reactionOptions);

  const hasPersistedStoreAlready = Array.from(PersistStoreMap.values())
    .map((item) => item.storageName)
    .includes(mobxPersistStore.storageName);

  duplicatedStoreWarningIf(hasPersistedStoreAlready, mobxPersistStore.storageName);
  setMobxPersistStore(target, mobxPersistStore);

  return mobxPersistStore.init();
};
