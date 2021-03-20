import { StorageConfiguration } from './StorageConfiguration';

export const clearPersist = async <T>(target: T): Promise<void> => {
  await StorageConfiguration.get(target)?.clearPersist();
};
