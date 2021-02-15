# Mobx Persist Store

Persist and rehydrate observable properties in mobx store.

[![npm version](https://img.shields.io/npm/v/mobx-persist-store.svg?style=flat-square)](https://www.npmjs.com/package/mobx-persist-store) [![npm downloads](https://img.shields.io/npm/dm/mobx-persist-store.svg?style=flat-square)](https://www.npmjs.com/package/mobx-persist-store)

## Installation

`$ yarn add mobx-persist-store`

## Usage

Use the StorageAdapter to connect to your library from cache. It can be anything that is able to read and write data. For ReactNative it may be AsyncStorage, FS, etc. and for React - localStorage, sessionStorage, etc.

```javascript
import { action, observable, computed } from 'mobx';
import { persistence, useClear, useDisposers, isSynchronized, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(name);
    resolve(JSON.parse(data));
  });
}

function writeStore(name, content) {
  return new Promise((resolve) => {
    localStorage.setItem(name, content);
    resolve();
  });
}

@persistence({
  name: 'CounterStore',
  properties: ['counter'],
  adapter: new StorageAdapter({
    read: readStore,
    write: writeStore,
  }),
  reactionOptions: { // optional
    delay: 2000
  },
})
class CounterStore {
  @observable counter: number = 0;

  @action tickCounter = () => {
    this.counter = this.counter + 1;
  };

  @action clearStore = () => {
    useClear(this)
  }

  @action persistDispose = () => {
    useDisposers(this)
  }

  @computed get isSynchronized() => {
    return isSynchronized(this)
  }
}

export default new CounterStore();
```

## Without decorators

```javascript
import { action, observable, computed, decorate } from 'mobx';
import { persistence, useClear, useDisposers, isSynchronized, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(name);
    resolve(JSON.parse(data));
  });
}

function writeStore(name, content) {
  return new Promise((resolve) => {
    localStorage.setItem(name, content);
    resolve();
  });
}

class CounterStore {
  counter: number = 0;

  tickCounter = () => {
    this.counter = this.counter + 1;
  };

  clearStore = () => {
    useClear(this)
  }

  persistDespose = () => {
    useDisposers(this)
  }

  get isSynchronized() => {
    return isSynchronized(this)
  }
}

decorate(CounterStore, {
  counter: observable,
  tickCounter: action,
  clearStore: action,
  persistDispose: action,
  isSynchronized: computed
})

persistence({
  name: 'CounterStore',
  properties: ['counter'],
  adapter: new StorageAdapter({
    read: readStore,
    write: writeStore,
  }),
  reactionOptions: { // optional
    delay: 2000
  },
})(CounterStore);

export default new CounterStore();
```

## With Mobx 6

```javascript
import { makeAutoObservable } from 'mobx';
import { persistence, useClear, useDisposers, isSynchronized, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(name);
    resolve(JSON.parse(data));
  });
}

function writeStore(name, content) {
  return new Promise((resolve) => {
    localStorage.setItem(name, content);
    resolve();
  });
}

class CounterStore {
  counter: number = 0;

  tickCounter = () => {
    this.counter = this.counter + 1;
  };

  constructor() {
    makeAutoObservable(this);
  }
}

export default persistence({
  name: 'CounterStore',
  properties: ['counter'],
  adapter: new StorageAdapter({
    read: readStore,
    write: writeStore,
  }),
  reactionOptions: {
    // optional
    delay: 2000,
  },
})(new CounterStore());
```
