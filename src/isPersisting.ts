import { StorageConfiguration } from './StorageConfiguration';

export const isPersisting = <T>(target: T): boolean => {
  return StorageConfiguration.get(target)?.isPersisting ?? false;
};
