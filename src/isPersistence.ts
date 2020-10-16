import { PersistenceStore } from './types';

export function isPersistence<T extends { _isPersistence?: boolean }>(
  target: T,
): target is PersistenceStore<T> {
  return !!target._isPersistence;
}
