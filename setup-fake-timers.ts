import fakeTimers from '@sinonjs/fake-timers';

const clock = fakeTimers.install({
  toFake: Object.keys(fakeTimers.timers) as fakeTimers.FakeMethod[],
});

export { clock };
