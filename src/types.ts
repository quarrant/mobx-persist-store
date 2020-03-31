import { IComputedValue } from 'mobx';

export type PersistenceStore<T> = T & { _asJS: IComputedValue<string>; _storageName: string; _isPersistence: boolean };

export type StorageAdapterOptions = {
  write: (name: string, value: string) => Promise<Error | undefined>;
  read: (name: string) => Promise<string | undefined>;
};
