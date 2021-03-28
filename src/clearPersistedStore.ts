import { StorageConfiguration } from './StorageConfiguration';

export const clearPersistedStore = async <T>(target: T): Promise<void> => {
  await StorageConfiguration.get(target)?.clearPersistedStore();
};
