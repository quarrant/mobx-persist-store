import { buildExpireTimestamp, hasTimestampExpired } from '../src/utils';
import ms from 'milliseconds';

describe('buildExpireTimestamp', () => {
  test(`should build expire timestamp 5 days from now`, async () => {
    const fiveDaysInMilliseconds = ms.days(5);

    const actualResult = buildExpireTimestamp(fiveDaysInMilliseconds);
    const expectedResult = new Date().getTime() + fiveDaysInMilliseconds;

    expect(actualResult).toBe(expectedResult);
  });
});

describe('hasTimestampExpired', () => {
  test(`should not expire one milliseconds after timestamp`, async () => {
    const oneMillisecondFromNow = buildExpireTimestamp(1);

    const actualResult = hasTimestampExpired(oneMillisecondFromNow);
    const expectedResult = false;

    expect(actualResult).toBe(expectedResult);
  });

  test(`should expire if same as timestamp`, async () => {
    const now = buildExpireTimestamp(0);

    const actualResult = hasTimestampExpired(now);
    const expectedResult = true;

    expect(actualResult).toBe(expectedResult);
  });

  test(`should expire one milliseconds before timestamp`, async () => {
    const oneMillisecondBeforeNow = buildExpireTimestamp(-1);

    const actualResult = hasTimestampExpired(oneMillisecondBeforeNow);
    const expectedResult = true;

    expect(actualResult).toBe(expectedResult);
  });
});
