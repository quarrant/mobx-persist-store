import { StorageConfiguration } from './StorageConfiguration';

export const disposePersist = <T>(target: T): void => {
  StorageConfiguration.get(target)?.dispose();
};
