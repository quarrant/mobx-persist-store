import StorageConfiguration from './StorageConfiguration';
import { PersistenceStore } from './types';

export default function useClear<T extends Object>(target: PersistenceStore<T>) {
  const storageAdapter = StorageConfiguration.getAdapter(target);
  if (storageAdapter) {
    return storageAdapter.writeInStorage(target._storageName || target.constructor.name, {});
  }

  return Promise.resolve();
}
