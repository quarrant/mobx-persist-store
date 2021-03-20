import { StorageConfiguration } from './StorageConfiguration';

export const rehydrateStore = async <T>(target: T): Promise<void> => {
  await StorageConfiguration.get(target)?.rehydrateStore();
};
