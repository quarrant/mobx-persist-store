import StorageConfiguration from './StorageConfiguration';

export default function useClear<T extends Object>(target: T) {
  const storageAdapter = StorageConfiguration.getAdapter(target.constructor.name);
  if (storageAdapter) storageAdapter.writeInStorage(target.constructor.name, {});
}
