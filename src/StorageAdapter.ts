import { StorageOptions } from './types';
import { buildExpireTimestamp, consoleDebug, hasTimestampExpired } from './utils';

export class StorageAdapter {
  public readonly options: StorageOptions;

  constructor(options: StorageOptions) {
    this.options = options;
  }

  async setItem<T extends Record<string, unknown>>(key: string, item: T): Promise<void> {
    const { stringify = true, debug = false } = this.options;
    const data: T = this.options.expireIn
      ? Object.assign({}, item, {
          __mps__: {
            expireInTimestamp: buildExpireTimestamp(this.options.expireIn),
          },
        })
      : item;
    const content = stringify ? JSON.stringify(data) : data;

    consoleDebug(debug, `${key} - setItem:`, content);

    await this.options.storage?.setItem(key, content);
  }

  async getItem<T extends Record<string, any>>(key: string): Promise<T> {
    const { removeOnExpiration = true, debug = false } = this.options;
    const storageData = await this.options.storage?.getItem(key);
    let parsedData: T;

    try {
      parsedData = JSON.parse(storageData as string) || {};
    } catch (error) {
      parsedData = (storageData as T) || ({} as T);
    }

    const hasExpired = hasTimestampExpired(parsedData.__mps__?.expireInTimestamp);

    consoleDebug(debug, `${key} - hasExpired`, hasExpired);

    if (hasExpired && removeOnExpiration) {
      await this.removeItem(key);
    }

    parsedData = hasExpired ? ({} as T) : parsedData;

    consoleDebug(debug, `${key} - (getItem):`, parsedData);

    return parsedData;
  }

  async removeItem(key: string): Promise<void> {
    const { debug = false } = this.options;

    consoleDebug(debug, `${key} - (removeItem): storage was removed`);

    await this.options.storage?.removeItem(key);
  }
}
