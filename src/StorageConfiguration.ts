import { IReactionDisposer, observable, action } from 'mobx';

import StorageAdapter from './StorageAdapter';
import { PersistenceStore } from './types';

class StorageConfiguration<T> {
  private adapterMap: Map<string, StorageAdapter> = new Map();
  private disposersMap: Map<string, IReactionDisposer[]> = new Map();
  private isSynchronizedMap: Map<string, boolean> = observable.map();

  setAdapter = (storageName: string, adapter: StorageAdapter) => {
    this.adapterMap.set(storageName, adapter);
  };

  setDisposers = (target: PersistenceStore<T>, disposers: IReactionDisposer[]) => {
    this.disposersMap.set(target._storageName, disposers);
  };

  @action setIsSynchronized = (target: PersistenceStore<T>, isSynchronized: boolean) => {
    this.isSynchronizedMap.set(target._storageName, isSynchronized);
  };

  getAdapter = (target: PersistenceStore<T>) => {
    return this.adapterMap.get(target._storageName);
  };

  getDisposers = (target: PersistenceStore<T>) => {
    return this.disposersMap.get(target._storageName) || [];
  };

  getIsSynchronized = (target: PersistenceStore<T>) => {
    return this.isSynchronizedMap.get(target._storageName) || false;
  };
}

export default new StorageConfiguration();
