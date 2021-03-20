import { MobxStorePersist } from './MobxStorePersist';
import { PersistenceDecoratorOptions } from './types';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const MobxStorePersistStorage: Map<any, MobxStorePersist<any>> = new Map();

export const persistence = (options: PersistenceDecoratorOptions) => <T>(target: T): MobxStorePersist<T> => {
  const mobxStorePersist = new MobxStorePersist(options, target);

  MobxStorePersistStorage.set(target, mobxStorePersist);

  return mobxStorePersist;
};

export const startPersist = <T>(target: T): void => {
  MobxStorePersistStorage.get(target)?.startPersist();
};

export const stopPersist = <T>(target: T): void => {
  MobxStorePersistStorage.get(target)?.stopPersist();
};

export const clearPersist = async <T>(target: T): Promise<void> => {
  await MobxStorePersistStorage.get(target)?.clearPersist();
};

export const rehydrateStore = async <T>(target: T): Promise<void> => {
  await MobxStorePersistStorage.get(target)?.rehydrate();
};

export const disposePersist = <T>(target: T): void => {
  MobxStorePersistStorage.get(target)?.dispose();
};

export const isHydrated = <T>(target: T): boolean => {
  return MobxStorePersistStorage.get(target)?.isHydrated ?? false;
};

export const isPersisting = <T>(target: T): boolean => {
  return MobxStorePersistStorage.get(target)?.isPersisting ?? false;
};
