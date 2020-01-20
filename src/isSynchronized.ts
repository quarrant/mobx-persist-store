import StorageConfiguration from './StorageConfiguration';

export default function isSynchronized<T extends Object>(target: T) {
  return StorageConfiguration.getIsSynchronized(target.constructor.name);
}
