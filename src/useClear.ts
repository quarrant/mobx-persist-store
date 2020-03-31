import StorageConfiguration from './StorageConfiguration';
import isPersistence from './isPersistence';

export default function useClear<T extends Object>(target: T) {
  if (isPersistence(target)) {
    const storageAdapter = StorageConfiguration.getAdapter(target);
    if (storageAdapter) {
      return storageAdapter.writeInStorage(target._storageName || target.constructor.name, {});
    }
  }

  return Promise.resolve();
}
