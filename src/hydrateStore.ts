import { PersistStoreMap } from './PersistStoreMap';

export const hydrateStore = async <T>(target: T): Promise<void> => {
  await PersistStoreMap.get(target)?.hydrateStore();
};
