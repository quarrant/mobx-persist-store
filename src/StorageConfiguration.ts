import { IReactionDisposer, observable, action } from 'mobx';

import StorageAdapter from './StorageAdapter';

class StorageConfiguration {
  private adapterMap: Map<string, StorageAdapter> = new Map();
  private disposersMap: Map<string, IReactionDisposer[]> = new Map();
  private isSynchronizedMap: Map<string, boolean> = observable.map();

  setAdapter = (targetName: string, adapter: StorageAdapter) => {
    this.adapterMap.set(targetName, adapter);
  };

  setDisposers = (targetName: string, disposers: IReactionDisposer[]) => {
    this.disposersMap.set(targetName, disposers);
  };

  @action setIsSynchronized = (targetName: string, isSynchronized: boolean) => {
    this.isSynchronizedMap.set(targetName, isSynchronized);
  };

  getAdapter = (targetName: string) => {
    return this.adapterMap.get(targetName);
  };

  getDisposers = (targetName: string) => {
    return this.disposersMap.get(targetName) || [];
  };

  getIsSynchronized = (targetName: string) => {
    return this.isSynchronizedMap.get(targetName) || false;
  };
}

export default new StorageConfiguration();
