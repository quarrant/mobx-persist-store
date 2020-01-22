import StorageConfiguration from './StorageConfiguration';

export default function useClear<T extends Object>(target: T & { _storageName?: string }) {
  const storageAdapter = StorageConfiguration.getAdapter(target._storageName || target.constructor.name);
  if (storageAdapter) {
    return storageAdapter.writeInStorage(target._storageName || target.constructor.name, {});
  }

  return Promise.resolve();
}
