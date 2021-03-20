import { StorageConfiguration } from './StorageConfiguration';

export const isHydrated = <T>(target: T): boolean => {
  return StorageConfiguration.get(target)?.isHydrated ?? false;
};
