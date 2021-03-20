import { PersistenceDecoratorOptions } from './types';
import { MobxStorePersist } from './MobxStorePersist';
import { StorageConfiguration } from './StorageConfiguration';

export const persistence = (options: PersistenceDecoratorOptions) => <T>(target: T): MobxStorePersist<T> => {
  const mobxStorePersist = new MobxStorePersist(options, target);

  StorageConfiguration.set(target, mobxStorePersist);

  return mobxStorePersist;
};
