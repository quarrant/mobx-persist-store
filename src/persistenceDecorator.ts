import { extendObservable, reaction, ObservableMap, makeAutoObservable } from 'mobx';

import { StorageConfiguration } from './StorageConfiguration';
import { PersistenceStore, PersistenceDecoratorOptions } from './types';
import { getObjectKeys, getObservableTargetObject, mobxNewestVersionSelect } from './utils';

export function persistenceDecorator(options: PersistenceDecoratorOptions) {
  return function <T extends { new (...args: any): {} }>(target: T) {
    StorageConfiguration.setAdapter(options.name, options.adapter);

    const properties = options.properties as (keyof T)[];
    const targetPrototype = target.prototype as PersistenceStore<T>;

    const extendObservableWrapper = mobxNewestVersionSelect(Object.assign, extendObservable);
    const makeAutoObservableWrapper = mobxNewestVersionSelect(makeAutoObservable, (target) => target);

    const observableTargetPrototype = extendObservableWrapper(makeAutoObservableWrapper(targetPrototype), {
      _isPersistence: true,
      _storageName: options.name,
      get _asJS() {
        return getObservableTargetObject(targetPrototype, properties);
      },
    });

    const disposer = reaction(
      () => observableTargetPrototype._asJS,
      (jsObject) => options.adapter.writeInStorage(observableTargetPrototype._storageName, jsObject),
      options.reactionOptions,
    );

    StorageConfiguration.setDisposers(observableTargetPrototype, [disposer]);

    options.adapter
      .readFromStorage<typeof observableTargetPrototype>(observableTargetPrototype._storageName)
      .then((content) => {
        if (content) {
          getObjectKeys(content).forEach((property) => {
            if (observableTargetPrototype[property] instanceof ObservableMap) {
              const targetPartial = observableTargetPrototype[property];
              const mapSource = getObjectKeys(content[property]).reduce<
                [keyof typeof targetPartial, Record<string, any>][]
              >((p, k) => {
                p.push([k, content[property][k]]);
                return p;
              }, []);
              const observableMap = new Map(mapSource);
              observableTargetPrototype[property] = (observableMap as unknown) as typeof targetPartial;
            } else {
              observableTargetPrototype[property] = content[property];
            }
          });
        }

        StorageConfiguration.setIsSynchronized(observableTargetPrototype, true);
      });

    return observableTargetPrototype.constructor as PersistenceStore<T>;
  };
}
