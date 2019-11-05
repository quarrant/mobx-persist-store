import { reaction, extendObservable, IReactionDisposer } from 'mobx';

interface Adapter<T> {
  write: (name: string, content: T) => Promise<Error | undefined>;
  read: (name: string) => Promise<T | undefined>;
}

interface Options<T> {
  properties: (keyof T)[];
  adapter: Adapter<T>;
  delay?: number;
}

type Synchronize<T> = T & {
  isSynchronized?: boolean;
};

function dispose(disposers: IReactionDisposer[]) {
  disposers.forEach(disposer => disposer());
}

function getKeys<T>(object: T) {
  return Object.keys(object) as (keyof T)[];
}

export default function persistConfigure<T>(
  target: Synchronize<T>,
  options: Options<T>
) {
  if (!options.delay) options.delay = 5000;

  if (!target.hasOwnProperty('isSynchronized')) {
    extendObservable(target, { isSynchronized: false });
  }

  const disposers: IReactionDisposer[] = [];
  const reactionOptions = { delay: options.delay };

  options.properties.forEach(property => {
    const disposer = reaction(
      () => target[property],
      () => options.adapter.write(target.constructor.name, target),
      reactionOptions
    );

    disposers.push(disposer);
  });

  options.adapter.read(target.constructor.name).then(content => {
    if (content) {
      getKeys(content).forEach(property => {
        target[property] = content[property];
      });
    }

    target.isSynchronized = true;
  });

  return () => dispose(disposers);
}
