import { IComputedValue, IReactionOptions } from 'mobx';
import { StorageAdapter } from './StorageAdapter';

export type PersistenceStore<T> = T & { _asJS: IComputedValue<string>; _storageName: string; _isPersistence: boolean };

export type PersistenceDecoratorOptions = {
  name: string;
  properties: string[];
  adapter: StorageAdapter;
  reactionOptions?: IReactionOptions;
};

export type StorageAdapterOptions = {
  write: (name: string, value: string) => Promise<Error | void>;
  read: (name: string) => Promise<string | undefined>;
};

