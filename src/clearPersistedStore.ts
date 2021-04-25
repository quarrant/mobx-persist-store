import { PersistStoreMap } from './PersistStoreMap';

export const clearPersistedStore = async <T>(target: T): Promise<void> => {
  await PersistStoreMap.get(target)?.clearPersistedStore();
};
