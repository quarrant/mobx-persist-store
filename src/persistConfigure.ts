import { reaction, isObservableProp, IReactionDisposer, ObservableMap } from 'mobx';

import StorageAdapter from './StorageAdapter';

interface Options<T> {
  properties: (keyof T)[];
  adapter: StorageAdapter;
  delay?: number;
}

type Synchronize<T> = T & {
  isSynchronized?: boolean;
};

function dispose(disposers: IReactionDisposer[]) {
  disposers.forEach((disposer) => disposer());
}

function getKeys<T>(object: T) {
  return Object.keys(object) as (keyof T)[];
}

function notObservableProp(property: string) {
  console.warn('The property `' + property + '` is not observable and not affected reaction.');
}

export default function persistConfigure<T>(target: Synchronize<T>, options: Options<T>) {
  if (!isObservableProp(target, 'isSynchronized')) notObservableProp('isSynchronized');

  target.isSynchronized = false;

  const disposers: IReactionDisposer[] = [];
  const reactionOptions = { delay: options.delay };

  options.properties.forEach((property) => {
    if (!isObservableProp(target, String(property))) {
      notObservableProp(String(property));
      return;
    }

    const disposer = reaction(
      () => target[property],
      () => options.adapter.writeInStorage(target.constructor.name, target),
      reactionOptions,
    );

    disposers.push(disposer);
  });

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

    target.isSynchronized = true;
  });

  return {
    disposer: () => dispose(disposers),
    clear: () => options.adapter.writeInStorage(target.constructor.name, {}),
  };
}
