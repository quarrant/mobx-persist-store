import { PersistStoreMap } from './PersistStoreMap';

export const pausePersisting = <T>(target: T): void => {
  PersistStoreMap.get(target)?.pausePersisting();
};
