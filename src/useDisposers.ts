import StorageConfiguration from './StorageConfiguration';
import { PersistenceStore } from './types';

export default function useDisposers<T extends Object>(target: PersistenceStore<T>) {
  const disposers = StorageConfiguration.getDisposers(target);
  disposers.forEach((disposers) => disposers());
}
