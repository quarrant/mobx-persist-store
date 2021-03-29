import { MobxPersistStoreConfig } from './types';

export let mpsConfig: Readonly<MobxPersistStoreConfig> = {};

export const configure = (config: MobxPersistStoreConfig) => {
  mpsConfig = config;
};
