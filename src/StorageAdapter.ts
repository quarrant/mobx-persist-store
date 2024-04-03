import { StorageOptions } from './types';
import { buildExpireTimestamp, consoleDebug, hasTimestampExpired, omitObjectProperties } from './utils';

export class StorageAdapter {
  public readonly options: StorageOptions;

  constructor(options: StorageOptions) {
    this.options = options;
  }

  async setItem<T extends Record<string, unknown>>(key: string, item: T): Promise<void> {
    const { stringify = true, debugMode = false } = this.options;

    const __mps__ = omitObjectProperties(
      {
        expireInTimestamp: this.options.expireIn ? buildExpireTimestamp(this.options.expireIn) : undefined,
        version: this.options.version,
      },
      (value) => value === undefined
    );

    const data: T = Object.keys(__mps__).length
      ? Object.assign({}, item, {
          __mps__,
        })
      : item;

    const content = stringify ? JSON.stringify(data) : data;

    consoleDebug(debugMode, `${key} - setItem:`, content);

    await this.options.storage?.setItem(key, content);
  }

  async getItem<T extends Record<string, any>>(key: string): Promise<T> {
    const { removeOnExpiration = true, debugMode = false, version } = this.options;
    const storageData = await this.options.storage?.getItem(key);
    let parsedData: T;

    try {
      parsedData = JSON.parse(storageData as string) || {};
    } catch (error) {
      parsedData = (storageData as T) || ({} as T);
    }

    const hasExpired = hasTimestampExpired(parsedData.__mps__?.expireInTimestamp);

    const mismatchedVersion = version && parsedData.__mps__?.version !== version;

    consoleDebug(debugMode, `${key} - hasExpired`, hasExpired);

    consoleDebug(debugMode, `${key} - mismatchedVersion`, mismatchedVersion);

    if ((hasExpired && removeOnExpiration) || mismatchedVersion) {
      await this.removeItem(key);
    }

    parsedData = hasExpired || mismatchedVersion ? ({} as T) : parsedData;

    consoleDebug(debugMode, `${key} - (getItem):`, parsedData);

    return parsedData;
  }

  async removeItem(key: string): Promise<void> {
    const { debugMode = false } = this.options;

    consoleDebug(debugMode, `${key} - (removeItem): storage was removed`);

    await this.options.storage?.removeItem(key);
  }
}
