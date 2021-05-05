import { PersistStoreMap } from './PersistStoreMap';

export const getPersistedStore = async <T>(target: T): Promise<T | null> => {
  return PersistStoreMap.get(target)?.getPersistedStore() ?? null;
};
