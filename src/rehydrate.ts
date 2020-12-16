import { autorun } from 'mobx';
import { isSynchronized } from './isSynchronized';

export function rehydrate<T>(target: T): Promise<void> {
  return new Promise((resolve) => {
    const disposer = autorun(() => {
      if (isSynchronized(target)) {
        disposer();
        resolve();
      }
    });
  });
}
