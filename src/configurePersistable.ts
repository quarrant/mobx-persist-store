import { MobxPersistStoreConfig } from './types';

export let mpsConfig: Readonly<MobxPersistStoreConfig> = {};

export const configurePersistable = (config: MobxPersistStoreConfig) => {
  mpsConfig = config;
};
