# Mobx Persist Store

Persist and rehydrate observable properties in mobx store.

## Installation

`$ yarn add mobx-persist-store`

## Usage

Use the StorageAdapter to connect to your library from cache. It can be anything that is able to read and write data. For ReactNative it may be AsyncStorage, FS, etc. and for React - localStorage, sessionStorage, etc.

```javascript
import { action, observable } from 'mobx';
import { PersistStore, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise(resolve => {
    const data = localStorage.getItem(name);
    resolve(JSON.parse(data));
  });
}

function writeStore(name, content) {
  return new Promise(resolve => {
    localStorage.setItem(name, JSON.stringify(content));
    resolve();
  });
}

class CounterStore extends PersistStore {
  @observable counter: number = 0;

  constructor() {
    super({
      properties: ['counter'],
      adapter: new StorageAdapter({
        read: readStore,
        write: writeStore
      })
    });
  }

  @action tickCounter = () => {
    this.counter = this.counter + 1;
  };
}

export default new CounterStore();
```
