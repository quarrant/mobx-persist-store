import {
  action,
  IReactionDisposer,
  isAction,
  isComputedProp,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from 'mobx';
import { StorageConfiguration } from './StorageConfiguration';
import { PersistenceOptions } from './types';

export class PersistStore<T> {
  private cancelWatch: IReactionDisposer | null = null;
  private options: PersistenceOptions | null = null;
  private target: T | null = null;

  public isHydrated = false;
  public isPersisting = false;

  constructor(options: PersistenceOptions, target: T) {
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
    // If the user calls stopPersist and then rehydrateStore we don't want to automatically call startPersist below
    const isBeingWatched = Boolean(this.cancelWatch);

    this.stopPersist();

    runInAction(() => {
      this.isHydrated = false;
    });

    if (this.options && this.target) {
      const data: Record<string, unknown> | undefined = await this.options.adapter.getItem(this.options.name);

      // Reassigning so TypeScript doesn't complain (Object is possibly 'null') about this.config and this.target within forEach
      const { properties } = this.options;
      const target: any = this.target;

      if (data) {
        runInAction(() => {
          properties.forEach((propertyName: string) => {
            const allowPropertyHydration = [
              target.hasOwnProperty(propertyName),
              typeof data[propertyName] !== 'undefined',
            ].every(Boolean);

            if (allowPropertyHydration) {
              target[propertyName] = data[propertyName];
            }
          });
        });
      }
    }

    runInAction(() => {
      this.isHydrated = true;
    });

    if (isBeingWatched) {
      this.startPersist();
    }
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
        const propertiesToWatch: Record<string, unknown> = {};

        properties.forEach((propertyName: string) => {
          const isComputedProperty = isComputedProp(target, String(propertyName));
          const isActionProperty = isAction(target[propertyName]);

          if (isComputedProperty) {
            console.warn(`The property '${propertyName}'  is computed and will not persist.`);
          } else if (isActionProperty) {
            console.warn(`The property '${propertyName}'  is an action and will not persist.`);
          }

          if (!isComputedProperty && !isActionProperty) {
            propertiesToWatch[propertyName] = toJS(target[propertyName]);
          }
        });

        return propertiesToWatch;
      },
      async (dataToSave) => {
        await adapter.setItem(name, dataToSave);
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
      await this.options.adapter.setItem(this.options.name, {});
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
