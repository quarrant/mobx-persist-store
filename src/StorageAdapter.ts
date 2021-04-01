import { StorageOptions } from './types';
import { buildExpireTimestamp, hasTimestampExpired } from './utils';

export class StorageAdapter {
  public readonly options: StorageOptions;

  constructor(options: StorageOptions) {
    this.options = options;
  }

  async setItem<T extends Record<string, unknown>>(key: string, item: T): Promise<void> {
    const { stringify = true, expireIn } = this.options;
    const data: T = expireIn
      ? Object.assign({}, item, {
          __mps__: {
            expireInTimestamp: buildExpireTimestamp(expireIn),
          },
        })
      : item;
    const content = stringify ? JSON.stringify(data) : data;

    await this.options.storage?.setItem(key, content);
  }

  async getItem<T extends Record<string, any>>(key: string): Promise<T> {
    const { removeOnExpiration = true } = this.options;
    const data = await this.options.storage?.getItem(key);
    let parsedData: T;

    try {
      parsedData = JSON.parse(data as string) || {};
    } catch (error) {
      parsedData = (data as T) || ({} as T);
    }

    const hasExpired = hasTimestampExpired(parsedData.__mps__?.expireInTimestamp);

    if (hasExpired && removeOnExpiration) {
      await this.removeItem(key);
    }

    return hasExpired ? ({} as T) : parsedData;
  }

  async removeItem(key: string): Promise<void> {
    await this.options.storage?.removeItem(key);
  }
}
