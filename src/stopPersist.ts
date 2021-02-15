import { StorageConfiguration } from './StorageConfiguration';
import { isPersistence } from './isPersistence';

export function stopPersist<T extends Object>(target: T) {
  if (isPersistence(target)) {
    const disposers = StorageConfiguration.getDisposers(target);
    disposers.forEach((disposers) => disposers());
  }
}
