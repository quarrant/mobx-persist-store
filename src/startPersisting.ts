import { StorageConfiguration } from './StorageConfiguration';

export const startPersisting = <T>(target: T): void => {
  StorageConfiguration.get(target)?.startPersisting();
};
