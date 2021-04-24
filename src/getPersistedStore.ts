import { StorageConfiguration } from './StorageConfiguration';

export const getPersistedStore = async <T>(target: T): Promise<T | null> => {
  return StorageConfiguration.get(target)?.getPersistedStore() ?? null;
};
