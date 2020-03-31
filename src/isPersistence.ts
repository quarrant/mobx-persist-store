import { PersistenceStore } from './types';

export default function isPersistence<T extends Object>(target: T): target is PersistenceStore<T> {
  return !!target.hasOwnProperty('_isPersistence');
}
