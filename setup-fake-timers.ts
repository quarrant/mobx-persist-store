import fakeTimers from '@sinonjs/fake-timers';

export const clock = fakeTimers.install({
  toFake: Object.keys(fakeTimers.timers) as fakeTimers.FakeMethod[],
});
