import { mpsConfig } from './configurePersistable';
import { PersistenceStorageOptions } from './types';
import { consoleDebug, isObject } from './utils';

export type SerializableProperty<T, P extends keyof T> = {
  [X in P]: {
    key: X;
    serialize: (value: T[X]) => any;
    deserialize: (value: any) => T[X];
  };
}[P];

const isSerializableProperty = <T, P extends keyof T>(obj: any): obj is SerializableProperty<T, P> => {
  const keys: (keyof SerializableProperty<T, P>)[] = ['key', 'serialize', 'deserialize'];

  if (!isObject(obj)) {
    consoleDebug(!!mpsConfig.debugMode, 'passed value is not an object', { obj });
    return false;
  }

  return keys.every((key) => {
    if (obj.hasOwnProperty(key) && typeof key !== 'undefined') {
      return true;
    }

    consoleDebug(!!mpsConfig.debugMode, `${String(key)} not found in SerializableProperty`, { key, obj });
    return false;
  });
};

export const makeSerializableProperties = <T, P extends keyof T>(
  properties: PersistenceStorageOptions<T, P>['properties']
): SerializableProperty<T, P>[] => {
  return properties.reduce(
    (acc, curr) => {
      if (typeof curr === 'string') {
        acc.push({
          key: curr,
          serialize: <V>(value: V) => value,
          deserialize: (value: any) => value,
        });

        return acc;
      }

      if (isSerializableProperty<T, P>(curr)) {
        acc.push(curr);
        return acc;
      }

      return acc;
    },
    [] as SerializableProperty<T, P>[]
  );
};
