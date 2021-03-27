import { IReactionOptions } from 'mobx';
import { StorageAdapter } from './StorageAdapter';

export type PersistenceOptions = {
  name: string;
  properties: string[];
  adapter: StorageAdapter;
  reactionOptions?: IReactionOptions;
};

export type StorageAdapterOptions = {
  // jsonify bool Enables serialization as JSON
  jsonify?: boolean; // default true
  removeOnExpiration?: boolean; // default true
  expiration?: number; // milliseconds
  getItem: <T>(key: string) => Promise<string | T>;
  setItem: (key: string, item: any) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};
