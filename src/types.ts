import { IReactionOptions } from 'mobx';
import { StorageAdapter } from './StorageAdapter';

export type PersistenceOptions = {
  name: string;
  properties: string[];
  adapter: StorageAdapter;
  reactionOptions?: IReactionOptions;
};

export type StorageAdapterOptions = {
  /**
   * @property {Boolean} [jsonify] When true the data will be JSON.stringify before being passed to setItem. The default value is true.
   * @default true
   */
  jsonify?: boolean;
  /**
   * @property {Number} [expiration] A value in milliseconds to determine when the data in storage should not be retrieved by getItem.
   *
   * Recommend the library https://github.com/henrikjoreteg/milliseconds to set the value
   */
  expireIn?: number;
  /**
   * @property {Number} [removeOnExpiration] If {@link StorageAdapterOptions#expireIn} has a value and has expired, the data in storage will be removed automatically when getItem is called. The default value is true.
   * @default true
   */
  removeOnExpiration?: boolean;
  /**
   * The function that will retrieved the storage data by a specific identifier.
   *
   * @function
   * @param {String} key
   * @return {Promise<String | Object>}
   */
  getItem: <T>(key: string) => Promise<string | T>;
  /**
   * The function that will save data to the storage by a specific identifier.
   *
   * @function
   * @param {String} key
   * @return {Promise<void>}
   */
  setItem: (key: string, item: any) => Promise<void>;
  /**
   * The function that will remove data from storage by a specific identifier.
   *
   * @function
   * @param {String} key
   * @return {Promise<void>}
   */
  removeItem: (key: string) => Promise<void>;
};
