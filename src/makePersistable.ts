import { PersistenceStorageOptions, ReactionOptions } from './types';
import { PersistStore } from './PersistStore';
import { PersistStoreMap } from './PersistStoreMap';
import { duplicatedStoreWarningIf } from './utils';

export const makePersistable = async <T extends { [key: string]: any }, P extends keyof T>(
  target: T,
  storageOptions: PersistenceStorageOptions<P>,
  reactionOptions?: ReactionOptions,
): Promise<PersistStore<T, P>> => {
  const mobxPersistStore = new PersistStore(target, storageOptions, reactionOptions);

  const hasPersistedStoreAlready = Array.from(PersistStoreMap.values())
    .map((item) => item.storageName)
    .includes(mobxPersistStore.storageName);

  duplicatedStoreWarningIf(hasPersistedStoreAlready, mobxPersistStore.storageName);

  PersistStoreMap.set(target, mobxPersistStore);

  return mobxPersistStore.init();
};
