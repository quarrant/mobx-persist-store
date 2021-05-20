import { PersistStoreMap } from './PersistStoreMap';

export const isPersisting = <T>(target: T): boolean => {
  return PersistStoreMap.get(target)?.isPersisting ?? false;
};
