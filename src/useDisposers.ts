import StorageConfiguration from './StorageConfiguration';

export default function useDisposers<T extends Object>(target: T) {
  const disposers = StorageConfiguration.getDisposers(target.constructor.name);
  disposers.forEach((disposers) => disposers());
}
