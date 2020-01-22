import {
  IReactionOptions,
  extendObservable,
  computed,
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
        console.log('The property `' + property + '` is computed and will not persist.');
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
  StorageConfiguration.setAdapter(options.name, options.adapter);

  return function<T extends Object>(target: T) {
    const properties = options.properties as (keyof T)[];
    const selfTarget = target as T & { _asJS: IComputedValue<string> };

    extendObservable(selfTarget, {
      _asJS: computed(function() {
        return getObservableTargetObject(selfTarget, properties);
      }),
    });

    const disposer = reaction(
      () => selfTarget._asJS,
      (jsObject) => options.adapter.writeInStorage(options.name, jsObject),
      options.reactionOptions,
    );

    StorageConfiguration.setDisposers(options.name, [disposer]);

    options.adapter.readFromStorage<T>(options.name).then((content) => {
      if (content) {
        getKeys(content).forEach((property) => {
          if (target[property] instanceof ObservableMap) {
            const targetPartial = target[property];
            const mapSource = getKeys(content[property]).reduce<[keyof T[keyof T], Record<string, any>][]>((p, k) => {
              p.push([k, content[property][k]]);
              return p;
            }, []);
            const observableMap = new Map(mapSource);
            target[property] = (observableMap as unknown) as typeof targetPartial;
          } else {
            target[property] = content[property];
          }
        });
      }

      StorageConfiguration.setIsSynchronized(options.name, true);
    });
  };
}
