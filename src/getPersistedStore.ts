import { PersistStoreMap } from './PersistStoreMap';

export const getPersistedStore = async <T extends Record<string, any>>(target: T): Promise<T | null> => {
  return PersistStoreMap.get(target)?.getPersistedStore() ?? null;
};
