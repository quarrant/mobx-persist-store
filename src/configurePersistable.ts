import { ReactionOptions, StorageOptions } from './types';

export let mpsConfig: Readonly<StorageOptions> = {};
export let mpsReactionOptions: Readonly<ReactionOptions> = {};

export const configurePersistable = (config: StorageOptions, reactionOptions: ReactionOptions = {}): void => {
  mpsConfig = config;
  mpsReactionOptions = reactionOptions;
};
