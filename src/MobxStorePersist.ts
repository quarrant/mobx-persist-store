import { action, IReactionDisposer, makeObservable, observable, reaction, runInAction, toJS } from 'mobx';
import { StorageConfiguration } from './StorageConfiguration';
import { PersistenceDecoratorOptions } from './types';

export class MobxStorePersist<T> {
  private cancelWatch: IReactionDisposer | null = null;
  private options: PersistenceDecoratorOptions | null = null;
  private target: T | null = null;

  public isHydrated = false;
  public isPersisting = false;

  constructor(options: PersistenceDecoratorOptions, target: T) {
    this.options = options;
    this.target = target;

    makeObservable(
      this,
      {
        clearPersist: action,
        disposePersist: action,
        isHydrated: observable,
        isPersisting: observable,
        rehydrateStore: action,
        startPersist: action,
        stopPersist: action,
      },
      { autoBind: true, deep: false },
    );

    this.init();
  }

  private async init() {
    await this.rehydrateStore();
    this.startPersist();
  }

  public async rehydrateStore(): Promise<void> {
    runInAction(() => {
      this.isHydrated = false;
    });

    if (this.options && this.target) {
      const data: Record<string, unknown> | undefined = await this.options.adapter.readFromStorage(this.options.name);

      // Reassigning so TypeScript doesn't complain (Object is possibly 'null') about this.config and this.target within forEach
      const { properties } = this.options;
      const target: any = this.target;

      if (data) {
        properties.forEach((propertyName: string) => {
          if (target.hasOwnProperty(propertyName) && typeof data[propertyName] !== 'undefined') {
            runInAction(() => {
              target[propertyName] = data[propertyName];
            });
          }
        });
      }
    }

    runInAction(() => {
      this.isHydrated = true;
    });
  }

  public startPersist(): void {
    if (!this.options || !this.target || this.cancelWatch) {
      return;
    }

    // Reassigning so TypeScript doesn't complain (Object is possibly 'null') about this.config and this.target within reaction
    const { properties, adapter, name } = this.options;
    const target: any = this.target;

    this.cancelWatch = reaction(
      () => {
        const obj: Record<string, unknown> = {};

        properties.forEach((propName: string) => {
          obj[propName] = toJS(target[propName]);
        });

        return obj;
      },
      async (dataToSave) => {
        await adapter.writeInStorage(name, dataToSave);
      },
    );

    this.isPersisting = true;
  }

  public stopPersist(): void {
    this.isPersisting = false;

    if (this.cancelWatch) {
      this.cancelWatch();
      this.cancelWatch = null;
    }
  }

  public async clearPersist(): Promise<void> {
    if (this.options?.adapter) {
      await this.options.adapter.writeInStorage(this.options.name, {});
    }
  }

  public disposePersist(): void {
    this.stopPersist();

    StorageConfiguration.delete(this.target);

    this.cancelWatch = null;
    this.options = null;
    this.target = null;
  }
}
