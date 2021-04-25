import { PersistStoreMap } from './PersistStoreMap';

export const stopPersisting = <T>(target: T): void => {
  PersistStoreMap.get(target)?.stopPersisting();
};
