import { StorageConfiguration } from './StorageConfiguration';

export const stopPersisting = <T>(target: T): void => {
  StorageConfiguration.get(target)?.stopPersisting();
};
