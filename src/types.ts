import { IAutorunOptions } from 'mobx';
import { SerializableProperty } from './serializableProperty';

export type ReactionOptions = IAutorunOptions & { fireImmediately?: boolean };

export interface PersistenceStorageOptions<T, P extends keyof T> extends StorageOptions {
  name: string;
  version?: number;
  properties: (P | SerializableProperty<T, P>)[];
}

export interface StorageOptions {
  /**
   * @property {Boolean} [debugMode] When true console.info when getItem, setItem or removeItem are triggered.
   * @default false
   */
  debugMode?: boolean;
  /**
   * @property {Number} [expireIn] A value in milliseconds to determine when the data in storage should not be retrieved by getItem.
   *
   * Recommend the library https://github.com/henrikjoreteg/milliseconds to set the value
   */
  expireIn?: number;
  /**
   * @property {Boolean} [removeOnExpiration] If {@link StorageOptions#expireIn} has a value and has expired, the data in storage will be removed automatically when getItem is called. The default value is true.
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

  /**
   * @property {number} [version] When specified, the data will be automatically removed from the storage if the versions don't match. By default, there is no version.
   */
  version?: number;
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
