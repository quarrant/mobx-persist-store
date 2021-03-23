import { PersistenceOptions } from './types';
import { PersistStore } from './PersistStore';
import { StorageConfiguration } from './StorageConfiguration';

export const persistence = (options: PersistenceOptions) => <T>(target: T): PersistStore<T> => {
  const mobxPersistStore = new PersistStore(options, target);

  StorageConfiguration.set(target, mobxPersistStore);

  return mobxPersistStore;
};
