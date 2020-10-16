import { StorageConfiguration } from './StorageConfiguration';
import { isPersistence } from './isPersistence';

export function isSynchronized<T>(target: T) {
  if (isPersistence(target)) {
    return StorageConfiguration.getIsSynchronized(target);
  }

  console.warn('Only stores that persistence can use `isSynchronized` function.');
  return false;
}
