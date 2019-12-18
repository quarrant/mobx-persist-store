import StorageConfiguration from './StorageConfiguration';

export default function useDisposers<T extends Object>(target: T) {
  const disposers = StorageConfiguration.getDisposers(target);
  disposers.forEach((disposers) => disposers());
}
