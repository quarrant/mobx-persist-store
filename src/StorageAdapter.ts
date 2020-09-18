import { StorageAdapterOptions } from './types';
import { JSONParse } from './utils';

export default class StorageAdapter {
  private write: StorageAdapterOptions['write'];
  private read: StorageAdapterOptions['read'];

  constructor(options: StorageAdapterOptions) {
    this.write = options.write;
    this.read = options.read;
  }

  writeInStorage<T>(name: string, content: T): Promise<void | Error> {
    return new Promise((resolve, reject) => {
      const contentString = JSON.stringify(content);
      this.write(name, contentString).then(resolve)
        .catch((error) => {
          console.warn(`StorageAdapter.writeInStorage [${name}]`, error);
          reject(error);
        });
    });
  }

  readFromStorage<T>(name: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.read(name)
        .then((content) => {
          if (!content) return resolve();

          const contentObject = JSONParse<T>(content);
          return resolve(contentObject);
        })
        .catch((error) => {
          console.warn(`StorageAdapter.readFromStorage [${name}]`, error);
          reject(error);
        });
    });
  }
}
