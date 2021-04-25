import { PersistStoreMap } from './PersistStoreMap';

export const startPersisting = <T>(target: T): void => {
  PersistStoreMap.get(target)?.startPersisting();
};
