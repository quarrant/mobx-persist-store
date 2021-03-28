import { StorageConfiguration } from './StorageConfiguration';

export const pausePersisting = <T>(target: T): void => {
  StorageConfiguration.get(target)?.pausePersisting();
};
