import { StorageConfiguration } from './StorageConfiguration';

export const startPersist = <T>(target: T): void => {
  StorageConfiguration.get(target)?.startPersist();
};
