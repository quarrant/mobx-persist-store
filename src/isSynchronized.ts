import StorageConfiguration from './StorageConfiguration';
import isPersistence from './isPersistence';

export default function isSynchronized<T>(target: T) {
  if (isPersistence(target)) {
    return StorageConfiguration.getIsSynchronized(target);
  }

  console.warn('Only stores that persistence can use `isSynchronized` function.');
  return false;
}
