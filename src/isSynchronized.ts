import StorageConfiguration from './StorageConfiguration';
import { PersistenceStore } from './types';

export default function isSynchronized<T extends Object>(target: PersistenceStore<T>) {
  return StorageConfiguration.getIsSynchronized(target);
}
