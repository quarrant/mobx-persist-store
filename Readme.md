
<h1 align="center">Mobx Persist Store</h1>
<h4 align="center">A simple way to persist and rehydrate observable properties in mobx stores</h4>
<div align="center">
	<a href="https://yarn.pm/mobx-persist-store"><img
		alt="npm version"
		src="https://img.shields.io/npm/v/mobx-persist-store.svg?colorA=333a41&maxAge=3600"></a>
	<a href="https://npm-stat.com/charts.html?package=mobx-persist-store&from=2016-02-12"><img
		alt="Total downloads on npm"
		src="https://img.shields.io/npm/dm/mobx-persist-store.svg?colorA=333a41&colorB=007dc7&maxAge=3600&label=Downloads"></a>
</div>
<div align="center">:star: Star us on GitHub — it helps!</div>

## Table of content

- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
  - [With Decorators](#with-decorators)
  - [Without Decorators](#without-decorators)
  - [With Mobx 6](#with-mobx-6)
- [API](#api)
  - [persistence](#persistence)
  - [StorageAdapter](#storageadapter)
  - [clearPersist](#clearpersist)
  - [stopPersist](#stoppersist)
  - [isSynchronized](#issynchronized)
- [Links](#links)

## Installation

```text
# by yarn
yarn add mobx-persist-store

# OR by npm
npm i mobx-persist-store
```

## Demo


<a href="https://codesandbox.io/s/mobx-persist-store-with-mobx-6-zosms?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fstores%2FUser.store.ts&theme=dark" target="_blank">Mobx Persist Store with MobX 6</a>
<a href="https://codesandbox.io/s/mobx-persist-store-with-mobx-6-zosms?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fstores%2FUser.store.ts&theme=dark" target="_blank">![demo screen shot](./demo-screen-shot.png)</a>


## Usage

Use the **StorageAdapter** to connect to your library from cache. It can be anything that is able to read and write data. For **ReactNative** it may be `AsyncStorage`, `FS`, etc. and for **React** - `localStorage`, `sessionStorage`, etc.

### With Decorators

```javascript
import { action, observable, computed } from 'mobx';
import { persistence, clearPersist, stopPersist, isSynchronized, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(name);
    resolve(data);
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
    delay: 200
  },
})
class CounterStore {
  @observable counter = 0;

  @action tickCounter = () => {
    this.counter = this.counter + 1;
  };

  @action clearStore = () => {
    clearPersist(this)
  }

  @action stopPersist = () => {
    stopPersist(this)
  }

  @computed get isSynchronized() {
    return isSynchronized(this)
  }
}

export default new CounterStore();
```

### Without Decorators

```javascript
import { action, observable, computed, decorate } from 'mobx';
import { persistence, clearPersist, stopPersist, isSynchronized, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(name);
    resolve(data);
  });
}

function writeStore(name, content) {
  return new Promise((resolve) => {
    localStorage.setItem(name, content);
    resolve();
  });
}

class CounterStore {
  counter = 0;

  tickCounter = () => {
    this.counter = this.counter + 1;
  };

  clearStore = () => {
    clearPersist(this)
  }

  stopPersist = () => {
    stopPersist(this)
  }

  get isSynchronized() {
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
    delay: 200
  },
})(CounterStore);

export default new CounterStore();
```

### With Mobx 6

```javascript
import { makeAutoObservable } from 'mobx';
import { persistence, clearPersist, stopPersist, isSynchronized, StorageAdapter } from 'mobx-persist-store';

function readStore(name) {
  return new Promise((resolve) => {
    const data = localStorage.getItem(name);
    resolve(data);
  });
}

function writeStore(name, content) {
  return new Promise((resolve) => {
    localStorage.setItem(name, content);
    resolve();
  });
}

class CounterStore {
  counter = 0;

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
    delay: 200,
  },
})(new CounterStore());
```

## API

#### persistence

> **persistence** creates a reaction to changes in observable properties.
>  - `name` should be a unique identifier and will be available within the read/write functions of the StorageAdapter.
>  - `properties` is a list of observable properties on the store you want to persist.
>  - `adapter` facilitates the reading and writing of the persisted store data.
>  - `reactionOptions` is an optional property that allows you to set a `delay` option to limit the amount of times the `write` function is called.
     >     -  For example if you have a `200` millisecond delay and two changes happen within the delay time then the `write` function is only called once. If you have no delay then the `write` function would be called twice.
>
> ```javascript
> import { persistence } from 'mobx-persist-store';
>
> export default persistence({
>    name: 'CounterStore',
>    properties: ['counter'],
>    adapter: new StorageAdapter({
>      read: readStore,
>      write: writeStore,
>    }),
>    reactionOptions: { // optional
>      delay: 200,
>    },
> })(new CounterStore());
> ```

#### StorageAdapter

> **StorageAdapter** will handle hydrating the store with the cache data when the store is first loaded. The write function is called any time a property in the `properties` array changes.
>
> ```javascript
> import { StorageAdapter } from 'mobx-persist-store';
>
> new StorageAdapter({
>   read: async (name) => {
>     const data = window.localStorage.getItem(name);
>
>     return data ? JSON.parse(data) : undefined;
>   },
>   write: async (name, content) => {
>     window.localStorage.setItem(name, JSON.stringify(content));
>   },
> })
> ```

#### clearPersist

> **clearPersist** removes all the data that was saved from the store. The `write` function on the StorageAdapter is called with an empty object `{}`.
>
> ```javascript
> import { clearPersist } from 'mobx-persist-store';
>
> class CounterStore {
>   counter = 0;
>   ...
>   clearStore = () => {
>     clearPersist(this)
>   }
> }
> ```

#### stopPersist

> **stopPersist**  stops saving any changes from the store.
>
> ```javascript
> import { stopPersist } from 'mobx-persist-store';
>
> class CounterStore {
>   counter = 0;
>   ...
>   stopPersist = () => {
>     stopPersist(this)
>   }
> }
> ```

#### isSynchronized

> **isSynchronized** indicates whether the store has been restored after reading the cache asynchronous.
>
> ```javascript
> import { isSynchronized } from 'mobx-persist-store';
>
> class CounterStore {
>   counter = 0;
>   ...
>   get isSynchronized() {
>     return isSynchronized(this)
>   }
> }
> ```

## Links

* [MobX Site](https://mobx.js.org/README.html)
