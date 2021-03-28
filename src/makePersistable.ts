import { PersistenceStorageOptions, ReactionOptions } from './types';
import { StorePersist } from './StorePersist';
import { StorageConfiguration } from './StorageConfiguration';

export const makePersistable = <T extends { [key: string]: any }, P extends keyof T>(
  target: T,
  storageOptions: PersistenceStorageOptions<P>,
  reactionOptions?: ReactionOptions,
): StorePersist<T, P> => {
  const mobxPersistStore = new StorePersist(target, storageOptions, reactionOptions);

  StorageConfiguration.set(target, mobxPersistStore);

  return mobxPersistStore;
};
