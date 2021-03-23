import { IReactionOptions } from 'mobx';
import { StorageAdapter } from './StorageAdapter';

export type PersistenceOptions = {
  name: string;
  properties: string[];
  adapter: StorageAdapter;
  reactionOptions?: IReactionOptions;
};

export type StorageAdapterOptions = {
  write: (name: string, value: string) => Promise<Error | void>;
  read: (name: string) => Promise<string | undefined>;
};
