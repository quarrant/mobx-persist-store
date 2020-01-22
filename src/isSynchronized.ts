import StorageConfiguration from './StorageConfiguration';

export default function isSynchronized<T extends Object>(target: T & { _storageName?: string }) {
  return StorageConfiguration.getIsSynchronized(target._storageName || target.constructor.name);
}
