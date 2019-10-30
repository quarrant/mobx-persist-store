# Mobx Persist Store

Persist and rehydrate observable properties in mobx store.

## Installation

`$ yarn add mobx-persist-store`

## Usage

```javascript
import { action, observable } from "mobx";
import { PersistStore, StorageAdapter } from "mobx-persist-store";

function readStore(name: string) {
  return new Promise(resolve => {
    const data = localStorage.getItem(name);
    resolve(JSON.parse(data));
  });
}

function writeStore(name: string, content: string) {
  return new Promise(resolve => {
    localStorage.setItem(name, JSON.stringify(content));
    resolve();
  });
}

class CounterStore extends PersistStore<CounterStore> {
  @observable counter: number = 0;

  constructor() {
    super({
      properties: ["counter"],
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
