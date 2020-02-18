import { IReactionDisposer, observable, action } from 'mobx';

import StorageAdapter from './StorageAdapter';
import { PersistenceStore } from './types';

class StorageConfiguration<T> {
  private adapterMap: Map<string, StorageAdapter> = new Map();
  private disposersMap: Map<string, IReactionDisposer[]> = new Map();
  private isSynchronizedMap: Map<string, boolean> = observable.map();

  private getStorageNameFromTarget = (target: PersistenceStore<T>) => {
    return target._storageName || target.constructor.name;
  };

  setAdapter = (storageName: string, adapter: StorageAdapter) => {
    this.adapterMap.set(storageName, adapter);
  };

  setDisposers = (target: PersistenceStore<T>, disposers: IReactionDisposer[]) => {
    const storageName = this.getStorageNameFromTarget(target);
    this.disposersMap.set(storageName, disposers);
  };

  @action setIsSynchronized = (target: PersistenceStore<T>, isSynchronized: boolean) => {
    const storageName = this.getStorageNameFromTarget(target);
    this.isSynchronizedMap.set(storageName, isSynchronized);
  };

  getAdapter = (target: PersistenceStore<T>) => {
    const storageName = this.getStorageNameFromTarget(target);
    return this.adapterMap.get(storageName);
  };

  getDisposers = (target: PersistenceStore<T>) => {
    const storageName = this.getStorageNameFromTarget(target);
    return this.disposersMap.get(storageName) || [];
  };

  getIsSynchronized = (target: PersistenceStore<T>) => {
    const storageName = this.getStorageNameFromTarget(target);
    return this.isSynchronizedMap.get(storageName) || false;
  };
}

export default new StorageConfiguration();
