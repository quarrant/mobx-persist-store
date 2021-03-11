import { StorageConfiguration } from './StorageConfiguration';
import { isPersistence } from './isPersistence';

export function startPersist<T extends Object>(target: T) {
  if (isPersistence(target)) {
    const disposers = StorageConfiguration.getDisposers(target);
    if (!disposers.length) {
      const startPersistFunction = StorageConfiguration.getStartPersist(target);
      startPersistFunction?.()(target);
    }
  }
}
