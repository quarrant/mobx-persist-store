
<h1 align="center">Mobx Persist Store</h1>
<h4 align="center">A simple way to persist and rehydrate observable properties in mobx stores</h4>
<div align="center">:star: Star us on GitHub — it helps!</div>

[![npm version](https://img.shields.io/npm/v/mobx-persist-store.svg?style=flat-square)](https://www.npmjs.com/package/mobx-persist-store)
[![npm downloads](https://img.shields.io/npm/dm/mobx-persist-store.svg?style=flat-square)](https://www.npmjs.com/package/mobx-persist-store)

## Table of content

- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
    - [With decorators](#with-decorators)
    - [Without decorators](#without-decorators)
    - [With Mobx 6](#with-mobx-6)
- [API](#api)
- [License](#license)
- [Links](#links)

## Installation

```text
# by yarn
yarn add mobx-persist-store

# OR by npm
npm i mobx-persist-store
```

## Demo

[Mobx Persist Store with MobX 6](https://codesandbox.io/s/mobx-persist-store-with-mobx-6-zosms?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fstores%2FUser.store.ts&theme=dark)
[![gif image created with licecap](./demo-screen-shot.png)](https://codesandbox.io/s/mobx-persist-store-with-mobx-6-zosms?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fstores%2FUser.store.ts&theme=dark)


## Usage

Use the **StorageAdapter** to connect to your library from cache. It can be anything that is able to read and write data. For **ReactNative** it may be `AsyncStorage`, `FS`, etc. and for **React** - `localStorage`, `sessionStorage`, etc.

### With decorators

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
  @observable counter: number = 0;

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

### Without decorators

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
  counter: number = 0;

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
    delay: 200,
  },
})(new CounterStore());
```

## API

https://github.com/quarrant/mobx-persist-store/issues/6

> **persistence**
>
> `persistence` creates a reaction to changes in observable properties.
> 
> reactionOptions
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

> **StorageAdapter**
>
>  `StorageAdapter` read/write any changes through your functions.
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
>
>     return undefined;
>   },
> })
> ```

> **clearPersist**
>
>  `clearPersist` remove all cache from store.
>
> ```javascript
> import { clearPersist } from 'mobx-persist-store';
> 
> class CounterStore {
>   counter: number = 0;
>
>   tickCounter = () => {
>     this.counter = this.counter + 1;
>   };
>
>   clearStore = () => {
>     clearPersist(this)
>   }
> }
> ```

> **stopPersist**
>
>  `stopPersist` stop persistence for store.
>
> ```javascript
> import { stopPersist } from 'mobx-persist-store';
> 
> class CounterStore {
>   counter: number = 0;
>
>   tickCounter = () => {
>     this.counter = this.counter + 1;
>   };
>
>   stopPersist = () => {
>     stopPersist(this)
>   }
> }
> ```

> **isSynchronized**
>
>  `isSynchronized` indicates whether the storage is restored since cache reading is asynchronous.
>
> ```javascript
> import { isSynchronized } from 'mobx-persist-store';
> 
> class CounterStore {
>   counter: number = 0;
>
>   tickCounter = () => {
>     this.counter = this.counter + 1;
>   };
>
>   get isSynchronized() {
>     return isSynchronized(this)
>   }
> }
> ```

> **reactionOptions**
>
>  `reactionOptions` todo
>
> ```ts
> ```

## Links

* [MobX Site](https://mobx.js.org/README.html)
