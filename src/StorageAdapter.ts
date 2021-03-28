import { StorageAdapterOptions } from './types';
import { buildExpireTimestamp, hasTimestampExpired } from './utils';

export class StorageAdapter {
  private readonly options: StorageAdapterOptions;

  constructor(options: StorageAdapterOptions) {
    this.options = options;
  }

  async setItem<T>(key: string, item: T): Promise<void> {
    const { jsonify = true, expiration } = this.options;
    const data = expiration
      ? Object.assign(item, {
          __mps__: {
            expireTimestamp: buildExpireTimestamp(expiration),
          },
        })
      : item;
    const content = jsonify ? JSON.stringify(data) : data;

    return this.options.setItem(key, content);
  }

  async getItem<T extends Record<string, any>>(key: string): Promise<T> {
    const { removeOnExpiration = true } = this.options;
    const data = await this.options.getItem<T>(key);
    let parsedData: T;

    try {
      parsedData = JSON.parse(data as string);
    } catch (error) {
      parsedData = (data || {}) as T;
    }

    const hasExpired = hasTimestampExpired(parsedData.__mps__?.expireTimestamp);

    if (hasExpired && removeOnExpiration) {
      await this.removeItem(key);
    }

    return hasExpired ? ({} as T) : parsedData;
  }

  async removeItem(key: string): Promise<void> {
    await this.options.removeItem(key);
  }
}
