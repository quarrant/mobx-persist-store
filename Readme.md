# Mobx Persist Store

Persist and rehydrate observable properties in mobx store.

[![npm version](https://img.shields.io/npm/v/mobx-persist-store.svg?style=flat-square)](https://www.npmjs.com/package/mobx-persist-store) [![npm downloads](https://img.shields.io/npm/dm/mobx-persist-store.svg?style=flat-square)](https://www.npmjs.com/package/mobx-persist-store)

## Installation

`$ yarn add mobx-persist-store`

## Usage

Use the StorageAdapter to connect to your library from cache. It can be anything that is able to read and write data. For ReactNative it may be AsyncStorage, FS, etc. and for React - localStorage, sessionStorage, etc.

```javascript
import { action, observable } from 'mobx';
import { persistConfigure, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(name);
    resolve(JSON.parse(data));
  });
}

function writeStore(name, content) {
  return new Promise((resolve) => {
    localStorage.setItem(name, JSON.stringify(content));
    resolve();
  });
}

class CounterStore {
  @observable counter: number = 0;

  constructor() {
    persistConfigure(this, {
      properties: ['counter'],
      adapter: new StorageAdapter({
        read: readStore,
        write: writeStore,
      }),
      delay: 2000, // optional
    });
  }

  @action tickCounter = () => {
    this.counter = this.counter + 1;
  };
}

export default new CounterStore();
```

## Usage (Deprecated)

```javascript
import { action, observable } from 'mobx';
import { PersistStore, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(name);
    resolve(JSON.parse(data));
  });
}

function writeStore(name, content) {
  return new Promise((resolve) => {
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
        write: writeStore,
      }),
    });
  }

  @action tickCounter = () => {
    this.counter = this.counter + 1;
  };
}

export default new CounterStore();
```

## API reference

### `persistConfigure`

```ts
persistConfigure(this, options: {
  propertis: (keyof T)[];
  adapter: StorageAdapter
})
```
