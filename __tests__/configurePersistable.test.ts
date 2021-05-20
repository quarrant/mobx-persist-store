import ms from 'milliseconds';
import { mpsConfig, mpsReactionOptions, StorageOptions, configurePersistable, ReactionOptions } from '../src';

describe('configurePersistable', () => {
  const config: StorageOptions = {
    expireIn: ms.days(7),
    removeOnExpiration: false,
    stringify: false,
    storage: localStorage,
  };
  const reactionOptions: ReactionOptions = { delay: 200 };

  test(`should set global config`, () => {
    configurePersistable(config, reactionOptions);

    expect(config).toBe(mpsConfig);
    expect(reactionOptions).toBe(mpsReactionOptions);
  });
});
