import { PersistStoreMap } from './PersistStoreMap';

export const isHydrated = <T>(target: T): boolean => {
  return PersistStoreMap.get(target)?.isHydrated ?? false;
};
