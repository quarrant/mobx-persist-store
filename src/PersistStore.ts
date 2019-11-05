import { observable, observe } from 'mobx';

import StorageAdapter from './StorageAdapter';

interface Options<T> {
  properties: (keyof T)[];
  adapter: StorageAdapter;
  delay?: number;
}

export default class PersistStore<T = {}> {
  private lastSynchronizedProperties: Partial<T> = {};

  @observable isSynchronized: boolean = false;

  constructor(options: Options<T>) {
    console.warn(
      'PersistStore is deprecated. Use persistConfigure in constructor instead of PersistStore'
    );

    if (!options.delay) options.delay = 5000;

    observe(this, ({ object }: { object: Partial<T> }) => {
      const keysIntersection = this.getKeysIntersection(
        options.properties,
        object
      );
      const omitSource = this.getOmitSource(object, keysIntersection);
      const isNeedUpdateSnapshot = this.checkNeedToUpdateSnapshot(
        keysIntersection,
        omitSource
      );

      if (isNeedUpdateSnapshot) {
        options.adapter
          .writeInStorage(this.constructor.name, omitSource)
          .then(() => {
            this.lastSynchronizedProperties = omitSource;
          });
      }
    });

    options.adapter.readFromStorage<T>(this.constructor.name).then(source => {
      if (source) {
        const keysIntersection = this.getKeysIntersection(
          options.properties,
          source
        );

        keysIntersection.forEach(key => {
          if (this.hasOwnProperty(key)) {
            ((this as unknown) as T)[key] = source[key];
          }
        });
      }

      this.isSynchronized = true;
    });
  }

  private getKeysIntersection = (
    properties: (keyof T)[],
    object: Partial<T>
  ) => {
    const objectKeys = this.getKeys(object);

    return objectKeys.filter(key => properties.includes(key));
  };

  private getKeys = (source: Partial<T>) => {
    return Object.keys(source) as (keyof T)[];
  };

  private getOmitSource = (
    source: Partial<T>,
    keysIntersection: (keyof T)[]
  ) => {
    return keysIntersection.reduce<Partial<T>>(
      (prev, curr) => ({ ...prev, [curr]: source[curr] }),
      {}
    );
  };

  private checkNeedToUpdateSnapshot = (
    objectKeys: (keyof T)[],
    omitObject: Partial<T>
  ) => {
    return objectKeys.reduce((prev, curr) => {
      if (this.lastSynchronizedProperties[curr] !== omitObject[curr]) {
        return true;
      }

      return prev;
    }, false);
  };
}
