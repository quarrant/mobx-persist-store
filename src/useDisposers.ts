import StorageConfiguration from './StorageConfiguration';

export default function useDisposers<T extends Object>(target: T & { _storageName?: string }) {
  const disposers = StorageConfiguration.getDisposers(target._storageName || target.constructor.name);
  disposers.forEach((disposers) => disposers());
}
