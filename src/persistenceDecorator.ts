import { IReactionOptions, extendObservable, isComputedProp, reaction, isObservableProp, ObservableMap } from 'mobx';

import StorageAdapter from './StorageAdapter';
import StorageConfiguration from './StorageConfiguration';
import { PersistenceStore } from './types';

type Options = {
  name: string;
  properties: string[];
  adapter: StorageAdapter;
  reactionOptions?: IReactionOptions;
};

function getKeys<T>(object: T) {
  return Object.keys(object) as (keyof T)[];
}

function getObservableTargetObject<T extends Object>(target: T, properties: (keyof T)[]) {
  return properties.reduce((result, property) => {
    const observableProperty = isObservableProp(target, String(property));
    const computedProperty = isComputedProp(target, String(property));

    if (!observableProperty || computedProperty) {
      if (computedProperty) {
        console.warn('The property `' + property + '` is computed and will not persist.');
        return result;
      }

      console.warn('The property `' + property + '` is not observable and not affected reaction, but will persist.');
    }

    if (target.hasOwnProperty(property)) {
      let value: T[keyof T] | any[] = target[property]

      if (Array.isArray(value)) {
        value = value.slice()
      }

      return { ...result, [property]: target[property] };
    }

    return result;
  }, {} as T);
}

export default function persistenceDecorator(options: Options) {
  return function<T extends { new (...args: any): {} }>(target: T) {
    StorageConfiguration.setAdapter(options.name, options.adapter);

    const properties = options.properties as (keyof T)[];
    const targetPrototype = target.prototype as PersistenceStore<T>;

    extendObservable(targetPrototype, {
      _isPersistence: true,
      _storageName: options.name,
      get _asJS() {
        return getObservableTargetObject(targetPrototype, properties);
      },
    });

    const disposer = reaction(
      () => targetPrototype._asJS,
      (jsObject) => options.adapter.writeInStorage(targetPrototype._storageName, jsObject),
      options.reactionOptions,
    );

    StorageConfiguration.setDisposers(targetPrototype, [disposer]);

    options.adapter.readFromStorage<typeof targetPrototype>(targetPrototype._storageName).then((content) => {
      if (content) {
        getKeys(content).forEach((property) => {
          if (targetPrototype[property] instanceof ObservableMap) {
            const targetPartial = targetPrototype[property];
            const mapSource = getKeys(content[property]).reduce<[keyof typeof targetPartial, Record<string, any>][]>(
              (p, k) => {
                p.push([k, content[property][k]]);
                return p;
              },
              [],
            );
            const observableMap = new Map(mapSource);
            targetPrototype[property] = (observableMap as unknown) as typeof targetPartial;
          } else {
            targetPrototype[property] = content[property];
          }
        });
      }

      StorageConfiguration.setIsSynchronized(targetPrototype, true);
    });

    return target as PersistenceStore<T>;
  };
}
