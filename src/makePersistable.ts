import { PersistenceStorageOptions, ReactionOptions } from './types';
import { PersistStore } from './PersistStore';
import { StorageConfiguration } from './StorageConfiguration';

export const makePersistable = <T extends { [key: string]: any }, P extends keyof T>(
  target: T,
  storageOptions: PersistenceStorageOptions<P>,
  reactionOptions?: ReactionOptions,
): PersistStore<T, P> => {
  const mobxPersistStore = new PersistStore(target, storageOptions, reactionOptions);

  StorageConfiguration.set(target, mobxPersistStore);

  return mobxPersistStore;
};
