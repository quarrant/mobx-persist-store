import { StorageConfiguration } from './StorageConfiguration';

export const hydrateStore = async <T>(target: T): Promise<void> => {
  await StorageConfiguration.get(target)?.hydrateStore();
};
