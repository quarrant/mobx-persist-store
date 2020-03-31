import StorageConfiguration from './StorageConfiguration';
import isPersistence from './isPersistence';

export default function useDisposers<T extends Object>(target: T) {
  if (isPersistence(target)) {
    const disposers = StorageConfiguration.getDisposers(target);
    disposers.forEach((disposers) => disposers());
  }
}
