import { IReactionOptions, isObservableProp, reaction, IReactionDisposer, ObservableMap } from 'mobx';

import StorageConfiguration from './StorageConfiguration';
import StorageAdapter from './StorageAdapter';

type Options<T> = {
  properties: (keyof T)[];
  adapter: StorageAdapter;
  reactionOptions?: IReactionOptions;
};

function getKeys<T>(object: T) {
  return Object.keys(object) as (keyof T)[];
}

function getObservableTargetObject<T extends Object>(target: T, properties: (keyof T)[]) {
  return properties.reduce(
    (result, property) => {
      if (target.hasOwnProperty(property)) {
        return { ...result, [property]: target[property] };
      }

      return result;
    },
    {} as T,
  );
}

export default function usePersist<T extends Object>(target: T, options: Options<T>) {
  StorageConfiguration.setAdapter(target, options.adapter);

  const disposers: IReactionDisposer[] = [];

  options.properties.forEach((property) => {
    if (!isObservableProp(target, String(property))) {
      console.warn('The property `' + property + '` is not observable and not affected reaction, but will persist.');
      return;
    }

    const disposer = reaction(
      () => target[property],
      () => {
        const observableTargetObject = getObservableTargetObject(target, options.properties);
        options.adapter.writeInStorage(target.constructor.name, observableTargetObject);
      },
      options.reactionOptions,
    );

    disposers.push(disposer);
  });

  StorageConfiguration.setDisposers(target, disposers);

  options.adapter.readFromStorage<T>(target.constructor.name).then((content) => {
    if (content) {
      getKeys(content).forEach((property) => {
        if (target[property] instanceof ObservableMap) {
          const targetPartial = target[property];

          const mapSource = getKeys(content[property]).reduce<[keyof typeof targetPartial, Record<string, any>][]>(
            (p, k) => {
              p.push([k, content[property][k]]);
              return p;
            },
            [],
          );
          const observableMap = new Map(mapSource);

          target[property] = (observableMap as unknown) as typeof targetPartial;
        } else {
          target[property] = content[property];
        }
      });
    }

    StorageConfiguration.setIsSynchronized(target, true);
  });
}
