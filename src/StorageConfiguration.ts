import { IReactionDisposer, observable, action } from 'mobx';

import StorageAdapter from './StorageAdapter';

class StorageConfiguration {
  private adapterMap: Map<string, StorageAdapter> = new Map();
  private disposersMap: Map<string, IReactionDisposer[]> = new Map();
  private isSynchronizedMap: Map<string, boolean> = observable.map();

  setAdapter = <T extends Object>(target: T, adapter: StorageAdapter) => {
    this.adapterMap.set(target.constructor.name, adapter);
  };

  setDisposers = <T extends Object>(target: T, disposers: IReactionDisposer[]) => {
    this.disposersMap.set(target.constructor.name, disposers);
  };

  @action setIsSynchronized = <T extends Object>(target: T, isSynchronized: boolean) => {
    this.isSynchronizedMap.set(target.constructor.name, isSynchronized);
  };

  getAdapter = <T extends Object>(target: T) => {
    return this.adapterMap.get(target.constructor.name);
  };

  getDisposers = <T extends Object>(target: T) => {
    return this.disposersMap.get(target.constructor.name) || [];
  };

  getIsSynchronized = <T extends Object>(target: T) => {
    return this.isSynchronizedMap.get(target.constructor.name) || false;
  };
}

export default new StorageConfiguration();
