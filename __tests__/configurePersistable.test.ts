import ms from 'milliseconds';
import { configurePersistable, mpsConfig } from '../lib';

describe('configurePersistable', () => {
  const config = {
    expireIn: ms.days(7),
    removeOnExpiration: false,
    stringify: false,
    storage: localStorage,
    delay: 200,
  };

  test(`should set global config`, () => {
    configurePersistable(config);

    const actualResult = mpsConfig;
    const expectedResult = config;

    expect(actualResult).toBe(expectedResult);
  });
});
