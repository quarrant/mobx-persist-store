import {
  IReactionOptions,
  extendObservable,
  isComputedProp,
  IComputedValue,
  reaction,
  isObservableProp,
  ObservableMap,
} from 'mobx';

import StorageAdapter from './StorageAdapter';
import StorageConfiguration from './StorageConfiguration';

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
      return { ...result, [property]: target[property] };
    }

    return result;
  }, {} as T);
}

export default function persistenceDecorator(options: Options) {
  return function<T extends { new (...args: any[]): {} }>(target: T) {
    StorageConfiguration.setAdapter(options.name, options.adapter);

    const properties = options.properties as (keyof T)[];
    const targetPrototype = target as T & { _asJS: IComputedValue<string>; _storageName: string };

    extendObservable(targetPrototype, {
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

    StorageConfiguration.setDisposers(targetPrototype._storageName, [disposer]);

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

      StorageConfiguration.setIsSynchronized(targetPrototype._storageName, true);
    });
  };
}
