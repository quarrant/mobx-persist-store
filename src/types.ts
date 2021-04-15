import { IReactionOptions } from 'mobx';

export type ReactionOptions = IReactionOptions;

export interface PersistenceStorageOptions<P> extends StorageOptions {
  name: string;
  properties: P[];
}

export interface StorageOptions {
  /**
   * @property {Boolean} [debug] When true console.info when getItem, setItem or removeItem are triggered.
   * @default false
   */
  debug?: boolean;
  /**
   * @property {Number} [expireIn] A value in milliseconds to determine when the data in storage should not be retrieved by getItem.
   *
   * Recommend the library https://github.com/henrikjoreteg/milliseconds to set the value
   */
  expireIn?: number;
  /**
   * @property {Number} [removeOnExpiration] If {@link StorageOptions#expireIn} has a value and has expired, the data in storage will be removed automatically when getItem is called. The default value is true.
   * @default true
   */
  removeOnExpiration?: boolean;
  /**
   *
   */
  storage?: StorageController;
  /**
   * @property {Boolean} [jsonify] When true the data will be JSON.stringify before being passed to setItem. The default value is true.
   * @default true
   */
  stringify?: boolean;
}

export interface StorageController {
  /**
   * The function that will retrieved the storage data by a specific identifier.
   *
   * @function
   * @param {String} key
   * @return {Promise<String | Object>}
   */
  getItem<T>(key: string): T | string | null | Promise<T | string | null>;
  /**
   * The function that will remove data from storage by a specific identifier.
   *
   * @function
   * @param {String} key
   * @return {Promise<void>}
   */
  removeItem(key: string): void | Promise<void>;
  /**
   * The function that will save data to the storage by a specific identifier.
   *
   * @function
   * @param {String} key
   * @param {String | Object} value
   * @return {Promise<void>}
   */
  setItem(key: string, value: any): void | Promise<void>;
}
