import { StorageConfiguration } from './StorageConfiguration';

export const stopPersist = <T>(target: T): void => {
  StorageConfiguration.get(target)?.stopPersist();
};
