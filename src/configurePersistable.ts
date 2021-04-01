import { MobxPersistStoreConfig, ReactionOptions } from './types';

export let mpsConfig: Readonly<MobxPersistStoreConfig> = {};
export let mpsReactionOptions: Readonly<ReactionOptions> = {};

export const configurePersistable = (config: MobxPersistStoreConfig, reactionOptions: ReactionOptions = {}): void => {
  mpsConfig = config;
  mpsReactionOptions = reactionOptions;
};
